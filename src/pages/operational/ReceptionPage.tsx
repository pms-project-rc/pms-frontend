import React, { useState, useMemo } from 'react';

// --- 1. Definiciones de Datos y Tipos ---

// Tipos de Vehículos y Servicios (datos simulados)
const VEHICLE_TYPES = ['Carro', 'Camioneta', 'Moto', 'Buseta'];
const SERVICE_OPTIONS: { [key: string]: { name: string, price: number }[] } = {
    Carro: [
        { name: 'Lavado Básico', price: 15000 },
        { name: 'Lavado General (Interior y Exterior)', price: 25000 },
        { name: 'Lavado de Motor', price: 10000 },
    ],
    Camioneta: [
        { name: 'Lavado Básico', price: 20000 },
        { name: 'Lavado General', price: 30000 },
        { name: 'Polichado', price: 50000 },
    ],
    Moto: [
        { name: 'Lavado Básico', price: 8000 },
        { name: 'Lavado Detallado', price: 15000 },
    ],
    Buseta: [
        { name: 'Lavado Exterior', price: 40000 },
    ],
};

const WASHERS = [
    { id: 1, name: 'Juan Pérez' },
    { id: 2, name: 'Ana Vélez' },
    { id: 3, name: 'Carlos Díaz' },
    // N/A para no asignar por el momento
    { id: 99, name: 'Pendiente Asignar' }, 
];

// Interfaz para un Item en el Carrito de Servicios
interface CartItem {
    id: number;
    name: string;
    price: number;
}

// Interfaz para el estado completo de la recepción
interface ReceptionState {
    placa: string;
    vehicleType: string;
    clientName: string;
    washerId: number | null;
    services: CartItem[];
    notes: string;
}


// --- 2. Componente Principal ---

const ReceptionPage: React.FC = () => {
    const [receptionData, setReceptionData] = useState<ReceptionState>({
        placa: '',
        vehicleType: VEHICLE_TYPES[0], // Carro por defecto
        clientName: '',
        washerId: WASHERS[3].id, // 'Pendiente Asignar' por defecto
        services: [],
        notes: '',
    });

    // Calcula el total del servicio
    const totalCost = useMemo(() => {
        return receptionData.services.reduce((sum, item) => sum + item.price, 0);
    }, [receptionData.services]);

    // Manejador genérico de cambios de input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setReceptionData(prev => ({
            ...prev,
            [name]: name === 'washerId' ? parseInt(value, 10) : value.toUpperCase()
        }));
    };

    // Añadir un servicio al carrito
    const handleAddService = (service: { name: string, price: number }) => {
        setReceptionData(prev => ({
            ...prev,
            services: [...prev.services, { ...service, id: Date.now() + Math.random() }]
        }));
    };

    // Eliminar un servicio del carrito
    const handleRemoveService = (id: number) => {
        setReceptionData(prev => ({
            ...prev,
            services: prev.services.filter(item => item.id !== id)
        }));
    };

    // Manejar la finalización del registro
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (receptionData.placa.length < 3) {
            alert('Por favor, ingrese una placa válida.');
            return;
        }
        if (receptionData.services.length === 0) {
            alert('Debe seleccionar al menos un servicio.');
            return;
        }

        // Simulación del envío de la orden
        const finalData = {
            ...receptionData,
            totalCost: totalCost,
            washerName: WASHERS.find(w => w.id === receptionData.washerId)?.name,
            time: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString(),
        };

        console.log("Orden de Servicio Registrada:", finalData);
        alert(`¡Orden para ${finalData.placa} por $${finalData.totalCost.toLocaleString()} ha sido registrada en el Tablero Kanban!`);
        // En una app real, aquí se llamaría a Firestore para crear el documento de la orden
        // y se redirigiría al Dashboard Operativo.
        
        // Resetear el formulario para una nueva recepción
        setReceptionData({
            placa: '',
            vehicleType: VEHICLE_TYPES[0],
            clientName: '',
            washerId: WASHERS[3].id,
            services: [],
            notes: '',
        });
    };

    // Opciones de servicio filtradas por el tipo de vehículo seleccionado
    const availableServices = SERVICE_OPTIONS[receptionData.vehicleType] || [];


    // --- 3. Renderizado de la Vista ---
    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-4 border-yellow-500 pb-1 inline-block">
                Recepción Unificada de Vehículos
            </h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Columna 1 & 2: Formulario de Registro y Selección de Servicios */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Sección 1: Datos del Vehículo */}
                    <SectionCard title="1. Datos del Vehículo y Cliente" icon="fa-solid fa-car-side">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField 
                                label="Placa del Vehículo"
                                name="placa"
                                value={receptionData.placa}
                                onChange={handleChange}
                                placeholder="Ej: ABC-123"
                                maxLength={10}
                                required
                            />
                            <SelectField
                                label="Tipo de Vehículo"
                                name="vehicleType"
                                value={receptionData.vehicleType}
                                onChange={handleChange}
                                options={VEHICLE_TYPES}
                            />
                            <InputField 
                                label="Nombre del Cliente (Opcional)"
                                name="clientName"
                                value={receptionData.clientName}
                                onChange={handleChange}
                                placeholder="Ej: Pedro García"
                            />
                        </div>
                    </SectionCard>

                    {/* Sección 2: Selección de Servicios */}
                    <SectionCard title="2. Seleccionar Servicios" icon="fa-solid fa-hand-sparkles">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {availableServices.map((service, index) => (
                                <ServiceButton 
                                    key={index}
                                    service={service}
                                    onClick={() => handleAddService(service)}
                                />
                            ))}
                        </div>
                    </SectionCard>

                    {/* Sección 3: Asignación y Notas */}
                    <SectionCard title="3. Asignación y Notas" icon="fa-solid fa-user-tag">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectField
                                label="Asignar Lavador Inicial"
                                name="washerId"
                                value={receptionData.washerId || ''}
                                onChange={handleChange}
                                options={WASHERS.map(w => ({ label: w.name, value: w.id.toString() }))}
                            />
                            <TextAreaField
                                label="Notas Operativas"
                                name="notes"
                                value={receptionData.notes}
                                onChange={handleChange}
                                placeholder="Indicar daños preexistentes o instrucciones especiales..."
                            />
                        </div>
                    </SectionCard>
                </div>

                {/* Columna 3: Carrito de Servicios y Resumen de Cobro (Sticky) */}
                <div className="lg:col-span-1">
                    <CartSummary 
                        services={receptionData.services}
                        totalCost={totalCost}
                        onRemove={handleRemoveService}
                        onSubmit={handleSubmit}
                        placa={receptionData.placa}
                    />
                </div>
            </form>
        </div>
    );
}

export default ReceptionPage;


// --- 4. Subcomponentes Reutilizables ---

// Tarjeta de Sección con Título e Icono
const SectionCard: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-yellow-500">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <i className={`${icon} text-yellow-500 mr-3`}></i>
            {title}
        </h2>
        {children}
    </div>
);

// Input Field Reutilizable
const InputField: React.FC<any> = ({ label, name, value, onChange, placeholder, required = false, maxLength }) => (
    <div className="flex flex-col">
        <label htmlFor={name} className="text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            id={name}
            name={name}
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            maxLength={maxLength}
            required={required}
            className="p-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 transition duration-150"
        />
    </div>
);

// Select Field Reutilizable
const SelectField: React.FC<any> = ({ label, name, value, onChange, options }) => (
    <div className="flex flex-col">
        <label htmlFor={name} className="text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="p-3 border border-gray-300 bg-white rounded-lg focus:ring-yellow-500 focus:border-yellow-500 transition duration-150 appearance-none"
        >
            {options.map((option: any) => (
                <option key={option.value || option} value={option.value || option}>
                    {option.label || option}
                </option>
            ))}
        </select>
    </div>
);

// Text Area Field Reutilizable
const TextAreaField: React.FC<any> = ({ label, name, value, onChange, placeholder }) => (
    <div className="flex flex-col">
        <label htmlFor={name} className="text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <textarea
            id={name}
            name={name}
            rows={3}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="p-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 transition duration-150"
        />
    </div>
);

// Botón de Servicio Añadir al Carrito
const ServiceButton: React.FC<{ service: { name: string, price: number }; onClick: () => void }> = ({ service, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="flex flex-col items-start p-4 bg-gray-100 rounded-xl hover:bg-yellow-100 hover:border-yellow-500 border-2 border-transparent transition duration-200 shadow-sm"
    >
        <p className="text-base font-semibold text-gray-800">{service.name}</p>
        <p className="text-sm text-yellow-600 font-bold mt-1">
            ${service.price.toLocaleString('es-CO')}
        </p>
    </button>
);


// Resumen del Carrito y Total a Pagar
const CartSummary: React.FC<{ 
    services: CartItem[]; 
    totalCost: number; 
    onRemove: (id: number) => void;
    onSubmit: (e: React.FormEvent) => void;
    placa: string;
}> = ({ services, totalCost, onRemove, onSubmit, placa }) => (
    <div className="sticky top-4 bg-white p-6 rounded-xl shadow-2xl border-2 border-blue-500">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <i className="fa-solid fa-shopping-cart mr-3 text-blue-500"></i>
            Resumen de la Orden
        </h2>
        
        <div className="border-b pb-3 mb-3">
            <p className="text-lg font-semibold text-gray-700">Vehículo: <span className="text-gray-900 font-extrabold">{placa || 'PENDIENTE'}</span></p>
        </div>

        {/* Lista de Servicios */}
        <div className="max-h-60 overflow-y-auto mb-4 space-y-2">
            {services.length === 0 ? (
                <p className="text-gray-500 italic text-center py-4">Aún no hay servicios seleccionados.</p>
            ) : (
                services.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <span className="text-sm text-gray-800">{item.name}</span>
                        <div className="flex items-center">
                            <span className="text-sm font-semibold text-gray-700 mr-3">
                                ${item.price.toLocaleString('es-CO')}
                            </span>
                            <button
                                type="button"
                                onClick={() => onRemove(item.id)}
                                className="text-red-500 hover:text-red-700 transition"
                                title="Quitar servicio"
                            >
                                <i className="fa-solid fa-trash-alt text-xs"></i>
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* Total Final */}
        <div className="flex justify-between items-center border-t-2 border-gray-300 pt-4 mt-4">
            <p className="text-xl font-bold text-gray-800">TOTAL A PAGAR</p>
            <p className="text-3xl font-extrabold text-blue-600">
                ${totalCost.toLocaleString('es-CO')}
            </p>
        </div>
        
        {/* Botón de Confirmación */}
        <button
            type="submit"
            onClick={onSubmit}
            disabled={services.length === 0 || placa.length < 3}
            className={`w-full py-4 mt-6 rounded-xl text-lg font-bold transition duration-300 shadow-lg ${
                services.length === 0 || placa.length < 3
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
            }`}
        >
            <i className="fa-solid fa-circle-check mr-2"></i> Confirmar Recepción
        </button>
        <p className="text-xs text-center text-gray-500 mt-2">
            (Esto enviará la orden al Tablero Operativo)
        </p>
    </div>
);