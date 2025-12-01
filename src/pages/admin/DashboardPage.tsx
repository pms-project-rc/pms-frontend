import React from 'react';

const DashboardPage: React.FC = () => {
    return (
        <div className="max-w-4xl">
            {/* Título de Bienvenida */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                ¡Bienvenido/a!
            </h1>

            {/* Descripción */}
            <p className="text-gray-600 mb-8 text-lg">
                Este es tu panel principal del Sistema de Parqueadero. Aquí tendrás acceso directo al
                control de vehículos, lavados, clientes, gastos y reportes.
            </p>

            {/* Botones de Acción Rápida */}
            <div className="flex flex-wrap gap-4">
                <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-3 rounded-lg shadow-md transition-colors duration-200">
                    Registrar Vehiculo
                </button>
                <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-3 rounded-lg shadow-md transition-colors duration-200">
                    Registrar Gasto
                </button>
                <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-3 rounded-lg shadow-md transition-colors duration-200">
                    Nuevo Convenio
                </button>
            </div>
        </div>
    );
};

export default DashboardPage;