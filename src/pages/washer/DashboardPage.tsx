import React, { useEffect, useState } from 'react';
import { Droplets, Clock, CheckCircle, Play, Loader, DollarSign, Zap } from 'lucide-react';
import { washingService, WashingService } from '@/services/washingService';
import { useAuth } from '@/contexts/AuthContext';

interface UIWash extends WashingService {
  uiStatus: 'espera' | 'proceso' | 'terminado';
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [washes, setWashes] = useState<UIWash[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [changingId, setChangingId] = useState<number | null>(null);
  const [totalEarned, setTotalEarned] = useState(0);

  // Map backend status to UI status
  const mapStatus = (status: string): 'espera' | 'proceso' | 'terminado' => {
    switch (status) {
      case 'pending': return 'espera';
      case 'in_progress': return 'proceso';
      case 'completed': return 'terminado';
      default: return 'espera';
    }
  };

  // Fetch assigned washes for this washer
  const fetchWashes = async () => {
    setLoading(true);
    try {
      // Obtener todos los servicios activos
      const allWashes = await washingService.getActiveServices();
      // Filtrar solo los asignados a este lavador
      const myWashes = allWashes.filter(w => w.washer_id === user?.id);
      const mapped = myWashes.map(wash => ({
        ...wash,
        uiStatus: mapStatus(wash.status)
      }));
      setWashes(mapped);
      // Calcular total ganado (solo terminados)
      const earned = mapped.filter(w => w.uiStatus === 'terminado').reduce((sum, w) => sum + (w.price || 0), 0);
      setTotalEarned(earned);
      setError(null);
    } catch (err) {
      console.error('Error fetching washes:', err);
      setError('Error al cargar tus servicios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWashes();
    // eslint-disable-next-line
  }, [user]);

  // Cambiar estado del lavado
  const handleChangeStatus = async (wash: UIWash, next: 'espera' | 'proceso' | 'terminado') => {
    setChangingId(wash.id);
    try {
      if (next === 'proceso') {
        await washingService.assignWasher(wash.id, user?.id || 0);
      } else if (next === 'terminado') {
        await washingService.completeService(wash.id);
      }
      await fetchWashes();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      alert('Error al cambiar el estado del servicio');
    } finally {
      setChangingId(null);
    }
  };

  // Stats
  const stats = {
    total: washes.length,
    espera: washes.filter(w => w.uiStatus === 'espera').length,
    proceso: washes.filter(w => w.uiStatus === 'proceso').length,
    terminado: washes.filter(w => w.uiStatus === 'terminado').length,
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
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-md p-8 mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">¡Bienvenido, {user?.username}!</h1>
        <p className="text-gray-800 mb-4">
          Aquí puedes ver tus servicios de lavado, cambiar su estado y conocer tus ganancias totales.
        </p>
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <Zap size={20} />
          Mantente actualizado con el estado de tus servicios
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Servicios */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Servicios Totales</p>
              {loading ? (
                <Loader className="w-6 h-6 text-gray-400 animate-spin mt-2" />
              ) : (
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              )}
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Droplets className="text-blue-600" size={28} />
            </div>
          </div>
        </div>

        {/* En Espera */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">En Espera</p>
              {loading ? (
                <Loader className="w-6 h-6 text-gray-400 animate-spin mt-2" />
              ) : (
                <p className="text-3xl font-bold text-yellow-600">{stats.espera}</p>
              )}
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="text-yellow-600" size={28} />
            </div>
          </div>
        </div>

        {/* En Proceso */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">En Proceso</p>
              {loading ? (
                <Loader className="w-6 h-6 text-gray-400 animate-spin mt-2" />
              ) : (
                <p className="text-3xl font-bold text-blue-600">{stats.proceso}</p>
              )}
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Play className="text-blue-600" size={28} />
            </div>
          </div>
        </div>

        {/* Ganancias */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Ganado</p>
              {loading ? (
                <Loader className="w-6 h-6 text-gray-400 animate-spin mt-2" />
              ) : (
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalEarned)}</p>
              )}
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="text-green-600" size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Servicios asignados */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Droplets className="w-6 h-6 text-blue-600" /> Mis Servicios Asignados
        </h2>
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 flex flex-col items-center justify-center">
            <Loader className="animate-spin text-yellow-400 mb-4" size={48} />
            <p className="text-gray-600 font-semibold">Cargando tus servicios...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl">
            <p className="font-semibold">{error}</p>
          </div>
        ) : washes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Droplets className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">No tienes servicios asignados actualmente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {washes.map(wash => (
              <div key={wash.id} className={`rounded-xl shadow-lg p-6 border-l-4 hover:shadow-2xl transition-all ${
                wash.uiStatus === 'espera' ? 'bg-yellow-50 border-yellow-400' :
                wash.uiStatus === 'proceso' ? 'bg-blue-50 border-blue-400' :
                'bg-green-50 border-green-400'
              }`}>
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{wash.vehicle_plate}</h3>
                    <p className="text-sm text-gray-600">{wash.service_type}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    wash.uiStatus === 'espera' ? 'bg-yellow-200 text-yellow-800' :
                    wash.uiStatus === 'proceso' ? 'bg-blue-200 text-blue-800' :
                    'bg-green-200 text-green-800'
                  }`}>
                    {wash.uiStatus.toUpperCase()}
                  </span>
                </div>

                {/* Price */}
                <div className="bg-white bg-opacity-60 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600">Valor del servicio</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(wash.price || 0)}</p>
                </div>

                {/* Times */}
                {(wash.start_time || wash.end_time) && (
                  <div className="text-sm text-gray-600 mb-4 space-y-1">
                    {wash.start_time && (
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>Inicio: {new Date(wash.start_time).toLocaleTimeString()}</span>
                      </div>
                    )}
                    {wash.end_time && (
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} />
                        <span>Fin: {new Date(wash.end_time).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  {wash.uiStatus === 'espera' && (
                    <button
                      className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={changingId === wash.id}
                      onClick={() => handleChangeStatus(wash, 'proceso')}
                    >
                      {changingId === wash.id ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <>
                          <Play size={16} /> Iniciar
                        </>
                      )}
                    </button>
                  )}
                  {wash.uiStatus === 'proceso' && (
                    <button
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={changingId === wash.id}
                      onClick={() => handleChangeStatus(wash, 'terminado')}
                    >
                      {changingId === wash.id ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <>
                          <CheckCircle size={16} /> Terminar
                        </>
                      )}
                    </button>
                  )}
                  {wash.uiStatus === 'terminado' && (
                    <button disabled className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed opacity-75">
                      <CheckCircle size={16} /> Completado
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumen Financiero */}
      {!loading && washes.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Resumen de Ganancias</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-yellow-400 pl-4">
              <p className="text-sm text-gray-600 mb-1">Servicios en Espera</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.espera}</p>
              <p className="text-xs text-gray-500 mt-1">Potencial: {formatCurrency(washes.filter(w => w.uiStatus === 'espera').reduce((sum, w) => sum + (w.price || 0), 0))}</p>
            </div>
            <div className="border-l-4 border-blue-400 pl-4">
              <p className="text-sm text-gray-600 mb-1">Servicios en Proceso</p>
              <p className="text-2xl font-bold text-blue-600">{stats.proceso}</p>
              <p className="text-xs text-gray-500 mt-1">Potencial: {formatCurrency(washes.filter(w => w.uiStatus === 'proceso').reduce((sum, w) => sum + (w.price || 0), 0))}</p>
            </div>
            <div className="border-l-4 border-green-400 pl-4">
              <p className="text-sm text-gray-600 mb-1">Ganancias Confirmadas</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalEarned)}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.terminado} servicios completados</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;