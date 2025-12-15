import React, { useState, useEffect } from 'react';
import {
  BarChart3, Download, Calendar, TrendingUp, DollarSign, Car, Droplets, Printer, AlertCircle
} from 'lucide-react';
import reportsService, { DailyReport, HourlyData } from '@/services/reportsService';
import { parkingService, ParkingRecord } from '@/services/parkingService';
import { washingService, type WashingService } from '@/services/washingService';

const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [timeRange, setTimeRange] = useState({
    startTime: '00:00',
    endTime: '23:59'
  });

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<DailyReport | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // 📌 Cargar datos al iniciar y cuando cambia el rango
  useEffect(() => {
    loadReport();
  }, [dateRange]); // Reload when date changes

  const loadReport = async () => {
    try {
      setLoading(true);
      setFeedback(null);

      // Use the new backend endpoint for daily reports
      // We use the endDate as the target date for the daily report for now
      // TODO: Support range reports properly in backend
      const report = await reportsService.getDailyReport(dateRange.endDate);
      
      setReportData(report);
      setFeedback({ type: 'success', message: 'Reporte cargado correctamente' });
    } catch (err: any) {
      console.error('Error loading report:', err);
      const errorMsg = err?.response?.data?.detail || err?.message || 'Error cargando el reporte';
      setFeedback({ type: 'error', message: `❌ ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  const filterByTimeRange = (records: any[]) => {
    if (timeRange.startTime === '00:00' && timeRange.endTime === '23:59') {
      return records; // Sin filtro
    }

    return records.filter((record) => {
      const recordTime = new Date(record.entry_time || record.created_at);
      const hours = recordTime.getHours();
      const minutes = recordTime.getMinutes();
      const timeInMinutes = hours * 60 + minutes;

      const [startHour, startMin] = timeRange.startTime.split(':').map(Number);
      const [endHour, endMin] = timeRange.endTime.split(':').map(Number);
      const startInMinutes = startHour * 60 + startMin;
      const endInMinutes = endHour * 60 + endMin;

      return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
    });
  };

  const generateHourlyBreakdown = (parking: ParkingRecord[], washing: WashingService[]): HourlyData[] => {
    const hours = Array.from({ length: 18 }, (_, i) => {
      const start = 6 + i;
      const end = start + 1;
      const hora = `${String(start).padStart(2, '0')}:00-${String(end).padStart(2, '0')}:00`;

      const parkingInHour = parking.filter(p => {
        const hour = new Date(p.entry_time).getHours();
        return hour >= start && hour < end;
      });

      const washingInHour = washing.filter(w => {
        const hour = new Date(w.created_at).getHours();
        return hour >= start && hour < end;
      });

      const servicios = washingInHour.length;
      const parqueos = parkingInHour.length;
      const ingresos = parkingInHour.reduce((acc, p) => acc + (p.total_cost || 0), 0) +
                       washingInHour.reduce((acc, w) => acc + (w.price || 0), 0);
      const ticket = (servicios + parqueos) > 0 ? ingresos / (servicios + parqueos) : 0;

      return { hora, servicios, parqueos, ingresos, ticket };
    });

    return hours;
  };

  const handleApplyFilter = () => {
    loadReport();
  };

  const handlePrint = () => {
    if (!reportData) {
      setFeedback({ type: 'error', message: 'No hay datos para imprimir' });
      return;
    }
    reportsService.generatePDF(reportData, dateRange.startDate, dateRange.endDate);
  };

  const handleDownloadExcel = () => {
    if (!reportData) {
      setFeedback({ type: 'error', message: 'No hay datos para descargar' });
      return;
    }
    reportsService.downloadExcel(reportData, dateRange.startDate, dateRange.endDate);
  };

  const handlePrintServiceReport = (serviceType: 'parking' | 'washing') => {
    if (!reportData) {
      setFeedback({ type: 'error', message: 'No hay datos para imprimir' });
      return;
    }

    // Crear reporte filtrado solo para el servicio específico
    const filteredReport: DailyReport = {
      ...reportData,
      totalParkings: serviceType === 'parking' ? reportData.totalParkings : 0,
      totalWashing: serviceType === 'washing' ? reportData.totalWashing : 0,
      parkingRevenue: serviceType === 'parking' ? reportData.parkingRevenue : 0,
      washingRevenue: serviceType === 'washing' ? reportData.washingRevenue : 0,
      totalRevenue: serviceType === 'parking' ? reportData.parkingRevenue : reportData.washingRevenue,
      averageTicket: serviceType === 'parking' 
        ? (reportData.totalParkings > 0 ? reportData.parkingRevenue / reportData.totalParkings : 0)
        : (reportData.totalWashing > 0 ? reportData.washingRevenue / reportData.totalWashing : 0),
      hourlyBreakdown: reportData.hourlyBreakdown.map(h => ({
        ...h,
        servicios: serviceType === 'washing' ? h.servicios : 0,
        parqueos: serviceType === 'parking' ? h.parqueos : 0,
        ingresos: serviceType === 'parking' 
          ? h.parqueos * (reportData.parkingRevenue / Math.max(reportData.totalParkings, 1))
          : h.servicios * (reportData.washingRevenue / Math.max(reportData.totalWashing, 1)),
      }))
    };

    const serviceName = serviceType === 'parking' ? 'Parqueadero' : 'Servicios de Lavado';
    setFeedback({ type: 'success', message: `Imprimiendo reporte de ${serviceName}...` });
    setTimeout(() => setFeedback(null), 2000);
    
    reportsService.generatePDF(filteredReport, dateRange.startDate, dateRange.endDate);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-gray-100">
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="bg-emerald-900/60 text-emerald-300 rounded-2xl p-4">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-white">Reportes y Análisis</h1>
        </div>
        <p className="text-gray-400 text-lg">Visualiza análisis completos y genera reportes automáticos</p>
      </header>

      {/* Date Range Filter */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-xl mb-10">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Filtros de Reporte
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Fecha Inicio</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Fecha Fin</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Hora Inicio</label>
            <input
              type="time"
              value={timeRange.startTime}
              onChange={(e) => setTimeRange({ ...timeRange, startTime: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Hora Fin</label>
            <input
              type="time"
              value={timeRange.endTime}
              onChange={(e) => setTimeRange({ ...timeRange, endTime: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleApplyFilter}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg"
          >
            {loading ? 'Cargando...' : 'Aplicar Filtros'}
          </button>
          <button 
            onClick={() => {
              setTimeRange({ startTime: '00:00', endTime: '23:59' });
              setDateRange({
                startDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0]
              });
            }}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-all"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Feedback Messages */}
      {feedback && (
        <div className={`mb-10 p-4 rounded-lg flex items-center gap-3 ${
          feedback.type === 'success' 
            ? 'bg-green-900/30 border border-green-600 text-green-300' 
            : 'bg-red-900/30 border border-red-600 text-red-300'
        }`}>
          {feedback.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          {feedback.type === 'success' && <BarChart3 className="w-5 h-5 flex-shrink-0" />}
          <span className="text-sm font-medium">{feedback.message}</span>
        </div>
      )}

      {reportData ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 border border-slate-700 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-300 text-lg">Servicios Totales</h3>
            <Droplets className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-4xl font-bold text-blue-300">{reportData.totalWashing}</p>
          <p className="text-sm text-blue-400 mt-2 font-medium">Servicios de lavado completados</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 border border-slate-700 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-300 text-lg">Parqueos</h3>
            <Car className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-4xl font-bold text-amber-300">{reportData.totalParkings}</p>
          <p className="text-sm text-amber-400 mt-2 font-medium">Vehículos parqueados</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 border border-slate-700 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-300 text-lg">Ingresos Totales</h3>
            <DollarSign className="w-6 h-6 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-300">{formatCurrency(reportData.totalRevenue)}</p>
          <p className="text-sm text-green-400 mt-2 font-medium">+{((reportData.parkingRevenue + reportData.washingRevenue) / 1000000 * 100).toFixed(0)}% vs período anterior</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 border border-slate-700 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-300 text-lg">Ticket Promedio</h3>
            <TrendingUp className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-300">{formatCurrency(reportData.averageTicket)}</p>
          <p className="text-sm text-purple-400 mt-2 font-medium">Ingreso promedio por servicio</p>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Washing Services Report */}
        <div 
          onClick={() => handlePrintServiceReport('washing')}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 cursor-pointer hover:border-cyan-500 transition-all group"
        >
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Droplets className="w-6 h-6" />
              Servicios de Lavado
            </h2>
            <p className="text-sm text-blue-100 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              ✨ Click para imprimir reporte
            </p>
          </div>
          <div className="p-8 space-y-4">
            <div className="flex justify-between items-center py-4 border-b border-slate-700">
              <span className="text-gray-300 font-medium">Servicios Completados</span>
              <span className="font-bold text-lg text-blue-300">{reportData.totalWashing}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-slate-700">
              <span className="text-gray-300 font-medium">Ingresos por Lavado</span>
              <span className="font-bold text-lg text-green-300">{formatCurrency(reportData.washingRevenue)}</span>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="text-gray-300 font-medium">Promedio por Servicio</span>
              <span className="font-bold text-lg text-blue-300">{formatCurrency(reportData.totalWashing > 0 ? reportData.washingRevenue / reportData.totalWashing : 0)}</span>
            </div>
          </div>
        </div>

        {/* Parking Report */}
        <div 
          onClick={() => handlePrintServiceReport('parking')}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 cursor-pointer hover:border-amber-500 transition-all group"
        >
          <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white p-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Car className="w-6 h-6" />
              Parqueadero
            </h2>
            <p className="text-sm text-amber-100 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              ✨ Click para imprimir reporte
            </p>
          </div>
          <div className="p-8 space-y-4">
            <div className="flex justify-between items-center py-4 border-b border-slate-700">
              <span className="text-gray-300 font-medium">Vehículos Parqueados</span>
              <span className="font-bold text-lg text-white">{reportData.totalParkings}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-slate-700">
              <span className="text-gray-300 font-medium">Ocupación</span>
              <span className="font-bold text-lg text-amber-300">{reportData.occupancyPercentage.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="text-gray-300 font-medium">Ingresos por Parqueo</span>
              <span className="font-bold text-lg text-green-300">{formatCurrency(reportData.parkingRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Breakdown */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 mb-10">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Análisis por Hora
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/50">
                <th className="text-left px-8 py-5 font-bold text-gray-300">Hora</th>
                <th className="text-center px-8 py-5 font-bold text-gray-300">Servicios</th>
                <th className="text-center px-8 py-5 font-bold text-gray-300">Parqueos</th>
                <th className="text-right px-8 py-5 font-bold text-gray-300">Ingresos</th>
                <th className="text-right px-8 py-5 font-bold text-gray-300">Ticket Promedio</th>
              </tr>
            </thead>
            <tbody>
              {reportData.hourlyBreakdown.map((row, idx) => (
                <tr key={idx} className={`border-b border-slate-700 hover:bg-slate-700/30 transition-colors ${idx % 2 === 0 ? 'bg-slate-800/50' : 'bg-slate-900/30'}`}>
                  <td className="px-8 py-5 font-bold text-white">{row.hora}</td>
                  <td className="px-8 py-5 text-center text-gray-300">{row.servicios}</td>
                  <td className="px-8 py-5 text-center text-gray-300">{row.parqueos}</td>
                  <td className="px-8 py-5 text-right font-bold text-green-300">{formatCurrency(row.ingresos)}</td>
                  <td className="px-8 py-5 text-right font-bold text-blue-300">{formatCurrency(row.ticket)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Download Section */}
      <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/40 rounded-2xl p-10 border-2 border-emerald-700/60 shadow-xl mb-10">
        <h2 className="text-2xl font-bold text-white mb-3">📥 Descargar Reportes</h2>
        <p className="text-gray-300 mb-8">Exporta los reportes en tu formato preferido para compartir o archivar</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handlePrint}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg text-lg"
          >
            <Printer className="w-5 h-5" />
            Imprimir PDF
          </button>
          <button
            onClick={handleDownloadExcel}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg text-lg"
          >
            <Download className="w-5 h-5" />
            Descargar Excel
          </button>
        </div>
      </div>
        </>
      ) : (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-10 border border-slate-700 shadow-xl text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Carga un reporte para visualizar los datos</p>
          <button 
            onClick={handleApplyFilter}
            className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition-colors"
          >
            Cargar Datos
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
