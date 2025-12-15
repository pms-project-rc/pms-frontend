import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, DollarSign, FileText, Loader } from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import { washingService } from '@/services/washingService';
import { dashboardService } from '@/services/dashboardService';
import { expenseService } from '@/services/expenseService';

interface DashboardStats {
    activeVehicles: number;
    totalWashes: number;
    todayIncome: number;
    todayExpenses: number;
}

function DashboardPage() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        activeVehicles: 0,
        totalWashes: 0,
        todayIncome: 0,
        todayExpenses: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const data = await dashboardService.getStats();
            setStats({
                activeVehicles: data.active_vehicles,
                totalWashes: data.total_washes,
                todayIncome: data.today_income,
                todayExpenses: data.today_expenses
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="min-h-full bg-gray-50">
            {/* Welcome Panel */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Bienvenido/a!</h1>
                <p className="text-gray-600 mb-6">
                    Este es tu panel principal del Sistema de Parqueadero. Aquí tendrás acceso directo al
                    control de vehículos, lavados, clientes, gastos y reportes.
                </p>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => navigate('/admin/vehicles')}
                        className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
                    >
                        <Car size={20} />
                        Registrar Vehículo
                    </button>

                    <button
                        onClick={() => navigate('/admin/expenses')}
                        className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
                    >
                        <DollarSign size={20} />
                        Registrar Gasto
                    </button>

                    <button
                        onClick={() => navigate('/admin/agreements')}
                        className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
                    >
                        <FileText size={20} />
                        Nuevo Convenio
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Active Vehicles */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Vehículos Activos</p>
                            {loading ? (
                                <Loader className="w-6 h-6 text-gray-400 animate-spin mt-2" />
                            ) : (
                                <p className="text-2xl font-bold text-blue-600">{stats.activeVehicles}</p>
                            )}
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Car className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                {/* Total Washes */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Lavados Totales</p>
                            {loading ? (
                                <Loader className="w-6 h-6 text-gray-400 animate-spin mt-2" />
                            ) : (
                                <p className="text-2xl font-bold text-green-600">{stats.totalWashes}</p>
                            )}
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Today's Income */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-600 mb-1">Ingresos Hoy</p>
                            {loading ? (
                                <Loader className="w-6 h-6 text-gray-400 animate-spin mt-2" />
                            ) : (
                                <p className="text-xl font-bold text-yellow-600 truncate">{formatCurrency(stats.todayIncome)}</p>
                            )}
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-lg flex-shrink-0">
                            <DollarSign className="text-yellow-600" size={24} />
                        </div>
                    </div>
                </div>

                {/* Today's Expenses */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-600 mb-1">Gastos Hoy</p>
                            {loading ? (
                                <Loader className="w-6 h-6 text-gray-400 animate-spin mt-2" />
                            ) : (
                                <p className="text-xl font-bold text-red-600 truncate">{formatCurrency(stats.todayExpenses)}</p>
                            )}
                        </div>
                        <div className="bg-red-100 p-3 rounded-lg flex-shrink-0">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Income vs Expenses Chart */}
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen Financiero de Hoy</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Bar Chart Visualization */}
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold text-gray-700">Ingresos</span>
                                <span className="text-sm font-bold text-green-600">{formatCurrency(stats.todayIncome)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-green-500 to-green-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                                    style={{ width: `${Math.min((stats.todayIncome / Math.max(stats.todayIncome, stats.todayExpenses, 1)) * 100, 100)}%` }}
                                >
                                    <span className="text-xs font-bold text-white">
                                        {stats.todayIncome > 0 ? '💰' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold text-gray-700">Gastos</span>
                                <span className="text-sm font-bold text-red-600">{formatCurrency(stats.todayExpenses)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-red-500 to-red-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                                    style={{ width: `${Math.min((stats.todayExpenses / Math.max(stats.todayIncome, stats.todayExpenses, 1)) * 100, 100)}%` }}
                                >
                                    <span className="text-xs font-bold text-white">
                                        {stats.todayExpenses > 0 ? '💸' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-900">Balance Neto</span>
                                <span className={`text-lg font-bold ${stats.todayIncome - stats.todayExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(stats.todayIncome - stats.todayExpenses)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen del Día</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">🚗 Vehículos Activos:</span>
                                <span className="font-bold text-blue-600">{stats.activeVehicles}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">🧼 Total Lavados:</span>
                                <span className="font-bold text-blue-600">{stats.totalWashes}</span>
                            </div>
                            <div className="border-t border-blue-300 pt-3 mt-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-900">💵 Total Ingresos:</span>
                                    <span className="font-bold text-green-600">{formatCurrency(stats.todayIncome)}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-900">💸 Total Gastos:</span>
                                <span className="font-bold text-red-600">{formatCurrency(stats.todayExpenses)}</span>
                            </div>
                            <div className="border-t-2 border-blue-400 pt-3 mt-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-900">🎯 Ganancia Neta:</span>
                                    <span className={`text-xl font-bold ${stats.todayIncome - stats.todayExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(stats.todayIncome - stats.todayExpenses)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;