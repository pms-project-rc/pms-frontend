import React, { useEffect, useState } from 'react';
import {
  Droplets, Car, BarChart3, Clock, TrendingUp, DollarSign,
  Users, Activity, AlertCircle, Calendar, Zap, Power
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { shiftService } from '@/services/shiftService';

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

  useEffect(() => {
    // Check for active shift on mount
    const checkActiveShift = async () => {
      try {
        const activeShift = await shiftService.getActiveShift();
        if (activeShift) {
          setShiftActive(true);
          setShiftMessage(`Turno activo desde ${new Date(activeShift.start_time).toLocaleTimeString('es-CO')}`);
        }
      } catch (err) {
        console.error('Error checking active shift:', err);
      }
    };
    
    checkActiveShift();
    
    setStats([
      {
        title: 'Servicios Hoy',
        value: 45,
        icon: <Droplets className="w-8 h-8" />,
        color: 'text-blue-400',
        bgColor: 'bg-blue-900',
        trend: '+12%'
      },
      {
        title: 'Parqueos Activos',
        value: 12,
        icon: <Car className="w-8 h-8" />,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900',
        trend: '+5%'
      },
      {
        title: 'En Lavado',
        value: 8,
        icon: <Zap className="w-8 h-8" />,
        color: 'text-purple-400',
        bgColor: 'bg-purple-900',
        trend: '+3%'
      },
      {
        title: 'Ingresos Hoy',
        value: '$2,850K',
        icon: <DollarSign className="w-8 h-8" />,
        color: 'text-green-400',
        bgColor: 'bg-green-900',
        trend: '+8%'
      },
      {
        title: 'Ocupación',
        value: '75%',
        icon: <Activity className="w-8 h-8" />,
        color: 'text-red-400',
        bgColor: 'bg-red-900',
        trend: '+2%'
      },
      {
        title: 'Completados',
        value: 42,
        icon: <Calendar className="w-8 h-8" />,
        color: 'text-green-400',
        bgColor: 'bg-green-900',
        trend: '+15%'
      }
    ]);
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
            <span role="img" aria-label="wave">👋</span> ¡Bienvenido!
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
                <span className="font-bold text-amber-300">12 vehículos</span> activos
              </p>
              <p className="text-sm text-gray-300">
                Ocupación: <span className="font-bold text-amber-300">75%</span>
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
                <span className="font-bold text-cyan-300">8 servicios</span> en proceso
              </p>
              <p className="text-sm text-gray-300">
                Ingresos: <span className="font-bold text-cyan-300">$1,850K</span>
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
                <span className="font-bold text-emerald-300">42 completados</span> hoy
              </p>
              <p className="text-sm text-gray-300">
                Ingresos: <span className="font-bold text-emerald-300">$2,850K</span>
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
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 border border-slate-700">
          <div className="flex items-center gap-3 mb-5">
            <Clock className="w-6 h-6 text-blue-400" />
            <h3 className="font-bold text-white text-lg">Parqueo Gratuito</h3>
          </div>
          <p className="text-3xl font-bold text-blue-300 mb-2">2 horas</p>
          <p className="text-sm text-gray-400">Tiempo sin cobro</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 border border-slate-700">
          <div className="flex items-center gap-3 mb-5">
            <Users className="w-6 h-6 text-purple-400" />
            <h3 className="font-bold text-white text-lg">Lavadores</h3>
          </div>
          <p className="text-3xl font-bold text-purple-300 mb-2">8</p>
          <p className="text-sm text-gray-400">Disponibles ahora</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 border border-slate-700">
          <div className="flex items-center gap-3 mb-5">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h3 className="font-bold text-white text-lg">Promedio/Servicio</h3>
          </div>
          <p className="text-3xl font-bold text-green-300 mb-2">$67.8K</p>
          <p className="text-sm text-gray-400">Ingreso promedio</p>
        </div>
      </div>

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