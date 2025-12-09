import React, { useEffect, useState } from 'react';
import { Droplets, Calendar, DollarSign, Loader, Filter } from 'lucide-react';
import { washingService, WashingService } from '@/services/washingService';
import { useAuth } from '@/contexts/AuthContext';

interface UIWash extends WashingService {
  uiStatus: 'espera' | 'proceso' | 'terminado';
}

const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [washes, setWashes] = useState<UIWash[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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

  // Fetch all washes and filter by washer
  const fetchWashes = async () => {
    setLoading(true);
    try {
      // Obtener todos los servicios
      const allWashes = await washingService.getActiveServices();
      // Filtrar solo los asignados a este lavador
      let myWashes = allWashes.filter(w => w.washer_id === user?.id);
      
      // Filtrar solo los terminados
      myWashes = myWashes.filter(w => mapStatus(w.status) === 'terminado');

      // Filtrar por fechas si se especifican
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        myWashes = myWashes.filter(w => {
          const washDate = new Date(w.created_at);
          return washDate >= start && washDate <= end;
        });
      }

      const mapped = myWashes.map(wash => ({
        ...wash,
        uiStatus: mapStatus(wash.status)
      }));

      setWashes(mapped);
      const earned = mapped.reduce((sum, w) => sum + (w.price || 0), 0);
      setTotalEarned(earned);
      setError(null);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Error al cargar el historial.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWashes();
    // eslint-disable-next-line
  }, [user]);

  const handleFilter = () => {
    fetchWashes();
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    fetchWashes();
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg shadow-md p-8 mb-6">
        <h1 className="text-4xl font-bold text-white mb-2">Historial de Servicios</h1>
        <p className="text-blue-100">
          Aquí puedes ver todos tus servicios completados y tu historial de ganancias.
        </p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Filter size={20} /> Filtrar por Fechas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleFilter}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Filtrar
            </button>
            <button
              onClick={handleClearFilter}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Servicios Completados</p>
              {loading ? (
                <Loader className="w-6 h-6 text-gray-400 animate-spin mt-2" />
              ) : (
                <p className="text-3xl font-bold text-blue-600">{washes.length}</p>
              )}
            </div>
            <Droplets className="text-blue-600" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Promedio por Servicio</p>
              {loading ? (
                <Loader className="w-6 h-6 text-gray-400 animate-spin mt-2" />
              ) : (
                <p className="text-3xl font-bold text-purple-600">
                  {formatCurrency(washes.length > 0 ? totalEarned / washes.length : 0)}
                </p>
              )}
            </div>
            <Calendar className="text-purple-600" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Ganado</p>
              {loading ? (
                <Loader className="w-6 h-6 text-gray-400 animate-spin mt-2" />
              ) : (
                <p className="text-3xl font-bold text-green-600">{formatCurrency(totalEarned)}</p>
              )}
            </div>
            <DollarSign className="text-green-600" size={40} />
          </div>
        </div>
      </div>

      {/* Services List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Servicios Realizados</h2>
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 flex flex-col items-center justify-center">
            <Loader className="animate-spin text-blue-400 mb-4" size={48} />
            <p className="text-gray-600 font-semibold">Cargando historial...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl">
            <p className="font-semibold">{error}</p>
          </div>
        ) : washes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Droplets className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">No hay servicios completados en este período.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-blue-400 to-blue-500 text-white">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Vehículo</th>
                  <th className="px-6 py-3 text-left font-semibold">Tipo Servicio</th>
                  <th className="px-6 py-3 text-left font-semibold">Fecha</th>
                  <th className="px-6 py-3 text-left font-semibold">Hora Inicio</th>
                  <th className="px-6 py-3 text-left font-semibold">Hora Fin</th>
                  <th className="px-6 py-3 text-right font-semibold">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {washes.map(wash => (
                  <tr key={wash.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{wash.vehicle_plate}</td>
                    <td className="px-6 py-4 text-gray-600">{wash.service_type}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(wash.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {wash.start_time ? new Date(wash.start_time).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {wash.end_time ? new Date(wash.end_time).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-green-600">
                      {formatCurrency(wash.price || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
