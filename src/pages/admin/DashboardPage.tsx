import React, { useState, useMemo, createContext, useContext } from 'react';
import { 
    Car, Wrench, User, DollarSign, PlusCircle, CheckCircle, Trash2, X, ClipboardList, 
    Home, Receipt, LayoutDashboard, Utensils, Zap, Clock, TrendingUp, TrendingDown, Printer, FileText, Sparkles 
} from 'lucide-react';
// import { GoogleGenerativeAI } from "@google/generative-ai"; // DEPRECATED: This is a legacy component

// --- 1. Tipos de Datos Globales ---

type PageName = 'login' | 'dashboard' | 'checkin' | 'expenses' | 'vouchers';

interface Service {
    id: number;
    name: string;
    price: number;
    durationMinutes: number;
    isParking: boolean;
}

interface Transaction {
    id: string;
    plate: string;
    customerName: string;
    status: 'IN_SERVICE' | 'PENDING_PAYMENT' | 'COMPLETED';
    services: { name: string, price: number, quantity: number }[];
    assignedWasherId: number | null;
    checkinTime: Date;
    checkoutTime: Date | null;
    totalAmount: number;
    invoiceId?: string;
}

interface Invoice {
    id: string;
    transactionId: string;
    plate: string;
    date: Date;
    amount: number;
    items: { description: string, amount: number }[];
}

interface Expense {
    id: string;
    category: 'Suministros' | 'Reparaciones' | 'Servicios' | 'Otros';
    amount: number;
    description: string;
    date: Date;
}

interface Voucher {
    id: string;
    washerId: number;
    amount: number;
    description: string;
    installments: number;
    date: Date;
}

// --- 2. Contexto de Estado Global Simulado ---

interface PmsContextType {
    isLoggedIn: boolean;
    login: (pin: string) => void;
    logout: () => void;
    transactions: Transaction[];
    expenses: Expense[];
    vouchers: Voucher[];
    invoices: Invoice[];
    addTransaction: (tx: Omit<Transaction, 'id' | 'status' | 'checkinTime' | 'checkoutTime' | 'totalAmount'>, isParkingOnly: boolean) => void;
    completeTransaction: (id: string) => void;
    addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
    addVoucher: (voucher: Omit<Voucher, 'id' | 'date'>) => void;
}

const PmsContext = createContext<PmsContextType | undefined>(undefined);

const usePmsState = () => {
    const context = useContext(PmsContext);
    if (!context) {
        throw new Error("usePmsState must be used within a PmsProvider");
    }
    return context;
};

// --- 3. Datos de Simulación ---

const AVAILABLE_SERVICES: Service[] = [
    { id: 1, name: 'Lavado Básico Exterior', price: 15000, durationMinutes: 20, isParking: false },
    { id: 2, name: 'Lavado Premium Interior y Exterior', price: 35000, durationMinutes: 45, isParking: false },
    { id: 3, name: 'Parqueo por Hora', price: 5000, durationMinutes: 60, isParking: true },
    { id: 4, name: 'Aspirado Express', price: 5000, durationMinutes: 10, isParking: false },
    { id: 5, name: 'Desinfección Total', price: 20000, durationMinutes: 15, isParking: false },
    { id: 6, name: 'Polichado', price: 45000, durationMinutes: 60, isParking: false },
];

const AVAILABLE_WASHERS = [
    { id: 101, name: 'Juan Pérez (A)', isAvailable: true },
    { id: 102, name: 'María López (B)', isAvailable: true },
    { id: 103, name: 'Carlos Ruiz (C)', isAvailable: false }, 
    { id: 104, name: 'Elena Gómez (D)', isAvailable: true },
];

// --- 4. Proveedor de Contexto ---

const PmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    const login = (pin: string) => {
        if (pin.length === 4) setIsLoggedIn(true);
    };

    const logout = () => {
        setIsLoggedIn(false);
    };

    const addTransaction = (txData: any, isParkingOnly: boolean) => {
        const id = 'TX-' + (transactions.length + 1).toString().padStart(3, '0');
        const totalAmount = txData.services.reduce((sum: number, s: any) => sum + (s.price * s.quantity), 0);
        
        const newTx: Transaction = {
            ...txData,
            id,
            status: 'IN_SERVICE',
            checkinTime: new Date(),
            checkoutTime: null,
            totalAmount, 
        };
        setTransactions(prev => [...prev, newTx]);
    };

    const completeTransaction = (id: string) => {
        setTransactions(prev => {
            const txIndex = prev.findIndex(t => t.id === id);
            if (txIndex === -1) return prev;

            const tx = prev[txIndex];
            const invoiceId = 'INV-' + Date.now().toString().slice(-6);
            
            const newInvoice: Invoice = {
                id: invoiceId,
                transactionId: tx.id,
                plate: tx.plate,
                date: new Date(),
                amount: tx.totalAmount,
                items: tx.services.map(s => ({ description: s.name, amount: s.price * s.quantity }))
            };

            setInvoices(prevInv => [newInvoice, ...prevInv]);

            const updatedTx = { ...tx, status: 'COMPLETED' as const, checkoutTime: new Date(), invoiceId };
            const newTransactions = [...prev];
            newTransactions[txIndex] = updatedTx;
            return newTransactions;
        });
    };

    const addExpense = (exp: any) => {
        const id = 'EXP-' + (expenses.length + 1).toString().padStart(3, '0');
        setExpenses(prev => [...prev, { ...exp, id, date: new Date() }]);
    };

    const addVoucher = (vch: any) => {
        const id = 'VCH-' + (vouchers.length + 1).toString().padStart(3, '0');
        setVouchers(prev => [...prev, { ...vch, id, date: new Date() }]);
    };

    const value = {
        isLoggedIn, login, logout, transactions, expenses, vouchers, invoices,
        addTransaction, completeTransaction, addExpense, addVoucher,
    };

    return <PmsContext.Provider value={value}>{children}</PmsContext.Provider>;
};

// --- 5. Componentes de la Interfaz ---

// --- 5.1 Menu ---
const Menu: React.FC<{currentPage: PageName, setPage: (page: PageName) => void}> = ({ currentPage, setPage }) => {
    const { logout } = usePmsState();
    const navItems = [
        { name: 'Dashboard', icon: Home, page: 'dashboard' as PageName },
        { name: 'Check-in (Servicio)', icon: Car, page: 'checkin' as PageName },
        { name: 'Registrar Gasto', icon: DollarSign, page: 'expenses' as PageName },
        { name: 'Vales y Facturas', icon: Receipt, page: 'vouchers' as PageName },
    ];

    return (
        <nav className="bg-gradient-to-b from-gray-900 to-gray-800 text-white w-64 min-h-screen p-4 flex flex-col shadow-2xl">
            <div className="text-xl font-bold mb-8 flex items-center text-yellow-400 border-b border-gray-700 pb-4">
                <Wrench className="w-6 h-6 mr-2" /> PMS Simulación
            </div>
            <ul className="space-y-3 flex-grow">
                {navItems.map(item => (
                    <li key={item.name}>
                        <button
                            onClick={() => setPage(item.page)}
                            className={`w-full text-left p-3 rounded-lg flex items-center transition-all duration-200 ${
                                currentPage === item.page 
                                    ? 'bg-yellow-500 text-gray-900 font-bold shadow-lg scale-105' 
                                    : 'hover:bg-gray-700 text-gray-100 hover:text-white'
                            }`}
                        >
                            <item.icon className="w-5 h-5 mr-3" /> {item.name}
                        </button>
                    </li>
                ))}
            </ul>
            <div className="border-t border-gray-700 pt-4 mt-4">
                <button onClick={logout} className="w-full text-left p-3 rounded-lg flex items-center text-red-400 hover:bg-red-500/20 transition-colors hover:text-red-300 font-semibold">
                    <X className="w-5 h-5 mr-3" /> Cerrar Sesión
                </button>
            </div>
        </nav>
    );
};

// --- 5.2 Login ---
const LoginPage: React.FC = () => {
    const { login } = usePmsState();
    const [pin, setPin] = useState('');
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-xl shadow-black/50 border-t-4 border-yellow-500 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Acceso PMS</h2>
                <input 
                    type="password" placeholder="PIN (1234)" maxLength={4} value={pin} 
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full text-center text-3xl font-mono py-4 border-2 border-gray-600 rounded-lg focus:border-yellow-500 mb-4 bg-gray-700 text-white"
                />
                <button onClick={() => login(pin)} className="w-full bg-yellow-500 text-gray-900 font-bold py-3 rounded-xl hover:bg-yellow-600 transition">
                    Ingresar
                </button>
            </div>
        </div>
    );
};

// --- 5.3 Check-in con Gemini AI ---
const CheckinPage: React.FC = () => {
    const { addTransaction } = usePmsState();
    const [plate, setPlate] = useState('');
    const [selectedServices, setSelectedServices] = useState<any[]>([]);
    const [assignedWasherId, setAssignedWasherId] = useState<number | null>(null);
    const [isParkingOnly, setIsParkingOnly] = useState(false);
    const [vehicleDescription, setVehicleDescription] = useState('');
    const [aiSuggestion, setAiSuggestion] = useState('');

    // Gemini AI Integration (DEPRECATED)
    const handleAiSuggestion = async () => {
        /*
        if (!vehicleDescription.trim()) return;
        
        setIsAiLoading(true);
        setAiSuggestion('');
        
        try {
            const apiKey = ""; // Environment variable in real implementation
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });

            const serviceNames = AVAILABLE_SERVICES.map(s => s.name).join(', ');
            const prompt = `Actúa como un experto en lavado de autos. Tengo un vehículo con esta descripción: "${vehicleDescription}". 
            Mis servicios disponibles son: ${serviceNames}.
            Recomiéndame qué servicios de la lista debería ofrecer al cliente y por qué. Sé breve y persuasivo. Responde en español.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            setAiSuggestion(response.text());
        } catch (error) {
            console.error("Error calling Gemini:", error);
            setAiSuggestion("Lo siento, no pude conectar con el asistente inteligente en este momento.");
        } finally {
            setIsAiLoading(false);
        }
        */
        setAiSuggestion("Funcionalidad de IA deshabilitada en esta versión.");
    };

    const handleAdd = (service: any) => {
        setSelectedServices(prev => {
            const existing = prev.find(s => s.id === service.id);
            if (existing) {
                // For simplicity, we just add it again as a separate entry to allow different services of the same type
                return [...prev, { ...service, quantity: 1, uniqueId: Date.now() + Math.random() }];
            }
            return [...prev, { ...service, quantity: 1, uniqueId: Date.now() + Math.random() }];
        });
    };
    
    // Function to remove a selected service
    const handleRemove = (uniqueId: number) => {
        setSelectedServices(prev => prev.filter(s => s.uniqueId !== uniqueId));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addTransaction({ 
            plate: plate.toUpperCase(), 
            customerName: '', 
            services: selectedServices.map(s => ({ name: s.name, price: s.price, quantity: s.quantity })),
            assignedWasherId: assignedWasherId,
        }, isParkingOnly);
        // Using console.log instead of alert to adhere to instructions
        console.log('Servicio Registrado Exitosamente');
        setPlate(''); setSelectedServices([]); setVehicleDescription(''); setAiSuggestion('');
    };

    return (
        <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <div className="mb-6">
                <h1 className="text-4xl font-bold text-gray-900">🚗 Nuevo Check-in</h1>
                <p className="text-gray-600 mt-1">Registra un nuevo vehículo y selecciona los servicios</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Columna Izquierda: Datos y Servicios */}
                <div className="col-span-2 space-y-6">
                    
                    {/* Panel AI Assistant */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-lg border-2 border-purple-300">
                        <h2 className="font-bold text-lg mb-2 text-purple-700 flex items-center">
                            <Sparkles className="w-5 h-5 mr-2" /> ✨ Asistente de Recepción
                        </h2>
                        <p className="text-sm text-gray-700 mb-3">Describe el estado del vehículo para sugerir servicios.</p>
                        
                        <div className="flex gap-2 mb-3">
                            <input 
                                type="text" 
                                placeholder="Ej: Camioneta con mucho barro..." 
                                value={vehicleDescription}
                                onChange={e => setVehicleDescription(e.target.value)}
                                className="flex-1 p-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 placeholder-gray-500"
                            />
                            <button 
                                onClick={handleAiSuggestion}
                                disabled={!vehicleDescription}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 flex items-center"
                            >
                                {'✨ Sugerir'}
                            </button>
                        </div>
                        
                        {aiSuggestion && (
                            <div className="bg-white p-4 rounded-lg border-2 border-purple-300 text-sm text-gray-800 animate-in fade-in">
                                <p className="font-semibold text-purple-700 mb-1">💡 Recomendación:</p>
                                {aiSuggestion}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500">
                        <h2 className="font-bold text-xl mb-4 text-gray-900">📋 Datos del Vehículo</h2>
                        <input 
                            type="text" 
                            placeholder="PLACA" 
                            value={plate} 
                            onChange={e => setPlate(e.target.value)} 
                            className="w-full p-3 border-2 border-blue-300 rounded-lg mb-4 uppercase font-bold text-gray-900 bg-blue-50 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 

                        />
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            {AVAILABLE_SERVICES.map(s => (
                                <button key={s.id} type="button" onClick={() => handleAdd(s)} className="p-3 border-2 border-blue-300 rounded-lg bg-blue-50 hover:bg-blue-100 text-left transition shadow-md hover:shadow-lg">
                                    <div className="font-bold text-gray-900">{s.name}</div>
                                    <div className="text-sm text-blue-600 font-semibold">${s.price.toLocaleString()}</div>
                                    <div className="text-xs text-gray-600 mt-1">⏱️ {s.durationMinutes} min</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Resumen */}
                <div className="bg-white p-6 rounded-xl shadow-lg h-fit border-t-4 border-green-500 sticky top-8">
                    <h2 className="font-bold text-xl mb-4 text-gray-900 flex items-center">💼 Resumen de Servicios</h2>
                    <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                        {selectedServices.map((s, i) => (
                            <div key={s.uniqueId || i} className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-l-4 border-green-500">
                                <div className="flex-1">
                                    <span className="font-semibold text-gray-900 text-sm">{s.name}</span>
                                </div>
                                <span className="font-bold text-green-700 mr-2">${s.price.toLocaleString()}</span>
                                <button type="button" onClick={() => handleRemove(s.uniqueId)} className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded transition">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {selectedServices.length === 0 && <p className="text-gray-500 italic text-center py-8">No hay servicios seleccionados</p>}
                    </div>

                    {selectedServices.length > 0 && (
                        <div className="bg-green-100 border-2 border-green-500 p-4 rounded-lg mb-4">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-900">Total:</span>
                                <span className="text-2xl font-bold text-green-700">${selectedServices.reduce((sum, s) => sum + s.price, 0).toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 border-t border-gray-200 pt-4">
                        <label className="block text-sm font-bold mb-2 text-gray-900">👤 Asignar Lavador</label>
                        <select 
                            className="w-full p-3 border-2 border-green-300 rounded-lg bg-white text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200" 
                            onChange={e => setAssignedWasherId(parseInt(e.target.value))}
                        >
                            <option value="">Seleccionar...</option>
                            {AVAILABLE_WASHERS.map(w => (
                                <option key={w.id} value={w.id}>
                                    {w.name} {w.isAvailable ? '✅' : '🔴'}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button 
                        onClick={handleSubmit} 
                        disabled={selectedServices.length === 0 || !plate || !assignedWasherId}
                        className="w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:from-green-600 hover:to-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 duration-200"
                    >
                        ✅ Confirmar Entrada (${selectedServices.reduce((sum, s) => sum + s.price, 0).toLocaleString()})
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 5.4 Expenses ---
const ExpensePage: React.FC = () => {
    const { addExpense, expenses } = usePmsState();
    const [amount, setAmount] = useState(0);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Suministros');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addExpense({ category: category as any, amount, description: description || 'Gasto rápido' });
        console.log('Gasto registrado');
        setAmount(0);
        setDescription('');
    };

    return (
        <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <div className="mb-6">
                <h1 className="text-4xl font-bold text-gray-900">💸 Registrar Gasto</h1>
                <p className="text-gray-600 mt-1">Controla los gastos operacionales del negocio</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulario */}
                <form onSubmit={handleSubmit} className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-red-500">
                        <div className="mb-4">
                            <label className="block mb-2 font-bold text-gray-900">💰 Monto</label>
                            <input 
                                type="number" 
                                value={amount} 
                                onChange={e => setAmount(parseFloat(e.target.value))} 
                                placeholder="0"
                                className="w-full p-3 border-2 border-red-300 rounded-lg bg-red-50 text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 font-bold text-gray-900">📝 Descripción</label>
                            <input 
                                type="text" 
                                value={description} 
                                onChange={e => setDescription(e.target.value)} 
                                placeholder="Motivo del gasto"
                                className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block mb-2 font-bold text-gray-900">📂 Categoría</label>
                            <select 
                                value={category} 
                                onChange={e => setCategory(e.target.value)} 
                                className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            >
                                {['Suministros', 'Reparaciones', 'Servicios', 'Otros'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:from-red-600 hover:to-red-700 transition transform hover:scale-105">
                            💸 Registrar Gasto
                        </button>
                    </div>
                </form>

                {/* Historial de Gastos */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            📊 Historial de Gastos
                            <span className="ml-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">{expenses.length}</span>
                        </h2>
                        {expenses.length === 0 ? (
                            <div className="text-center py-12">
                                <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">No hay gastos registrados</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {[...expenses].reverse().map((expense, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border-l-4 border-orange-500 hover:shadow-md transition">
                                        <div className="flex-grow">
                                            <div className="font-bold text-gray-900">{expense.description}</div>
                                            <div className="text-xs text-gray-600 mt-1">📂 {expense.category} • 📅 {expense.date.toLocaleDateString()}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-red-700">${expense.amount.toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {expenses.length > 0 && (
                            <div className="mt-4 border-t border-gray-200 pt-4">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span className="text-gray-900">Total Gastos:</span>
                                    <span className="text-red-700">${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const VoucherPage: React.FC = () => {
    const { addVoucher, invoices } = usePmsState(); // Accedemos a las facturas generadas
    const [washerId, setWasherId] = useState<number | null>(null);
    const [amount, setAmount] = useState<number>(0);
    const [activeTab, setActiveTab] = useState<'vouchers' | 'invoices'>('invoices'); // Tabs para cambiar vista

    const handleVoucherSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!washerId || amount <= 0) return;
        addVoucher({ washerId, amount, description: 'Adelanto', installments: 1 });
        alert('Vale creado');
        setAmount(0);
    };

    const handlePrintInvoice = (invoice: Invoice) => {
        // Simulación de impresión de PDF
        const printContent = `
            FACTURA DE VENTA - PMS
            ----------------------
            Factura #: ${invoice.id}
            Fecha: ${invoice.date.toLocaleString()}
            Cliente/Placa: ${invoice.plate}
            ----------------------
            ${invoice.items.map(i => `${i.description} - $${i.amount}`).join('\n')}
            ----------------------
            TOTAL: $${invoice.amount.toLocaleString()}
        `;
        // Abrimos una ventana nueva para simular el PDF
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(`<pre>${printContent}</pre>`);
            newWindow.document.write('<script>window.print();</script>');
            newWindow.document.close();
        } else {
            alert(printContent);
        }
    };

    return (
        <div className="p-8 bg-white min-h-screen w-full">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Gestión Financiera y Facturación</h1>
            
            <div className="flex space-x-4 mb-6">
                <button onClick={() => setActiveTab('invoices')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeTab === 'invoices' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>📄 Facturas de Clientes</button>
                <button onClick={() => setActiveTab('vouchers')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeTab === 'vouchers' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>💰 Vales de Empleados</button>
            </div>

            {activeTab === 'invoices' && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl shadow-lg border-l-4 border-green-500">
                    <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900"><FileText className="mr-3 text-green-600" /> Facturas Generadas (Check-out)</h2>
                    {invoices.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-700 text-lg">📋 No se han generado facturas aún.</p>
                            <p className="text-gray-600 mt-2">Realiza un Check-out en el Dashboard para generar una factura.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {invoices.map(inv => (
                                <div key={inv.id} className="flex justify-between items-center p-4 bg-white rounded-lg border-2 border-gray-300 hover:border-green-500 hover:shadow-lg transition-all">
                                    <div>
                                        <p className="font-bold text-gray-900 text-lg">{inv.id}</p>
                                        <p className="text-sm text-gray-700">Placa: <span className="font-semibold">{inv.plate}</span></p>
                                        <p className="text-xs text-gray-600 mt-1">{inv.date.toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-green-600 text-xl">${inv.amount.toLocaleString()}</span>
                                        <button 
                                            onClick={() => handlePrintInvoice(inv)}
                                            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors shadow-md"
                                        >
                                            <Printer className="w-5 h-5" /> Imprimir PDF
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'vouchers' && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-xl shadow-lg border-l-4 border-purple-600 max-w-2xl">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">💳 Crear Nuevo Vale</h2>
                    <form onSubmit={handleVoucherSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
                        <div>
                            <label className="block mb-2 font-bold text-gray-800">Empleado</label>
                            <select className="w-full p-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-medium hover:border-purple-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-300" onChange={e => setWasherId(parseInt(e.target.value))}>
                                <option className="text-gray-600">Seleccionar...</option>
                                {AVAILABLE_WASHERS.map(w => <option key={w.id} value={w.id} className="text-gray-900">{w.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 font-bold text-gray-800">Monto del Adelanto</label>
                            <input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} className="w-full p-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-semibold hover:border-purple-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-300" placeholder="$0.00" />
                        </div>
                        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md mt-6">Crear Vale</button>
                    </form>
                </div>
            )}
        </div>
    );
};

// --- 5.6 Dashboard ---
const DashboardPage: React.FC<{ setPage: (page: PageName) => void }> = ({ setPage }) => {
    const { transactions, expenses, completeTransaction } = usePmsState();
    const activeTxs = transactions.filter(t => t.status === 'IN_SERVICE');
    
    const totalIncome = transactions.filter(t => t.status === 'COMPLETED').reduce((sum, t) => sum + t.totalAmount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalIncome - totalExpense;

    const handleCheckout = (id: string) => {
        // Replaced window.confirm with a custom log/alert to adhere to instructions
        if (true) { // Simulate confirmation being true
            completeTransaction(id); 
            console.log("Cobro exitoso. La factura está disponible en la sección 'Vales y Facturas'.");
            alert("Cobro exitoso. La factura está disponible en la sección 'Vales y Facturas'.");
        }
    };

    return (
        <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">📊 Dashboard de Control</h1>
                    <p className="text-gray-600 mt-1">Bienvenido al sistema de gestión de parqueo y lavado</p>
                </div>
                <button onClick={() => setPage('checkin')} className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 flex items-center transform hover:scale-105">
                    <Car className="w-5 h-5 mr-2"/> + Nuevo Servicio
                </button>
            </div>

            {/* Tarjetas de Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg border-2 border-green-300 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-gray-700 font-semibold text-sm">💰 Ingresos Totales</h3>
                        <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-green-700">${totalIncome.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-2">{transactions.filter(t => t.status === 'COMPLETED').length} completados</p>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-lg border-2 border-red-300 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-gray-700 font-semibold text-sm">💸 Gastos Totales</h3>
                        <TrendingDown className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-3xl font-bold text-red-700">${totalExpense.toLocaleString()}</p>
                    <p className="text-xs text-red-600 mt-2">{expenses.length} registrados</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg border-2 border-blue-300 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-gray-700 font-semibold text-sm">🚗 Activos Ahora</h3>
                        <Car className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-blue-700">{activeTxs.length}</p>
                    <p className="text-xs text-blue-600 mt-2">pendientes de cobro</p>
                </div>

                <div className={`bg-gradient-to-br ${netProfit >= 0 ? 'from-purple-50 to-purple-100 border-purple-300' : 'from-orange-50 to-orange-100 border-orange-300'} p-6 rounded-xl shadow-lg border-2 hover:shadow-xl transition-all`}>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-gray-700 font-semibold text-sm">📈 Ganancia Neta</h3>
                        <Zap className={`w-5 h-5 ${netProfit >= 0 ? 'text-purple-600' : 'text-orange-600'}`} />
                    </div>
                    <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-purple-700' : 'text-orange-700'}`}>${netProfit.toLocaleString()}</p>
                    <p className={`text-xs mt-2 ${netProfit >= 0 ? 'text-purple-600' : 'text-orange-600'}`}>{netProfit >= 0 ? '✅ Positivo' : '⚠️ Negativo'}</p>
                </div>
            </div>

            {/* Tabla de Servicios en Curso */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-400">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">🛠️ Servicios en Curso</h2>
                    <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold">{activeTxs.length} activos</span>
                </div>
                {activeTxs.length === 0 ? (
                    <div className="text-center py-12">
                        <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg font-medium">No hay servicios activos en este momento</p>
                        <p className="text-gray-400 text-sm mt-2">Los servicios aparecerán aquí cuando registres un nuevo check-in</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {activeTxs.map((tx, index) => (
                            <div key={tx.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border-2 border-gray-200 hover:border-yellow-400 hover:shadow-md transition-all group">
                                <div className="flex items-center flex-grow">
                                    <div className="bg-yellow-100 text-yellow-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-4">{index + 1}</div>
                                    <div>
                                        <span className="font-bold text-lg text-gray-900">{tx.plate}</span>
                                        <span className="text-xs text-gray-500 ml-3">⏱️ {tx.services.length} servicio(s)</span>
                                        <div className="mt-1 flex gap-2">
                                            {tx.services.slice(0, 3).map((s, i) => (
                                                <span key={i} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                                    {s.name.split(' ')[0]}
                                                </span>
                                            ))}
                                            {tx.services.length > 3 && <span className="text-xs text-gray-500">+{tx.services.length - 3}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <span className="font-bold text-green-600 text-xl">${tx.totalAmount.toLocaleString()}</span>
                                        <p className="text-xs text-gray-500">Total</p>
                                    </div>
                                    <button 
                                        onClick={() => handleCheckout(tx.id)} 
                                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 flex items-center whitespace-nowrap"
                                    >
                                        <DollarSign className="w-4 h-4 mr-1"/> Cobrar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 6. Router ---
const AppRouter: React.FC = () => {
    const { isLoggedIn } = usePmsState();
    const [currentPage, setCurrentPage] = useState<PageName>('login');

    React.useEffect(() => {
        if (isLoggedIn && currentPage === 'login') setCurrentPage('dashboard');
        if (!isLoggedIn) setCurrentPage('login');
    }, [isLoggedIn]);

    if (!isLoggedIn) return <LoginPage />;

    return (
        <div className="flex bg-gray-100 min-h-screen w-full">
            <Menu currentPage={currentPage} setPage={setCurrentPage} />
            <main className="flex-1 overflow-y-auto max-h-screen bg-gray-100">
                {currentPage === 'dashboard' && <DashboardPage setPage={setCurrentPage} />}
                {currentPage === 'checkin' && <CheckinPage />}
                {currentPage === 'expenses' && <ExpensePage />}
                {currentPage === 'vouchers' && <VoucherPage />}
            </main>
        </div>
    );
};

const App: React.FC = () => <PmsProvider><AppRouter /></PmsProvider>;

export default App;