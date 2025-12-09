import React, { useEffect, useState } from 'react';
import {
  Droplets, Car, BarChart3, Clock, TrendingUp, DollarSign,
  Users, Activity, AlertCircle, Calendar, Zap, Power, X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { shiftService } from '@/services/shiftService';
import { operationalDashboardService, OperationalSummary, Washer } from '@/services/operationalDashboardService';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  trend?: string;
}

const OperationalDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [shiftActive, setShiftActive] = useState<boolean>(false);
  const [loadingShift, setLoadingShift] = useState<boolean>(false);
  const [initialCash, setInitialCash] = useState<number>(0);
  const [shiftMessage, setShiftMessage] = useState<string>('');
  const [summary, setSummary] = useState<OperationalSummary | null>(null);
  const [totalWashers, setTotalWashers] = useState<number>(0);
  const [washers, setWashers] = useState<Washer[]>([]);
  const [showWashersModal, setShowWashersModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Check for active shift
        const activeShift = await shiftService.getActiveShift();
        if (activeShift) {
          setShiftActive(true);
          setShiftMessage(`Turno activo desde ${new Date(activeShift.start_time).toLocaleTimeString('es-CO')}`);
        }

        // Load operational summary
        const summaryData = await operationalDashboardService.getSummaryStats();
        setSummary(summaryData);

        // Load total washers count (all washers with role 'washer')
        const washersCount = await operationalDashboardService.getTotalWashersCount();
        setTotalWashers(washersCount);
        console.log('Total washers loaded:', washersCount);

        // Load washers details
        const washersData = await operationalDashboardService.getAllWashers();
        setWashers(washersData);
        console.log('Washers details loaded:', washersData);

        if (summaryData) {
          // Calculate total services today
          const totalServicesToday = summaryData.parking.total_entries + summaryData.washing.total_services;
          
          // Calculate occupancy (assuming 20 spaces max)
          const maxSpaces = 20;
          const occupancyRate = summaryData.parking.active_vehicles > 0 
            ? Math.round((summaryData.parking.active_vehicles / maxSpaces) * 100) 
            : 0;

          // Calculate average service income
          const avgServiceIncome = totalServicesToday > 0 
            ? summaryData.totals.total_income / totalServicesToday 
            : 0;

          // Format stats with real data
          setStats([
            {
              title: 'Servicios Hoy',
              value: totalServicesToday,
              icon: <Droplets className="w-8 h-8" />,
              color: 'text-blue-400',
              bgColor: 'bg-blue-900',
              trend: '+12%'
            },
            {
              title: 'Parqueos Activos',
              value: summaryData.parking.active_vehicles,
              icon: <Car className="w-8 h-8" />,
              color: 'text-yellow-400',
              bgColor: 'bg-yellow-900',
              trend: '+5%'
            },
            {
              title: 'En Lavado',
              value: summaryData.washing.active_services,
              icon: <Zap className="w-8 h-8" />,
              color: 'text-purple-400',
              bgColor: 'bg-purple-900',
              trend: '+3%'
            },
            {
              title: 'Ingresos Hoy',
              value: `$${(summaryData.totals.total_income / 1000).toFixed(0)}K`,
              icon: <DollarSign className="w-8 h-8" />,
              color: 'text-green-400',
              bgColor: 'bg-green-900',
              trend: '+8%'
            },
            {
              title: 'Ocupación',
              value: `${occupancyRate}%`,
              icon: <Activity className="w-8 h-8" />,
              color: 'text-red-400',
              bgColor: 'bg-red-900',
              trend: '+2%'
            },
            {
              title: 'Completados',
              value: totalServicesToday,
              icon: <Calendar className="w-8 h-8" />,
              color: 'text-green-400',
              bgColor: 'bg-green-900',
              trend: '+15%'
            }
          ]);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  const toggleShift = () => {
    setLoadingShift(true);
    setTimeout(() => {
      setShiftActive(!shiftActive);
      setLoadingShift(false);
    }, 500);
  };

  const handleStartShift = async () => {
    setLoadingShift(true);
    setShiftMessage('');
    try {
      const res = await shiftService.startShift({ initial_cash: initialCash });
      setShiftActive(true);
      setShiftMessage(`Turno iniciado a las ${new Date(res.start_time).toLocaleTimeString('es-CO')}`);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'No se pudo iniciar el turno.';
      setShiftMessage(msg);
    } finally {
      setLoadingShift(false);
    }
  };

  const handleCloseShift = async () => {
    setLoadingShift(true);
    setShiftMessage('');
    try {
      const res = await shiftService.closeShift();
      setShiftActive(false);
      setShiftMessage(`Turno cerrado a las ${new Date(res.end_time || Date.now()).toLocaleTimeString('es-CO')}`);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'No se pudo cerrar el turno.';
      setShiftMessage(msg);
    } finally {
      setLoadingShift(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-gray-100">
      {/* Welcome Section */}
      <section className="mb-10">
        <div className="rounded-2xl p-10 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-2xl">
          <h2 className="text-4xl font-bold mb-3 flex items-center gap-3 text-white">
            <span role="img" aria-label="wave">👋</span> ¡Bienvenido{user?.full_name ? `, ${user.full_name}` : user?.username ? `, ${user.username}` : ''}!
          </h2>
          <p className="text-blue-100 text-lg font-light">Panel de control operacional</p>
        </div>
      </section>

      {/* Shift Control (moved up) */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-10 border border-slate-700 shadow-xl mb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Power className="w-6 h-6 text-orange-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Control de Turno</h2>
              <p className="text-sm text-gray-400">Disponible para admin y operador</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full font-bold text-sm ${
            shiftActive 
              ? 'bg-green-600/40 text-green-300 border border-green-700/50' 
              : 'bg-red-600/40 text-red-300 border border-red-700/50'
          }`}>
            {shiftActive ? '🟢 Turno Activo' : '🔴 Turno Inactivo'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-900/30 to-slate-900 rounded-xl p-6 border border-green-800/50">
            <h3 className="text-lg font-bold text-green-300 mb-4">Activar Turno</h3>
            <div className="space-y-4">
              <label className="block text-sm text-gray-300">
                Efectivo inicial
                <input
                  type="number"
                  value={initialCash}
                  onChange={(e) => setInitialCash(parseInt(e.target.value) || 0)}
                  className="mt-2 w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                  min={0}
                />
              </label>
              <button
                onClick={handleStartShift}
                disabled={shiftActive || loadingShift}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:from-gray-600 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 disabled:cursor-not-allowed"
              >
                {loadingShift ? '⏳ Activando...' : shiftActive ? '✓ Turno Activo' : '▶ Activar Turno'}
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-900/30 to-slate-900 rounded-xl p-6 border border-red-800/50">
            <h3 className="text-lg font-bold text-red-300 mb-4">Desactivar Turno</h3>
            <p className="text-sm text-gray-400 mb-6">Finaliza tu turno y cierra todas las operaciones en progreso</p>
            <button
              onClick={handleCloseShift}
              disabled={!shiftActive || loadingShift}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-gray-600 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 disabled:cursor-not-allowed"
            >
              {loadingShift ? '⏳ Desactivando...' : !shiftActive ? '✓ Turno Inactivo' : '⏹ Desactivar Turno'}
            </button>
          </div>
        </div>

        {shiftMessage && (
          <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-800/50 text-sm text-blue-200">
            {shiftMessage}
          </div>
        )}

        <div className="mt-6 p-5 bg-blue-900/30 rounded-lg border border-blue-800/50">
          <p className="text-sm text-blue-300 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span><strong>Nota:</strong> Al desactivar tu turno, se cerrarán automáticamente todos los servicios en progreso. Asegúrate de completar tus operaciones antes de finalizar.</span>
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-gray-400 font-semibold">Cargando estadísticas...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 border border-slate-700 shadow-xl hover:border-slate-600 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-5">
                <div className={`${stat.bgColor} p-4 rounded-xl`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
                {stat.trend && (
                  <span className="text-green-400 text-sm font-bold bg-green-900/40 px-3 py-1 rounded-full border border-green-800/50">
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm font-medium mb-2">{stat.title}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Main Actions */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white mb-8">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Parking Card */}
          <a
            href="/operational/parking"
            className="group bg-gradient-to-br from-amber-900/50 via-slate-800 to-slate-900 rounded-2xl p-8 border-2 border-amber-700/50 hover:border-amber-500 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-900/20 cursor-pointer transform hover:scale-105"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-amber-200 mb-2">🅿️ Parqueadero</h3>
                <p className="text-gray-400 text-sm">Gestiona entrada y salida de vehículos</p>
              </div>
              <div className="w-14 h-14 bg-amber-900/60 rounded-xl flex items-center justify-center group-hover:bg-amber-800/80 transition-all">
                <Car className="w-7 h-7 text-amber-300" />
              </div>
            </div>
            <div className="space-y-2 mb-6 bg-slate-900/50 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                <span className="font-bold text-amber-300">{summary?.parking.active_vehicles || 0} vehículos</span> activos
              </p>
              <p className="text-sm text-gray-300">
                Ingresos: <span className="font-bold text-amber-300">${((summary?.parking.income || 0) / 1000).toFixed(0)}K</span>
              </p>
            </div>
            <button className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all duration-200">
              Ir al Parqueadero →
            </button>
          </a>

          {/* Washing Card */}
          <a
            href="/operational/washing"
            className="group bg-gradient-to-br from-cyan-900/50 via-slate-800 to-slate-900 rounded-2xl p-8 border-2 border-cyan-700/50 hover:border-cyan-500 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-900/20 cursor-pointer transform hover:scale-105"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-cyan-200 mb-2">💧 Lavado</h3>
                <p className="text-gray-400 text-sm">Registra y gestiona servicios de lavado</p>
              </div>
              <div className="w-14 h-14 bg-cyan-900/60 rounded-xl flex items-center justify-center group-hover:bg-cyan-800/80 transition-all">
                <Droplets className="w-7 h-7 text-cyan-300" />
              </div>
            </div>
            <div className="space-y-2 mb-6 bg-slate-900/50 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                <span className="font-bold text-cyan-300">{summary?.washing.active_services || 0} servicios</span> en proceso
              </p>
              <p className="text-sm text-gray-300">
                Ingresos: <span className="font-bold text-cyan-300">${((summary?.washing.income || 0) / 1000).toFixed(0)}K</span>
              </p>
            </div>
            <button className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all duration-200">
              Ir a Lavado →
            </button>
          </a>

          {/* Reports Card */}
          <a
            href="/operational/reports"
            className="group bg-gradient-to-br from-emerald-900/50 via-slate-800 to-slate-900 rounded-2xl p-8 border-2 border-emerald-700/50 hover:border-emerald-500 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/20 cursor-pointer transform hover:scale-105"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-emerald-200 mb-2">📊 Reportes</h3>
                <p className="text-gray-400 text-sm">Visualiza análisis y estadísticas</p>
              </div>
              <div className="w-14 h-14 bg-emerald-900/60 rounded-xl flex items-center justify-center group-hover:bg-emerald-800/80 transition-all">
                <BarChart3 className="w-7 h-7 text-emerald-300" />
              </div>
            </div>
            <div className="space-y-2 mb-6 bg-slate-900/50 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                <span className="font-bold text-emerald-300">{((summary?.parking.total_entries || 0) + (summary?.washing.total_services || 0))} completados</span> hoy
              </p>
              <p className="text-sm text-gray-300">
                Ingresos: <span className="font-bold text-emerald-300">${((summary?.totals.total_income || 0) / 1000).toFixed(0)}K</span>
              </p>
            </div>
            <button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all duration-200">
              Ver Reportes →
            </button>
          </a>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div 
          onClick={() => setShowWashersModal(true)}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 border border-slate-700 cursor-pointer hover:border-purple-500 hover:shadow-xl hover:shadow-purple-900/20 transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-5">
            <Users className="w-6 h-6 text-purple-400" />
            <h3 className="font-bold text-white text-lg">Lavadores</h3>
          </div>
          <p className="text-3xl font-bold text-purple-300 mb-2">{totalWashers}</p>
          <p className="text-sm text-gray-400">Click para ver detalles</p>
        </div>
      </div>

      {/* Washers Modal */}
      {showWashersModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-2xl w-full border border-slate-700 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Users className="w-7 h-7 text-purple-400" />
                Lavadores Registrados
              </h2>
              <button
                onClick={() => setShowWashersModal(false)}
                className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-gray-300 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {washers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 font-semibold">No hay lavadores registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {washers.map((washer, idx) => (
                  <div
                    key={washer.id}
                    className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-xl p-5 border border-slate-600 hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-purple-600/30 border-2 border-purple-500/50 flex items-center justify-center font-bold text-purple-300">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-white text-lg">{washer.full_name || washer.username}</p>
                            <p className="text-sm text-gray-400">@{washer.username}</p>
                          </div>
                        </div>
                        {washer.email && (
                          <p className="text-sm text-gray-400 ml-13">📧 {washer.email}</p>
                        )}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        washer.is_active 
                          ? 'bg-green-600/30 text-green-300 border border-green-700/50'
                          : 'bg-red-600/30 text-red-300 border border-red-700/50'
                      }`}>
                        {washer.is_active ? '✓ Activo' : '✗ Inactivo'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Today's Schedule */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-10 border border-slate-700 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
          <Calendar className="w-6 h-6 text-blue-400" />
          Horario de Hoy
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-900/40 to-transparent rounded-xl border border-blue-800/50 hover:border-blue-700 transition-all">
            <div>
              <p className="font-bold text-white text-lg">⏰ Turno Matutino</p>
              <p className="text-sm text-gray-400 mt-1">6:00 AM - 2:00 PM</p>
            </div>
            <span className="bg-blue-600/40 text-blue-300 px-5 py-2 rounded-lg font-bold text-sm border border-blue-700/50">Activo</span>
          </div>
          <div className="flex items-center justify-between p-5 bg-slate-700/30 rounded-xl border border-slate-700 hover:border-slate-600 transition-all">
            <div>
              <p className="font-bold text-white text-lg">⏰ Turno Vespertino</p>
              <p className="text-sm text-gray-400 mt-1">2:00 PM - 10:00 PM</p>
            </div>
            <span className="bg-slate-700/50 text-gray-300 px-5 py-2 rounded-lg font-bold text-sm border border-slate-600">Próximamente</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationalDashboard;