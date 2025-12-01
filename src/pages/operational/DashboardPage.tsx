import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- ¡IMPORTANTE! Hook para la navegación

// Interfaz de un Servicio (Tarjeta Kanban)
interface ServiceCard {
    id: number;
    placa: string;
    tipoVehiculo: 'Carro' | 'Moto' | 'Camioneta';
    tipoServicio: string;
    lavador: string;
    horaIngreso: string;
    status: 'pending' | 'in_progress' | 'ready'; // Estado del flujo
    timeElapsed: number; // Tiempo en segundos simulado
}

// Interfaz para las Tarjetas KPI
interface KpiCardProps {
    title: string;
    value: string;
    icon: string;
    color: string;
    accent: string;
}

// Datos de prueba para simular el Kanban
const initialServices: ServiceCard[] = [
    { id: 1, placa: 'XYZ-456', tipoVehiculo: 'Carro', tipoServicio: 'General', lavador: 'N/A', horaIngreso: '10:15 AM', status: 'pending', timeElapsed: 0 },
    { id: 2, placa: 'PQR-123', tipoVehiculo: 'Moto', tipoServicio: 'Básico', lavador: 'Juan P.', horaIngreso: '10:00 AM', status: 'in_progress', timeElapsed: 1500 },
    { id: 3, placa: 'ABC-789', tipoVehiculo: 'Camioneta', tipoServicio: 'Motor + General', lavador: 'Ana V.', horaIngreso: '09:30 AM', status: 'ready', timeElapsed: 3000 },
    { id: 4, placa: 'MNO-001', tipoVehiculo: 'Carro', tipoServicio: 'Básico', lavador: 'N/A', horaIngreso: '11:00 AM', status: 'pending', timeElapsed: 0 },
];


// --- Componente de Tarjeta KPI ---
const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, color, accent }) => (
    <div className="bg-white p-5 rounded-xl shadow-md border-l-4" style={{ borderColor: accent }}>
        <div className="flex justify-between items-center">
            <div className="text-sm font-medium text-gray-500">{title}</div>
            <i className={`text-xl ${icon} ${color}`}></i>
        </div>
        <div className="text-3xl font-extrabold text-gray-800 mt-1">{value}</div>
    </div>
);

// --- Componente Tarjeta de Servicio Kanban ---
const ServiceKanbanCard: React.FC<{ card: ServiceCard; onAction: (id: number, action: 'start' | 'finish' | 'checkout') => void }> = ({ card, onAction }) => {
    // Función de formato de tiempo (H:MM:SS)
    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getIcon = (type: string) => {
        if (type === 'Moto') return 'fa-solid fa-motorcycle';
        if (type === 'Carro') return 'fa-solid fa-car-side';
        if (type === 'Camioneta') return 'fa-solid fa-truck-pickup';
        return 'fa-solid fa-car';
    };

    const StatusBadge = () => {
        let text, style;
        switch (card.status) {
            case 'pending':
                text = 'En Espera';
                style = 'bg-gray-100 text-gray-600';
                break;
            case 'in_progress':
                text = 'En Proceso';
                style = 'bg-blue-100 text-blue-600 animate-pulse';
                break;
            case 'ready':
                text = 'Por Cobrar';
                style = 'bg-green-100 text-green-600 font-bold';
                break;
            default:
                text = 'Desconocido';
                style = 'bg-red-100 text-red-600';
        }
        return <span className={`text-xs font-medium py-1 px-3 rounded-full ${style}`}>{text}</span>;
    };

    return (
        <div 
            className="bg-white p-4 rounded-xl shadow-md mb-4 border-l-4 border-yellow-500 transform hover:scale-[1.01] transition duration-200 cursor-grab"
            // Atributos para Drag & Drop (simulación)
            draggable 
            onDragStart={(e) => {
                e.dataTransfer.setData('cardId', card.id.toString());
                e.dataTransfer.setData('sourceStatus', card.status);
            }}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                    <i className={`${getIcon(card.tipoVehiculo)} text-2xl mr-3 text-yellow-600`}></i>
                    <div>
                        <p className="text-xl font-extrabold text-gray-800">{card.placa}</p>
                        <p className="text-xs text-gray-500">{card.tipoVehiculo} - {card.tipoServicio}</p>
                    </div>
                </div>
                <StatusBadge />
            </div>

            <div className="text-sm text-gray-700 mb-3 border-t pt-2 mt-2">
                <p>Lavador: <span className="font-semibold text-gray-900">{card.lavador}</span></p>
                <p>Ingreso: <span className="font-semibold">{card.horaIngreso}</span></p>
                {card.status === 'in_progress' && (
                    <p className="text-red-500 font-bold flex items-center mt-1">
                        <i className="fa-solid fa-clock mr-2"></i> Duración: {formatTime(card.timeElapsed)}
                    </p>
                )}
            </div>

            {/* Botones de Acción Rápida */}
            <div className="flex gap-2 mt-3">
                {card.status === 'pending' && (
                    <button 
                        onClick={() => onAction(card.id, 'start')} 
                        className="flex-1 bg-yellow-500 text-gray-900 text-sm font-semibold py-2 rounded-lg hover:bg-yellow-600 transition"
                    >
                        <i className="fa-solid fa-play mr-1"></i> Iniciar
                    </button>
                )}
                {card.status === 'in_progress' && (
                    <button 
                        onClick={() => onAction(card.id, 'finish')} 
                        className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <i className="fa-solid fa-stop mr-1"></i> Terminar
                    </button>
                )}
                {card.status === 'ready' && (
                    <button 
                        onClick={() => onAction(card.id, 'checkout')} 
                        className="flex-1 bg-green-500 text-white text-sm font-semibold py-2 rounded-lg hover:bg-green-600 transition"
                    >
                        <i className="fa-solid fa-hand-holding-dollar mr-1"></i> Cobrar
                    </button>
                )}
            </div>
        </div>
    );
};

// --- Componente de Columna Kanban ---
const KanbanColumn: React.FC<{ status: ServiceCard['status']; title: string; color: string; cards: ServiceCard[]; onDrop: (cardId: number, targetStatus: ServiceCard['status']) => void; onAction: (id: number, action: 'start' | 'finish' | 'checkout') => void }> = ({ status, title, color, cards, onDrop, onAction }) => {
    
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const cardId = parseInt(e.dataTransfer.getData('cardId'), 10);
        // Implementación simple del cambio de estado (sin validación compleja)
        onDrop(cardId, status);
    };

    return (
        <div 
            className="flex-1 bg-gray-100 p-4 rounded-xl h-full flex flex-col min-w-[300px] shadow-inner"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <h2 className={`text-xl font-bold ${color} mb-4 p-2 rounded-lg bg-opacity-10`} style={{ backgroundColor: color.replace('text-', '').replace('-600', '-100')}}>
                {title} ({cards.length})
            </h2>
            <div className="overflow-y-auto flex-grow pr-2">
                {cards.map(card => (
                    <ServiceKanbanCard key={card.id} card={card} onAction={onAction} />
                ))}
            </div>
            {/* Indicador de zona de drop para mejor UX */}
            <p className="text-center text-gray-400 text-sm mt-2 pt-2 border-t border-gray-200">Arrastra tarjetas aquí</p>
        </div>
    );
};

// --- Componente Principal ---
const OperationalDashboardPage: React.FC = () => {
    const navigate = useNavigate(); // <-- Inicializamos useNavigate
    const [services, setServices] = useState(initialServices);

    const kpiData: KpiCardProps[] = [
        { title: "Vehículos Activos", value: services.filter(s => s.status !== 'ready').length.toString(), icon: "fa-solid fa-car-on", color: "text-blue-600", accent: "#4299e1" },
        { title: "Lavados Pendientes", value: services.filter(s => s.status === 'pending').length.toString(), icon: "fa-solid fa-hourglass-start", color: "text-yellow-600", accent: "#f6e05e" },
        // KPI de Turno Actual requiere lógica de facturación real. Aquí simulamos el total listo para cobrar.
        { title: "Listos para Cobrar", value: services.filter(s => s.status === 'ready').length.toString(), icon: "fa-solid fa-money-check-dollar", color: "text-green-600", accent: "#48bb78" },
    ];
    
    // Función para manejar el cambio de estado (Drop)
    const handleDrop = (cardId: number, targetStatus: ServiceCard['status']) => {
        setServices(prevServices => prevServices.map(service => 
            service.id === cardId ? { ...service, status: targetStatus } : service
        ));
    };

    // Función para manejar las acciones rápidas (Botones)
    const handleAction = (id: number, action: 'start' | 'finish' | 'checkout') => {
        setServices(prevServices => prevServices.map(service => {
            if (service.id === id) {
                if (action === 'start') {
                    return { ...service, status: 'in_progress', lavador: 'Admin Operativo' }; // Asigna al admin o a un lavador por defecto
                }
                if (action === 'finish') {
                    return { ...service, status: 'ready' };
                }
                if (action === 'checkout') {
                    // En un app real, esto redirigiría a /operations/checkout/:id
                    alert(`Simulación: Redirigiendo a Cobro/Checkout para la Placa ${service.placa}`);
                    return service; // No cambia el estado aquí, se eliminaría después del cobro real
                }
            }
            return service;
        }));
    };

    // FUNCIÓN DE NAVEGACIÓN HACIA RECEPCIÓN
    const handleNewReceptionClick = () => {
        navigate('/operational/reception'); // <-- Redirige a la nueva ruta
    };

    const columns = [
        { status: 'pending' as const, title: '1. En Espera', color: 'text-gray-600', cards: services.filter(s => s.status === 'pending') },
        { status: 'in_progress' as const, title: '2. En Proceso', color: 'text-blue-600', cards: services.filter(s => s.status === 'in_progress') },
        { status: 'ready' as const, title: '3. Terminado / Por Cobrar', color: 'text-green-600', cards: services.filter(s => s.status === 'ready') },
    ];

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-4 border-blue-500 pb-1 inline-block">
                Tablero Operativo - Control Kanban
            </h1>
            
            {/* KPIs Rápidos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {kpiData.map((kpi, index) => (
                    <KpiCard key={index} {...kpi} />
                ))}
            </div>

            {/* Buscador y Acciones (Recepción) */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input 
                    type="text" 
                    placeholder="Buscar vehículo por placa..." 
                    className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500 transition"
                />
                <button 
                    onClick={handleNewReceptionClick} // <-- Llama a la función de navegación
                    className="bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-yellow-600 transition duration-200 flex items-center justify-center sm:w-auto"
                >
                    <i className="fa-solid fa-plus-circle mr-2"></i> Nuevo Servicio / Recepción
                </button>
            </div>
            
            {/* Tablero Kanban (Scroll Horizontal en Mobile) */}
            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex space-x-6 h-full min-h-[500px]">
                    {columns.map(column => (
                        <KanbanColumn
                            key={column.status}
                            status={column.status}
                            title={column.title}
                            color={column.color}
                            cards={column.cards}
                            onDrop={handleDrop}
                            onAction={handleAction}
                        />
                    ))}
                </div>
            </div>

            {/* NOTA RESPONSIVA */}
            <p className="mt-4 text-center text-gray-500 text-sm">
                <i className="fa-solid fa-arrows-alt-h mr-1"></i> Desliza horizontalmente en dispositivos pequeños para ver todas las columnas.
            </p>
        </div>
    );
};

export default OperationalDashboardPage;