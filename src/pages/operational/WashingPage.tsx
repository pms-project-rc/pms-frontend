import React, { useState, useEffect } from 'react';
import {
  Droplets, Plus, X, Clock, DollarSign, AlertCircle, CheckCircle2, AlertTriangle, Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { washingService } from '@/services/washingService';
import { washerService, Washer } from '@/services/washerService';

interface WashingRequest {
  id: number;
  vehiclePlate: string;
  washType: string;
  washerAssigned: string | null;
  washerId?: number;
  status: 'pending' | 'in_progress' | 'completed';
  totalPrice: number;
  clientName?: string;
  createdAt: string;
}

const WashingPage: React.FC = () => {
  const { user } = useAuth();

  const [washingRequests, setWashingRequests] = useState<WashingRequest[]>([]);
  const [washers, setWashers] = useState<Washer[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [selectedServiceForWasher, setSelectedServiceForWasher] = useState<number | null>(null);
  const [selectedWasherId, setSelectedWasherId] = useState<number | null>(null);

  const [showNewWashing, setShowNewWashing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newWashingForm, setNewWashingForm] = useState({
    vehiclePlate: '',
    clientName: '',
    washType: 'basic' as const,
  });

  const washPrices = {
    basic: 35000,
    premium: 45000,
    deluxe: 60000
  };

  // 📌 Cargar servicios activos y lavadores al iniciar
  useEffect(() => {
    loadActiveServices();
    loadWashers();
  }, []);

  const loadActiveServices = async () => {
    try {
      setLoading(true);
      const data = await washingService.getActiveServices();

      const mapped: WashingRequest[] = data.map((w) => ({
        id: w.id,
        vehiclePlate: w.vehicle_plate,
        washType: w.service_type.toLowerCase(),
        washerAssigned: w.washer_name || null,
        washerId: w.washer_id,
        status: w.status as 'pending' | 'in_progress' | 'completed',
        totalPrice: w.price,
        createdAt: w.created_at
      }));

      setWashingRequests(mapped);
      setFeedback(null);
    } catch (err) {
      console.error("Error cargando servicios de lavado:", err);
      setFeedback({ type: 'error', message: 'Error cargando servicios de lavado' });
    } finally {
      setLoading(false);
    }
  };

  const loadWashers = async () => {
    try {
      const data = await washerService.getWashers();
      const activeWashers = data.filter(w => w.is_active);
      setWashers(activeWashers);
    } catch (err) {
      console.error("Error cargando lavadores:", err);
    }
  };

  const handleAddWashing = async () => {
    if (!newWashingForm.vehiclePlate.trim()) {
      setFeedback({ type: 'error', message: 'Por favor ingresa la placa del vehículo' });
      return;
    }

    try {
      setSubmitting(true);
      await washingService.createService({
        vehicle_plate: newWashingForm.vehiclePlate.toUpperCase(),
        service_type: newWashingForm.washType,
        price: washPrices[newWashingForm.washType as keyof typeof washPrices],
        vehicle_type: 'carro',
        owner_name: newWashingForm.clientName || user?.username || 'Sistema'
      });

      setFeedback({ type: 'success', message: '✅ Servicio registrado correctamente' });

      // Recargar la tabla
      await loadActiveServices();

      setNewWashingForm({ vehiclePlate: '', clientName: '', washType: 'basic' });
      setShowNewWashing(false);

      // Auto-hide feedback after 3 seconds
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || 'Error registrando servicio';
      setFeedback({ type: 'error', message: `❌ ${errorMsg}` });
      console.error("Error registrando servicio:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: 'pending' | 'in_progress' | 'completed') => {
    try {
      if (newStatus === 'in_progress') {
        // Si no hay lavador seleccionado, abrir modal para seleccionar
        if (!selectedWasherId) {
          setSelectedServiceForWasher(id);
          return;
        }
        // Si hay lavador, asignarlo
        await washingService.assignWasher(id, selectedWasherId);
        setSelectedWasherId(null);
      } else if (newStatus === 'completed') {
        await washingService.completeService(id);
      }

      setFeedback({ type: 'success', message: '✅ Estado actualizado' });
      await loadActiveServices();

      // Auto-hide feedback after 3 seconds
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || 'Error actualizando estado';
      setFeedback({ type: 'error', message: `❌ ${errorMsg}` });
      console.error("Error actualizando estado:", err);
    }
  };

  const handleAssignWasher = async (serviceId: number, washerId: number) => {
    try {
      setSubmitting(true);
      await washingService.assignWasher(serviceId, washerId);

      setFeedback({ type: 'success', message: '✅ Lavador asignado correctamente' });
      await loadActiveServices();

      setSelectedServiceForWasher(null);
      setSelectedWasherId(null);

      // Auto-hide feedback after 3 seconds
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || 'Error asignando lavador';
      setFeedback({ type: 'error', message: `❌ ${errorMsg}` });
      console.error("Error asignando lavador:", err);
    } finally {
      setSubmitting(false);
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: '⏳ Por Iniciar', bg: 'bg-yellow-500', light: 'bg-yellow-50' };
      case 'in_progress':
        return { label: '🔄 En Proceso', bg: 'bg-blue-500', light: 'bg-blue-50' };
      case 'completed':
        return { label: '✅ Completados', bg: 'bg-green-500', light: 'bg-green-50' };
      default:
        return { label: 'Desconocido', bg: 'bg-gray-500', light: 'bg-gray-50' };
    }
  };

  const getWashTypeColor = (washType: string) => {
    switch (washType) {
      case 'basic':
        return { badge: 'bg-yellow-100 text-yellow-800', label: 'Básico' };
      case 'premium':
        return { badge: 'bg-purple-100 text-purple-800', label: 'Premium' };
      case 'deluxe':
        return { badge: 'bg-pink-100 text-pink-800', label: 'Deluxe' };
      default:
        return { badge: 'bg-gray-100 text-gray-800', label: washType };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-gray-100">
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="bg-cyan-900/60 text-cyan-300 rounded-2xl p-4">
            <Droplets className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-white">Servicios de Lavado</h1>
        </div>
        <p className="text-gray-400 text-lg">Registra, asigna y gestiona los servicios de lavado</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 border border-slate-700 shadow-xl">
          <h3 className="font-semibold text-gray-300 text-lg">Por Iniciar</h3>
          <p className="text-4xl font-bold text-amber-300 mt-3">
            {washingRequests.filter(w => w.status === 'pending').length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 border border-slate-700 shadow-xl">
          <h3 className="font-semibold text-gray-300 text-lg">En Proceso</h3>
          <p className="text-4xl font-bold text-blue-300 mt-3">
            {washingRequests.filter(w => w.status === 'in_progress').length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 border border-slate-700 shadow-xl">
          <h3 className="font-semibold text-gray-300 text-lg">Completados</h3>
          <p className="text-4xl font-bold text-green-300 mt-3">
            {washingRequests.filter(w => w.status === 'completed').length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 border border-slate-700 shadow-xl">
          <h3 className="font-semibold text-gray-300 text-lg">Ingresos</h3>
          <p className="text-2xl font-bold text-purple-300 mt-3">
            {formatCurrency(washingRequests.reduce((sum, w) => sum + w.totalPrice, 0))}
          </p>
        </div>
      </div>

      {/* Feedback Messages */}
      {feedback && (
        <div className={`mb-10 p-6 rounded-2xl border-2 flex items-center gap-4 ${
          feedback.type === 'success' 
            ? 'bg-green-900/30 border-green-600 text-green-300' 
            : 'bg-red-900/30 border-red-600 text-red-300'
        }`}>
          {feedback.type === 'success' 
            ? <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            : <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          }
          <span className="font-semibold text-lg">{feedback.message}</span>
        </div>
      )}

      {/* New Washing Form - Modern Card Design */}
      {showNewWashing ? (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-10 border-2 border-cyan-600/60 shadow-2xl mb-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white">Nuevo Servicio de Lavado</h2>
              <p className="text-gray-400 mt-2">Completa los datos del servicio</p>
            </div>
            <button
              onClick={() => setShowNewWashing(false)}
              className="p-3 hover:bg-slate-700 rounded-xl transition-colors text-gray-400 hover:text-gray-200"
            >
              <X className="w-7 h-7" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Placa Input */}
            <div>
              <label className="block text-lg font-semibold text-gray-300 mb-3">Placa del Vehículo</label>
              <input
                type="text"
                placeholder="Ej: ABC-123"
                value={newWashingForm.vehiclePlate}
                onChange={(e) => setNewWashingForm({ ...newWashingForm, vehiclePlate: e.target.value.toUpperCase() })}
                disabled={submitting}
                className="w-full px-5 py-4 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>

            {/* Cliente Input */}
            <div>
              <label className="block text-lg font-semibold text-gray-300 mb-3">Nombre del Cliente</label>
              <input
                type="text"
                placeholder="Ej: Juan Pérez"
                value={newWashingForm.clientName}
                onChange={(e) => setNewWashingForm({ ...newWashingForm, clientName: e.target.value })}
                disabled={submitting}
                className="w-full px-5 py-4 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>

            {/* Tipo de Lavado */}
            <div>
              <label className="block text-lg font-semibold text-gray-300 mb-3">Tipo de Servicio</label>
              <select
                value={newWashingForm.washType}
                onChange={(e) => setNewWashingForm({ ...newWashingForm, washType: e.target.value as any })}
                disabled={submitting}
                className="w-full px-5 py-4 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all disabled:opacity-50"
              >
                <option value="basic">🧼 Básico - $35.000</option>
                <option value="premium">✨ Premium - $45.000</option>
                <option value="deluxe">👑 Deluxe - $60.000</option>
              </select>
            </div>

            {/* Resumen */}
            <div className="bg-slate-700/50 border-2 border-slate-600 rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-3">Resumen del servicio:</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Tipo:</span>
                  <span className="font-semibold text-white">
                    {newWashingForm.washType === 'basic' ? 'Básico' : newWashingForm.washType === 'premium' ? 'Premium' : 'Deluxe'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-600">
                  <span className="text-gray-300">Precio:</span>
                  <span className="font-semibold text-cyan-300">
                    ${washPrices[newWashingForm.washType as keyof typeof washPrices].toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
            <button
              onClick={() => setShowNewWashing(false)}
              disabled={submitting}
              className="px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg rounded-xl transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddWashing}
              disabled={submitting || !newWashingForm.vehiclePlate.trim()}
              className="px-6 py-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:from-gray-600 disabled:to-gray-500 text-white font-bold text-lg rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Registrando...
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6" />
                  Registrar Servicio
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowNewWashing(true)}
          className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white px-8 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl mb-10 text-lg hover:shadow-2xl"
        >
          <Plus className="w-7 h-7" />
          Nuevo Servicio de Lavado
        </button>
      )}

      {/* Washing Services by Status */}
      {['pending', 'in_progress', 'completed'].map((status) => {
        const config = getStatusConfig(status);
        const items = washingRequests.filter(w => w.status === status as any);

        return (
          <div key={status} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 mb-10">
            <div className={`${config.bg} text-white p-8`}>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Droplets className="w-7 h-7" />
                {config.label}
              </h2>
              <p className="text-white/80 mt-2 text-lg">Total: {items.length} servicios</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/50">
                    <th className="text-left px-8 py-5 font-bold text-gray-300">Placa</th>
                    <th className="text-left px-8 py-5 font-bold text-gray-300">Cliente</th>
                    <th className="text-left px-8 py-5 font-bold text-gray-300">Tipo</th>
                    <th className="text-center px-8 py-5 font-bold text-gray-300">Lavador</th>
                    <th className="text-right px-8 py-5 font-bold text-gray-300">Precio</th>
                    <th className="text-center px-8 py-5 font-bold text-gray-300">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-16 text-center">
                        <AlertCircle className="w-14 h-14 mx-auto mb-4 text-slate-600" />
                        <p className="font-semibold text-gray-400 text-lg">No hay servicios en este estado</p>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={item.id} className={`border-b border-slate-700 hover:bg-slate-700/30 transition-colors ${idx % 2 === 0 ? 'bg-slate-800/50' : 'bg-slate-900/30'}`}>
                        <td className="px-8 py-5 font-bold text-white text-lg">{item.vehiclePlate}</td>
                        <td className="px-8 py-5 text-gray-300">{item.clientName || 'Sistema'}</td>
                        <td className="px-8 py-5">
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getWashTypeColor(item.washType).badge}`}>
                            {getWashTypeColor(item.washType).label}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-center text-sm text-gray-400">
                          {item.washerAssigned || '—'}
                        </td>
                        <td className="px-8 py-5 text-right font-bold text-cyan-300 text-lg">
                          {formatCurrency(item.totalPrice)}
                        </td>
                        <td className="px-8 py-5 text-center">
                          {status === 'pending' && (
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'in_progress')}
                              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                            >
                              Iniciar
                            </button>
                          )}
                          {status === 'in_progress' && (
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'completed')}
                              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                            >
                              Completar
                            </button>
                          )}
                          {status === 'completed' && (
                            <span className="text-gray-400 text-sm">✅ Finalizado</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Modal para Asignar Lavador */}
      {selectedServiceForWasher !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border-2 border-cyan-600/60 shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <Users className="w-7 h-7 text-cyan-400" />
                Asignar Lavador
              </h3>
              <button
                onClick={() => {
                  setSelectedServiceForWasher(null);
                  setSelectedWasherId(null);
                }}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {washers.length === 0 ? (
              <div className="py-8 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
                <p className="text-gray-300 font-semibold">No hay lavadores disponibles</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-8 max-h-64 overflow-y-auto">
                  {washers.map((washer) => (
                    <button
                      key={washer.id}
                      onClick={() => setSelectedWasherId(washer.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left font-semibold ${
                        selectedWasherId === washer.id
                          ? 'border-cyan-500 bg-cyan-900/30 text-cyan-300'
                          : 'border-slate-600 bg-slate-700/50 text-gray-300 hover:border-cyan-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-600/40 flex items-center justify-center">
                          <Users className="w-5 h-5 text-cyan-300" />
                        </div>
                        <div>
                          <p className="font-bold">{washer.name}</p>
                          {washer.phone && <p className="text-xs text-gray-400">{washer.phone}</p>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setSelectedServiceForWasher(null);
                      setSelectedWasherId(null);
                    }}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (selectedWasherId && selectedServiceForWasher) {
                        handleAssignWasher(selectedServiceForWasher, selectedWasherId);
                      }
                    }}
                    disabled={!selectedWasherId || submitting}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:from-gray-600 disabled:to-gray-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Asignando...
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5" />
                        Asignar
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WashingPage;
