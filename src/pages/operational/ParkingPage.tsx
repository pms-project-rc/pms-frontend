import React, { useState, useEffect } from 'react';
import {
  Car, Plus, X, Clock, DollarSign, AlertCircle, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { parkingService } from '@/services/parkingService';

interface ParkingEntry {
  id: number;
  vehiclePlate: string;
  vehicleType: string;
  entryTime: Date;
  helmets: number;
  helmetCost: number;
  operator: string;
  totalCost?: number;
}

const ParkingPage: React.FC = () => {
  const { user } = useAuth();

  // 🔥 Ahora la data viene del backend
  const [parkingEntries, setParkingEntries] = useState<ParkingEntry[]>([]);
  const [completedEntries, setCompletedEntries] = useState<ParkingEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [showNewParking, setShowNewParking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newParkingForm, setNewParkingForm] = useState({
    vehiclePlate: '',
    vehicleType: 'car' as 'car' | 'motorcycle',
    helmets: 0,
  });

  // 📊 Configuración editable
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    helmetCostPerUnit: 5000,
    freeParking: 0, // 0 horas gratis para coincidir con backend
    parkingRateCarPerMinute: 2000 / 60, // Base 2000/hora
    parkingRateMotorcyclePerMinute: 1000 / 60, // Base 1000/hora
    maxCapacity: 30, // espacios máximos
  });

  const helmetCostPerUnit = config.helmetCostPerUnit;
  const freeParking = config.freeParking;
  const parkingRateCar = config.parkingRateCarPerMinute * 60; // convertir a hora para display
  const parkingRateMotorcycle = config.parkingRateMotorcyclePerMinute * 60;

  // 📌 Cargar vehículos activos al iniciar
  useEffect(() => {
    loadActiveVehicles();
    loadCompletedVehicles();
  }, []);

  // 🕐 Actualizar tiempos cada segundo para que "corran"
  useEffect(() => {
    const interval = setInterval(() => {
      setParkingEntries(entries => [...entries]); // Force re-render to update times
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadActiveVehicles = async () => {
    try {
      setLoading(true);
      const data = await parkingService.getActiveVehicles();

      const mapped: ParkingEntry[] = data.map((p) => ({
        id: p.id,
        vehiclePlate: p.plate,
        vehicleType: p.vehicle_type,
        entryTime: new Date(p.entry_time),
        helmets: p.helmet_count || 0,
        helmetCost: (p.helmet_count || 0) * helmetCostPerUnit,
        operator: p.owner_name || 'Sistema'
      }));

      setParkingEntries(mapped);
      setFeedback(null);
    } catch (err) {
      console.error("Error cargando parqueos activos:", err);
      setFeedback({ type: 'error', message: 'Error cargando vehículos activos' });
    } finally {
      setLoading(false);
    }
  };

  const loadCompletedVehicles = async () => {
    try {
      const data = await parkingService.getAllRecords();
      
      console.log('All records:', data); // Debug
      
      // Filtrar solo los completados (los que tienen exit_time)
      const completed = data.filter(p => p.exit_time != null);
      
      console.log('Completed records:', completed); // Debug
      
      const mapped: ParkingEntry[] = completed.map((p) => ({
        id: p.id,
        vehiclePlate: p.plate,
        vehicleType: p.vehicle_type,
        entryTime: new Date(p.entry_time),
        helmets: p.helmet_count || 0,
        helmetCost: (p.helmet_count || 0) * helmetCostPerUnit,
        operator: p.owner_name || 'Sistema',
        totalCost: p.total_cost || 0
      }));

      setCompletedEntries(mapped);
    } catch (err) {
      console.error("Error cargando historial:", err);
    }
  };

  const calculateParkingCharge = (entry: ParkingEntry) => {
    const nowTime = new Date();
    const durationMs = nowTime.getTime() - entry.entryTime.getTime();
    // Backend logic: Ceiling to nearest hour, minimum 1 hour
    const hours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));

    // Tarifas fijas por hora (coincidiendo con backend)
    const hourlyRate = entry.vehicleType.toLowerCase().includes('moto') || entry.vehicleType === 'motorcycle'
      ? 1000
      : 2000;

    return (hours * hourlyRate) + (entry.helmetCost || 0);
  };

  // 🟢 Registrar entrada real al backend
  const handleAddParking = async () => {
    if (!newParkingForm.vehiclePlate.trim()) {
      setFeedback({ type: 'error', message: 'Por favor ingresa la placa del vehículo' });
      return;
    }

    try {
      setSubmitting(true);
      await parkingService.registerEntry({
        plate: newParkingForm.vehiclePlate.toUpperCase(),
        vehicle_type: newParkingForm.vehicleType === 'motorcycle' ? 'Moto' : 'Carro',
        owner_name: user?.username || 'Sistema',
        helmet_count: newParkingForm.helmets
      });

      setFeedback({ type: 'success', message: '✅ Vehículo registrado correctamente' });

      // Recargar la tabla
      await loadActiveVehicles();
      await loadCompletedVehicles();

      setNewParkingForm({ vehiclePlate: '', vehicleType: 'car', helmets: 0 });
      setShowNewParking(false);

      // Auto-hide feedback after 3 seconds
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || 'Error registrando entrada';
      setFeedback({ type: 'error', message: `❌ ${errorMsg}` });
      console.error("Error registrando entrada:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // 🔴 Registrar salida real al backend
  const handleCheckoutParking = async (id: number, plate: string) => {
    try {
      setSubmitting(true);
      await parkingService.registerExit({ plate });

      setFeedback({ type: 'success', message: `✅ Salida procesada: ${plate}` });

      // Recargar
      await loadActiveVehicles();
      await loadCompletedVehicles();

      // Auto-hide feedback after 3 seconds
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || 'Error registrando salida';
      setFeedback({ type: 'error', message: `❌ ${errorMsg}` });
      console.error("Error registrando salida:", err);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-gray-100">
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="bg-amber-900/60 text-amber-300 rounded-2xl p-4">
            <Car className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-white">Gestión de Parqueadero</h1>
        </div>
        <p className="text-gray-400 text-lg">Administra los vehículos y cobros</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 border border-slate-700 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-300 text-lg">Vehículos Activos</h3>
            <Car className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-4xl font-bold text-amber-300">{parkingEntries.length}</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 border border-slate-700 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-300 text-lg">Ingresos Parqueo</h3>
            <DollarSign className="w-6 h-6 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-300">
            {formatCurrency(
              completedEntries.reduce((sum, p) => sum + (p.totalCost || 0), 0) +
              parkingEntries.reduce((sum, p) => sum + calculateParkingCharge(p), 0)
            )}
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 border border-slate-700 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-300 text-lg">Ocupación</h3>
            <AlertCircle className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-4xl font-bold text-blue-300">
            {Math.round((parkingEntries.length / config.maxCapacity) * 100)}%
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {parkingEntries.length} / {config.maxCapacity} espacios
          </p>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border-2 border-blue-600/60 shadow-2xl mb-10 overflow-hidden">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="w-full p-6 flex items-center justify-between hover:bg-slate-700/30 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-900/60 text-blue-300 rounded-xl p-3">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold text-white">⚙️ Configuración de Tarifas y Capacidad</h2>
              <p className="text-gray-400 mt-1 text-sm">
                {showConfig ? 'Click para ocultar' : 'Click para editar tarifas por minuto y capacidad máxima'}
              </p>
            </div>
          </div>
          <div className={`transform transition-transform ${showConfig ? 'rotate-180' : ''}`}>
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {showConfig && (
          <div className="p-8 border-t-2 border-slate-700">
            {/* Tarifas Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-amber-400" />
                Tarifas de Parqueo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tarifa Auto por Minuto */}
                <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl p-6 border-2 border-slate-600 hover:border-amber-500/50 transition-all">
                  <label className="block text-base font-bold text-gray-200 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🚗</span>
                    Tarifa Auto (por minuto)
                  </label>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-amber-400 font-bold text-xl">$</span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={config.parkingRateCarPerMinute}
                      onChange={(e) => setConfig({ ...config, parkingRateCarPerMinute: parseInt(e.target.value) || 0 })}
                      className="flex-1 px-5 py-3 bg-slate-900 border-2 border-slate-600 rounded-xl text-white font-bold text-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                    <span className="text-gray-400 font-semibold">/min</span>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-600">
                    <p className="text-sm text-gray-400">Equivalente por hora:</p>
                    <p className="text-lg font-bold text-amber-300">
                      ${(config.parkingRateCarPerMinute * 60).toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>

                {/* Tarifa Moto por Minuto */}
                <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl p-6 border-2 border-slate-600 hover:border-amber-500/50 transition-all">
                  <label className="block text-base font-bold text-gray-200 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🏍️</span>
                    Tarifa Moto (por minuto)
                  </label>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-amber-400 font-bold text-xl">$</span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={config.parkingRateMotorcyclePerMinute}
                      onChange={(e) => setConfig({ ...config, parkingRateMotorcyclePerMinute: parseInt(e.target.value) || 0 })}
                      className="flex-1 px-5 py-3 bg-slate-900 border-2 border-slate-600 rounded-xl text-white font-bold text-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                    <span className="text-gray-400 font-semibold">/min</span>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-600">
                    <p className="text-sm text-gray-400">Equivalente por hora:</p>
                    <p className="text-lg font-bold text-amber-300">
                      ${(config.parkingRateMotorcyclePerMinute * 60).toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración General */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-400" />
                Configuración General
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tiempo Gratuito */}
                <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl p-6 border-2 border-slate-600 hover:border-blue-500/50 transition-all">
                  <label className="block text-base font-bold text-gray-200 mb-4 flex items-center gap-2">
                    <span className="text-2xl">⏱️</span>
                    Tiempo Gratuito
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={config.freeParking}
                      onChange={(e) => setConfig({ ...config, freeParking: parseInt(e.target.value) || 0 })}
                      className="flex-1 px-5 py-3 bg-slate-900 border-2 border-slate-600 rounded-xl text-white font-bold text-xl text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <span className="text-gray-400 font-semibold">horas</span>
                  </div>
                </div>

                {/* Costo por Casco */}
                <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl p-6 border-2 border-slate-600 hover:border-blue-500/50 transition-all">
                  <label className="block text-base font-bold text-gray-200 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🪖</span>
                    Costo por Casco
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-bold text-xl">$</span>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={config.helmetCostPerUnit}
                      onChange={(e) => setConfig({ ...config, helmetCostPerUnit: parseInt(e.target.value) || 0 })}
                      className="flex-1 px-5 py-3 bg-slate-900 border-2 border-slate-600 rounded-xl text-white font-bold text-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Capacidad Máxima */}
                <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl p-6 border-2 border-slate-600 hover:border-blue-500/50 transition-all">
                  <label className="block text-base font-bold text-gray-200 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🅿️</span>
                    Capacidad Máxima
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={config.maxCapacity}
                      onChange={(e) => setConfig({ ...config, maxCapacity: parseInt(e.target.value) || 1 })}
                      className="flex-1 px-5 py-3 bg-slate-900 border-2 border-slate-600 rounded-xl text-white font-bold text-xl text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <span className="text-gray-400 font-semibold">espacios</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 rounded-2xl p-6 border-2 border-blue-600/50">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500/20 rounded-lg p-3">
                  <AlertCircle className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h4 className="text-blue-200 font-bold text-lg mb-2">
                    💡 Información Importante
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Los cambios en las tarifas se aplican <strong className="text-blue-300">inmediatamente</strong> a todos los cálculos en tiempo real. 
                    El cobro se actualiza automáticamente cada segundo para reflejar el tiempo transcurrido.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
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

      {/* New Parking Form - Modern Card Design */}
      {showNewParking ? (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-10 border-2 border-amber-600/60 shadow-2xl mb-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white">Nuevo Ingreso de Vehículo</h2>
              <p className="text-gray-400 mt-2">Completa los datos del vehículo que ingresa</p>
            </div>
            <button
              onClick={() => setShowNewParking(false)}
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
                value={newParkingForm.vehiclePlate}
                onChange={(e) => setNewParkingForm({ ...newParkingForm, vehiclePlate: e.target.value.toUpperCase() })}
                disabled={submitting}
                className="w-full px-5 py-4 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all disabled:opacity-50"
              />
              <p className="text-sm text-gray-500 mt-2">Formato: LLL-NNN</p>
            </div>

            {/* Tipo de Vehículo */}
            <div>
              <label className="block text-lg font-semibold text-gray-300 mb-3">Tipo de Vehículo</label>
              <select
                value={newParkingForm.vehicleType}
                onChange={(e) => setNewParkingForm({ ...newParkingForm, vehicleType: e.target.value as any })}
                disabled={submitting}
                className="w-full px-5 py-4 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all disabled:opacity-50"
              >
                <option value="car">🚗 Automóvil</option>
                <option value="motorcycle">🏍️ Motocicleta</option>
              </select>
              <p className="text-sm text-gray-500 mt-2">Selecciona el tipo de vehículo</p>
            </div>

            {/* Cascos */}
            <div>
              <label className="block text-lg font-semibold text-gray-300 mb-3">Cascos a Guardar</label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={newParkingForm.helmets}
                  onChange={(e) => setNewParkingForm({ ...newParkingForm, helmets: Math.max(0, parseInt(e.target.value) || 0) })}
                  disabled={submitting}
                  className="flex-1 px-5 py-4 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all disabled:opacity-50"
                />
                <span className="text-2xl font-bold text-amber-400 min-w-24 text-right">
                  ${(newParkingForm.helmets * helmetCostPerUnit).toLocaleString('es-CO')}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">A ${helmetCostPerUnit.toLocaleString('es-CO')} c/u</p>
            </div>

            {/* Summary */}
            <div className="bg-slate-700/50 border-2 border-slate-600 rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-3">Resumen de entrada:</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Tipo:</span>
                  <span className="font-semibold text-white">
                    {newParkingForm.vehicleType === 'car' ? 'Automóvil' : 'Motocicleta'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-600">
                  <span className="text-gray-300">Costo Cascos:</span>
                  <span className="font-semibold text-amber-300">
                    ${(newParkingForm.helmets * helmetCostPerUnit).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
            <button
              onClick={() => setShowNewParking(false)}
              disabled={submitting}
              className="px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg rounded-xl transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddParking}
              disabled={submitting || !newParkingForm.vehiclePlate.trim()}
              className="px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:from-gray-600 disabled:to-gray-500 text-white font-bold text-lg rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Registrando...
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6" />
                  Registrar Vehículo
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowNewParking(true)}
          className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-8 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl mb-10 text-lg hover:shadow-2xl"
        >
          <Plus className="w-7 h-7" />
          Nuevo Ingreso de Vehículo
        </button>
      )}

      {/* Parking Table */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 mb-10">
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white p-8">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Car className="w-7 h-7" />
            Vehículos Parqueados
          </h2>
          <p className="text-amber-100 mt-2 text-lg">Total: {parkingEntries.length} vehículos activos</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/50">
                <th className="text-left px-8 py-5 font-bold text-gray-300">Placa</th>
                <th className="text-left px-8 py-5 font-bold text-gray-300">Tipo</th>
                <th className="text-left px-8 py-5 font-bold text-gray-300">Entrada</th>
                <th className="text-left px-8 py-5 font-bold text-gray-300">Tiempo</th>
                <th className="text-center px-8 py-5 font-bold text-gray-300">Cascos</th>
                <th className="text-right px-8 py-5 font-bold text-gray-300">Cobro</th>
                <th className="text-center px-8 py-5 font-bold text-gray-300">Acción</th>
              </tr>
            </thead>
            <tbody>
              {parkingEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-16 text-center">
                    <AlertCircle className="w-14 h-14 mx-auto mb-4 text-slate-600" />
                    <p className="font-semibold text-gray-400 text-lg">No hay vehículos parqueados</p>
                  </td>
                </tr>
              ) : (
                parkingEntries.map((entry, idx) => {
                  const hoursParked = (new Date().getTime() - entry.entryTime.getTime()) / (1000 * 60 * 60);
                  const charge = calculateParkingCharge(entry);
                  return (
                    <tr key={entry.id} className={`border-b border-slate-700 hover:bg-slate-700/30 transition-colors ${idx % 2 === 0 ? 'bg-slate-800/50' : 'bg-slate-900/30'}`}>
                      <td className="px-8 py-5 font-bold text-white text-lg">{entry.vehiclePlate}</td>
                      <td className="px-8 py-5 text-gray-300">
                        {entry.vehicleType.toLowerCase().includes('moto') ? '🏍️ Moto' : '🚗 Auto'}
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-400">
                        {entry.entryTime.toLocaleTimeString('es-CO')}
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-blue-400" />
                          {hoursParked.toFixed(1)}h
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        {entry.helmets > 0 && (
                          <span className="bg-blue-900/60 text-blue-300 px-3 py-1 rounded-full font-bold text-sm border border-blue-800/50">
                            {entry.helmets}
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right font-bold text-amber-300 text-lg">
                        {formatCurrency(charge)}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <button
                         onClick={() => handleCheckoutParking(entry.id, entry.vehiclePlate)}
                          className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-lg"
                        >
                          Cobrar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-xl">
          <h3 className="font-bold text-white text-lg mb-6">📋 Tarifas Vigentes</h3>
          <div className="space-y-4 text-sm text-gray-300">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <span>Parqueo Gratuito:</span>
              <span className="text-amber-300 font-bold">{config.freeParking} horas</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <span>Auto (por minuto):</span>
              <span className="text-amber-300 font-bold">${config.parkingRateCarPerMinute.toLocaleString('es-CO')}/min</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <span>Auto (por hora):</span>
              <span className="text-amber-300 font-bold">${(config.parkingRateCarPerMinute * 60).toLocaleString('es-CO')}/hora</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <span>Moto (por minuto):</span>
              <span className="text-amber-300 font-bold">${config.parkingRateMotorcyclePerMinute.toLocaleString('es-CO')}/min</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <span>Moto (por hora):</span>
              <span className="text-amber-300 font-bold">${(config.parkingRateMotorcyclePerMinute * 60).toLocaleString('es-CO')}/hora</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Casco:</span>
              <span className="text-amber-300 font-bold">${config.helmetCostPerUnit.toLocaleString('es-CO')} c/u</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-xl">
          <h3 className="font-bold text-white text-lg mb-6">📊 Estadísticas del Día</h3>
          <div className="space-y-4 text-sm text-gray-300">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <span>Capacidad Total:</span>
              <span className="text-blue-300 font-bold">{config.maxCapacity} espacios</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <span>Vehículos Activos:</span>
              <span className="text-blue-300 font-bold">{parkingEntries.length} vehículos</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <span>Ocupación Actual:</span>
              <span className="text-blue-300 font-bold">
                {Math.round((parkingEntries.length / config.maxCapacity) * 100)}%
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <span>Ingresos Actuales:</span>
              <span className="text-green-300 font-bold">
                {formatCurrency(parkingEntries.reduce((sum, p) => sum + calculateParkingCharge(p), 0))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Cascos en Sistema:</span>
              <span className="text-blue-300 font-bold">
                {parkingEntries.reduce((sum, p) => sum + p.helmets, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Cobros Completados */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border-2 border-green-600/60 shadow-2xl overflow-hidden">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full p-6 flex items-center justify-between hover:bg-slate-700/30 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="bg-green-900/60 text-green-300 rounded-xl p-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-white text-xl">📜 Historial de Cobros</h3>
              <p className="text-gray-400 text-sm">Ver registros de vehículos que ya fueron cobrados</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Completados</p>
              <p className="text-2xl font-bold text-green-300">{completedEntries.length}</p>
            </div>
            <div className={`transform transition-transform ${showHistory ? 'rotate-180' : ''}`}>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </button>

        {showHistory && (
          <div className="border-t border-green-600/30">
            {completedEntries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-green-700/30 bg-green-900/20">
                      <th className="text-left px-8 py-5 font-bold text-gray-300">Placa</th>
                      <th className="text-center px-8 py-5 font-bold text-gray-300">Tipo</th>
                      <th className="text-center px-8 py-5 font-bold text-gray-300">Entrada</th>
                      <th className="text-center px-8 py-5 font-bold text-gray-300">Cascos</th>
                      <th className="text-right px-8 py-5 font-bold text-gray-300">Cobro Realizado</th>
                      <th className="text-center px-8 py-5 font-bold text-gray-300">Operador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedEntries.slice(0, 20).map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-slate-700 hover:bg-green-900/10 transition-colors"
                      >
                        <td className="px-8 py-5 font-bold text-white">{entry.vehiclePlate}</td>
                        <td className="px-8 py-5 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            entry.vehicleType.toLowerCase().includes('moto') || entry.vehicleType === 'motorcycle'
                              ? 'bg-purple-900/50 text-purple-300'
                              : 'bg-blue-900/50 text-blue-300'
                          }`}>
                            {entry.vehicleType.toLowerCase().includes('moto') || entry.vehicleType === 'motorcycle' ? '🏍️ Moto' : '🚗 Carro'}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-center text-gray-300">
                          {entry.entryTime.toLocaleString('es-CO', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </td>
                        <td className="px-8 py-5 text-center text-gray-300">{entry.helmets}</td>
                        <td className="px-8 py-5 text-right font-bold text-green-300">
                          {formatCurrency(entry.totalCost || 0)}
                        </td>
                        <td className="px-8 py-5 text-center text-gray-400">{entry.operator}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-gray-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay cobros completados todavía</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkingPage;
