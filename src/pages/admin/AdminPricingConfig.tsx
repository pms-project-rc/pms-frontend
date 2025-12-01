import React, { useState, useCallback } from 'react';

// --- Tipos de Datos ---

// Definición de las categorías de vehículos y servicios
type VehicleType = 'Carro' | 'Moto' | 'Camioneta';
type ServiceType = 'Básico' | 'Full' | 'Tapicería' | 'Desinfección';

interface ServicePrice {
    vehicleType: VehicleType;
    serviceType: ServiceType;
    price: number;
}

interface ParkingRate {
    unit: 'Minuto' | 'Hora';
    rate: number; // Precio por unidad
}

// --- Datos Iniciales Simulados ---
const initialServicePrices: ServicePrice[] = [
    { vehicleType: 'Carro', serviceType: 'Básico', price: 25000 },
    { vehicleType: 'Carro', serviceType: 'Full', price: 45000 },
    { vehicleType: 'Carro', serviceType: 'Tapicería', price: 150000 },
    { vehicleType: 'Carro', serviceType: 'Desinfección', price: 15000 },

    { vehicleType: 'Moto', serviceType: 'Básico', price: 12000 },
    { vehicleType: 'Moto', serviceType: 'Full', price: 25000 },
    { vehicleType: 'Moto', serviceType: 'Tapicería', price: 75000 },
    { vehicleType: 'Moto', serviceType: 'Desinfección', price: 10000 },

    { vehicleType: 'Camioneta', serviceType: 'Básico', price: 35000 },
    { vehicleType: 'Camioneta', serviceType: 'Full', price: 65000 },
    { vehicleType: 'Camioneta', serviceType: 'Tapicería', price: 200000 },
    { vehicleType: 'Camioneta', serviceType: 'Desinfección', price: 20000 },
];

const initialParkingRates: ParkingRate[] = [
    { unit: 'Minuto', rate: 150 }, // $150 por minuto
    { unit: 'Hora', rate: 8000 }, // $8,000 por hora
];

// Nombres únicos para la cabecera de la tabla
const allVehicleTypes: VehicleType[] = ['Carro', 'Moto', 'Camioneta'];
const allServiceTypes: ServiceType[] = ['Básico', 'Full', 'Tapicería', 'Desinfección'];


// --- Componente de Configuración de Tarifas ---
function AdminPricingConfig() {
    const [servicePrices, setServicePrices] = useState<ServicePrice[]>(initialServicePrices);
    const [parkingRates, setParkingRates] = useState<ParkingRate[]>(initialParkingRates);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Función para actualizar un precio en la tabla
    const handlePriceChange = useCallback((
        vehicle: VehicleType, 
        service: ServiceType, 
        newValue: string
    ) => {
        const newPrice = parseInt(newValue, 10);
        if (isNaN(newPrice) || newPrice < 0) return;

        setServicePrices(prevPrices => 
            prevPrices.map(p => 
                p.vehicleType === vehicle && p.serviceType === service
                    ? { ...p, price: newPrice }
                    : p
            )
        );
    }, []);

    // Función para actualizar una tarifa de parqueadero
    const handleParkingRateChange = useCallback((
        unit: 'Minuto' | 'Hora', 
        newValue: string
    ) => {
        const newRate = parseInt(newValue, 10);
        if (isNaN(newRate) || newRate < 0) return;

        setParkingRates(prevRates => 
            prevRates.map(r => 
                r.unit === unit
                    ? { ...r, rate: newRate }
                    : r
            )
        );
    }, []);

    // Función para simular el guardado de datos
    const handleSave = () => {
        setIsSaving(true);
        setMessage(null);

        // Aquí iría la llamada a la API o a Firestore para guardar servicePrices y parkingRates
        setTimeout(() => {
            setIsSaving(false);
            setMessage({ type: 'success', text: '¡Configuración de tarifas guardada exitosamente!' });
            console.log('Nuevos precios de servicios:', servicePrices);
            console.log('Nuevas tarifas de parqueadero:', parkingRates);
        }, 1500);
    };
    
    // Función de ayuda para obtener el precio de un servicio
    const getPrice = (vehicle: VehicleType, service: ServiceType) => {
        const item = servicePrices.find(p => p.vehicleType === vehicle && p.serviceType === service);
        return item ? item.price : 0;
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
            <header className="mb-8 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                    <i className="fa-solid fa-tags text-blue-600 mr-2"></i>
                    Configuración de Tarifas y Precios
                </h1>
                <p className="text-gray-600">
                    Ajusta los precios base de los servicios de lavado y las tarifas de cobro por parqueadero/estacionamiento.
                </p>
            </header>

            {/* Mensaje de estado (Éxito/Error) */}
            {message && (
                <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} border-l-4 ${message.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
                    <i className={`mr-2 fa-solid ${message.type === 'success' ? 'fa-check-circle' : 'fa-triangle-exclamation'}`}></i>
                    {message.text}
                </div>
            )}

            {/* 1. Tabla de Precios de Lavado por Tipo */}
            <section className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                    <i className="fa-solid fa-car-wash mr-2 text-indigo-600"></i>
                    Tarifas Base de Lavado
                </h2>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo de Servicio
                                </th>
                                {allVehicleTypes.map(vType => (
                                    <th 
                                        key={vType} 
                                        scope="col" 
                                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        {vType}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {allServiceTypes.map(sType => (
                                <tr key={sType}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {sType}
                                    </td>
                                    {allVehicleTypes.map(vType => {
                                        const currentPrice = getPrice(vType, sType);
                                        return (
                                            <td key={`${vType}-${sType}`} className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">$</span>
                                                    <input
                                                        type="number"
                                                        value={currentPrice}
                                                        onChange={(e) => handlePriceChange(vType, sType, e.target.value)}
                                                        min="0"
                                                        className="w-32 text-center border border-gray-300 rounded-lg py-2 pl-6 pr-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                                                        aria-label={`Precio para ${sType} en ${vType}`}
                                                    />
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            
            {/* 2. Configuración de Tarifas de Parqueadero */}
            <section className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                    <i className="fa-solid fa-square-parking mr-2 text-green-600"></i>
                    Tarifas de Parqueadero (Estacionamiento)
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {parkingRates.map(rateItem => (
                        <div key={rateItem.unit} className="flex items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label htmlFor={`rate-${rateItem.unit}`} className="block text-lg font-medium text-gray-700 w-1/3">
                                Tarifa por {rateItem.unit}
                            </label>
                            <div className="relative w-2/3 ml-4">
                                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">$</span>
                                <input
                                    id={`rate-${rateItem.unit}`}
                                    type="number"
                                    value={rateItem.rate}
                                    onChange={(e) => handleParkingRateChange(rateItem.unit, e.target.value)}
                                    min="0"
                                    className="w-full text-left border border-gray-300 rounded-lg py-2 pl-6 pr-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                                    aria-label={`Tarifa por ${rateItem.unit}`}
                                />
                                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                    COP
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            
            {/* Botón de Guardar */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-blue-700 transition duration-300 shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                    {isSaving ? (
                        <i className="fa-solid fa-spinner fa-spin-pulse mr-2"></i>
                    ) : (
                        <i className="fa-solid fa-floppy-disk mr-2"></i>
                    )}
                    {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                </button>
            </div>

        </div>
    );
}

export default AdminPricingConfig;