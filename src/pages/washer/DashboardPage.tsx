import React, { useState, useEffect } from 'react';

// --- Tipos de Datos Simulados ---
interface WasherService {
    id: number;
    placa: string;
    tipoVehiculo: 'Carro' | 'Moto' | 'Camioneta';
    tipoServicio: string;
    horaAsignacion: string;
    status: 'in_progress' | 'pending_start'; // Pendiente de iniciar o en proceso
}

// Datos de Servicios Asignados (simulados)
const initialAssignedServices: WasherService[] = [
    { id: 101, placa: 'MKT-321', tipoVehiculo: 'Carro', tipoServicio: 'Full Detalle', horaAsignacion: '11:30 AM', status: 'pending_start' },
    { id: 102, placa: 'TRQ-789', tipoVehiculo: 'Camioneta', tipoServicio: 'General + Tapicería', horaAsignacion: '11:00 AM', status: 'in_progress' },
    { id: 103, placa: 'XYZ-000', tipoVehiculo: 'Moto', tipoServicio: 'Lavado Básico', horaAsignacion: '11:45 AM', status: 'pending_start' },
];

// --- Componente Tarjeta de Servicio del Lavador ---
const ServiceCard: React.FC<{ service: WasherService; onAction: (id: number, action: 'start' | 'finish') => void }> = ({ service, onAction }) => {
    
    // Function to determine styles and actions
    const isPending = service.status === 'pending_start';
    
    const getIcon = (type: string) => {
        if (type === 'Moto') return 'fa-solid fa-motorcycle';
        if (type === 'Carro') return 'fa-solid fa-car-side';
        if (type === 'Camioneta') return 'fa-solid fa-truck-pickup';
        return 'fa-solid fa-car';
    };

    return (
        <div className={`bg-white p-5 rounded-xl shadow-lg border-l-4 ${isPending ? 'border-yellow-500' : 'border-blue-500'} transition hover:shadow-xl`}>
            <div className="flex justify-between items-start">
                <div className="flex items-center">
                    <i className={`${getIcon(service.tipoVehiculo)} text-3xl mr-3 ${isPending ? 'text-yellow-600' : 'text-blue-600'}`}></i>
                    <div>
                        <p className="text-xl font-extrabold text-gray-900">{service.placa}</p>
                        <p className="text-sm text-gray-500">{service.tipoVehiculo} - {service.tipoServicio}</p>
                    </div>
                </div>
                <span className={`text-xs font-semibold py-1 px-3 rounded-full ${isPending ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700 animate-pulse'}`}>
                    {isPending ? 'POR INICIAR' : 'EN PROCESO'}
                </span>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600">Asignado a las: <span className="font-semibold">{service.horaAsignacion}</span></p>
            </div>

            <div className="mt-4">
                {isPending ? (
                    <button
                        onClick={() => onAction(service.id, 'start')}
                        className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md transform hover:scale-[1.01]"
                    >
                        <i className="fa-solid fa-play mr-2"></i> INICIAR LAVADO
                    </button>
                ) : (
                    <button
                        onClick={() => onAction(service.id, 'finish')}
                        className="w-full bg-green-500 text-white font-semibold py-2 rounded-lg hover:bg-green-600 transition duration-200 shadow-md transform hover:scale-[1.01]"
                    >
                        <i className="fa-solid fa-check-circle mr-2"></i> MARCAR COMO TERMINADO
                    </button>
                )}
            </div>
        </div>
    );
};

// --- Componente Principal ---
function WasherDashboard() {
    const [assignedServices, setAssignedServices] = useState<WasherService[]>(initialAssignedServices);
    // Simulated washer data, including commission
    const [washerData, setWasherData] = useState({ 
        name: 'Juan', 
        servicesCompletedToday: 3, 
        pendingCommission: 45000,
        activeServiceCount: initialAssignedServices.filter(s => s.status === 'in_progress').length,
    });

    useEffect(() => {
        // Update the count of active services whenever services change
        setWasherData(prev => ({ 
            ...prev, 
            activeServiceCount: assignedServices.filter(s => s.status === 'in_progress').length
        }));
    }, [assignedServices]);
    
    // Function to handle service status updates
    const handleServiceAction = (id: number, action: 'start' | 'finish') => {
        if (action === 'start') {
            // Business rule: Only one 'in_progress' service allowed at a time
            if (washerData.activeServiceCount >= 1) {
                // Use console error instead of alert()
                console.error('Error: No puedes iniciar otro servicio hasta terminar el que está en proceso.');
                return;
            }
            
            setAssignedServices(prev => prev.map(s => 
                s.id === id ? { ...s, status: 'in_progress' } : s
            ));
            console.log(`Servicio ${id} iniciado.`);
        } else if (action === 'finish') {
            // Logic to move service out of the washer's list and update KPIs
            setAssignedServices(prev => prev.filter(s => s.id !== id));
            console.log(`Servicio ${id} terminado.`);
            
            // Simulate KPI update
            setWasherData(prev => ({
                ...prev,
                servicesCompletedToday: prev.servicesCompletedToday + 1,
                pendingCommission: prev.pendingCommission + 15000 // Simulated commission earning
            }));
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-4 border-yellow-500 pb-1 inline-block">
                Mis Servicios - Lavador
            </h1>
            
            {/* Top Row KPI Cards: Servicios Asignados & Bonos Acumulados (As requested) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                
                {/* 1. Servicios Asignados (Total pending + in-progress) */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
                    <h3 className="text-gray-500 text-sm font-medium flex items-center">
                        <i className="fa-solid fa-clipboard-list mr-2 text-yellow-600"></i>
                        Servicios Asignados
                    </h3>
                    <p className="text-4xl font-extrabold text-gray-900 mt-2">
                        {assignedServices.length}
                    </p>
                </div>
                
                {/* 2. Bonos Acumulados (Pending Commission) */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm font-medium flex items-center">
                        <i className="fa-solid fa-sack-dollar mr-2 text-blue-600"></i>
                        Bonos Acumulados
                    </h3>
                    <p className="text-4xl font-extrabold text-gray-900 mt-2">
                        ${washerData.pendingCommission.toLocaleString('es-CO')}
                    </p>
                </div>
            </div>

            {/* List of Assigned Services (Detailed Tasks) */}
            <div className="mt-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <i className="fa-solid fa-list-check mr-2 text-blue-600"></i>
                    Detalle de Tareas
                    {/* Secondary metric: how many are actively being worked on */}
                    <span className="ml-3 text-sm bg-gray-200 text-gray-700 py-1 px-3 rounded-full">
                        {washerData.activeServiceCount} en proceso
                    </span>
                </h2>
                
                {assignedServices.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-md border border-dashed border-gray-300">
                        <p className="text-gray-500 text-center text-lg">
                            <i className="fa-solid fa-box-open text-3xl mb-3"></i><br/>
                            ¡Estás al día! No tienes servicios asignados o en proceso.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {assignedServices.map(service => (
                            <ServiceCard 
                                key={service.id} 
                                service={service} 
                                onAction={handleServiceAction} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default WasherDashboard;