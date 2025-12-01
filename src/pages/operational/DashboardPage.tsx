import React from 'react';

const DashboardPage: React.FC = () => {
    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-4 border-yellow-500 pb-1 inline-block">
                Dashboard Operativo
            </h1>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-gray-600">
                    Dashboard operativo listo para implementación.
                </p>
            </div>
        </div>
    );
};

export default DashboardPage;