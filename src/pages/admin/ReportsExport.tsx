import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, FileSpreadsheet, File, Loader, FileType, Eye } from 'lucide-react';
import { reportService } from '@/services/reportService';
import { washerService } from '@/services/washerService';

type ReportType = 'income_expenses' | 'washing' | 'parking' | 'payroll';
type ExportFormat = 'excel' | 'pdf' | 'csv';

interface ReportOption {
    id: ReportType;
    name: string;
    description: string;
    icon: React.ReactNode;
}

const ReportsExport: React.FC = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedReport, setSelectedReport] = useState<ReportType>('parking');
    const [exportFormat, setExportFormat] = useState<ExportFormat>('excel');
    const [loading, setLoading] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewData, setPreviewData] = useState<any[] | null>(null);
    
    // Payroll specific state
    const [payrollViewType, setPayrollViewType] = useState<'summary' | 'detail'>('summary');
    const [selectedWasherId, setSelectedWasherId] = useState<number | null>(null);
    const [washers, setWashers] = useState<any[]>([]);

    useEffect(() => {
        if (selectedReport === 'payroll') {
            loadWashers();
        }
    }, [selectedReport]);

    useEffect(() => {
        const fetchPreview = async () => {
            if (!startDate || !endDate) {
                setPreviewData(null);
                return;
            }
            
            if (selectedReport === 'payroll' && payrollViewType === 'detail' && !selectedWasherId) {
                setPreviewData(null);
                return;
            }

            setPreviewLoading(true);
            try {
                const data = await reportService.getPreviewData(
                    selectedReport,
                    startDate,
                    endDate,
                    selectedReport === 'payroll' ? { viewType: payrollViewType, washerId: selectedWasherId || undefined } : undefined
                );
                setPreviewData(data);
            } catch (error) {
                console.error('Error fetching preview:', error);
            } finally {
                setPreviewLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchPreview, 500);
        return () => clearTimeout(timeoutId);
    }, [startDate, endDate, selectedReport, payrollViewType, selectedWasherId]);

    const loadWashers = async () => {
        try {
            const data = await washerService.getAllWashers();
            setWashers(data);
        } catch (error) {
            console.error('Error loading washers:', error);
        }
    };

    const reportOptions: ReportOption[] = [
        {
            id: 'parking',
            name: 'Registro de Parqueadero',
            description: 'Historial de vehículos en parqueadero (Disponible)',
            icon: <FileText className="w-6 h-6 text-yellow-600" />
        },
        {
            id: 'income_expenses',
            name: 'Ingresos y Gastos',
            description: 'Detalle de ingresos y gastos del período',
            icon: <FileText className="w-6 h-6 text-green-600" />
        },
        {
            id: 'washing',
            name: 'Servicios de Lavado',
            description: 'Registro de todos los servicios de lavado realizados',
            icon: <FileText className="w-6 h-6 text-blue-600" />
        },
        {
            id: 'payroll',
            name: 'Nómina de Lavadores',
            description: 'Comisiones, vales y pagos a lavadores',
            icon: <FileText className="w-6 h-6 text-red-600" />
        }
    ];

    const handleExport = async () => {
        if (!startDate || !endDate) {
            alert('Por favor selecciona un rango de fechas válido');
            return;
        }

        setLoading(true);
        try {
            if (selectedReport === 'parking') {
                await reportService.exportParkingHistory(startDate, endDate, exportFormat);
            } else if (selectedReport === 'income_expenses') {
                await reportService.exportRevenue(startDate, endDate, exportFormat);
            } else if (selectedReport === 'washing') {
                await reportService.exportWashingHistory(startDate, endDate, exportFormat);
            } else if (selectedReport === 'payroll') {
                if (payrollViewType === 'summary') {
                    await reportService.exportPayrollSummary(startDate, endDate, exportFormat);
                } else {
                    if (!selectedWasherId) {
                        alert('Por favor selecciona un lavador');
                        return;
                    }
                    await reportService.exportPayrollDetail(selectedWasherId, startDate, endDate, exportFormat);
                }
            } else {
                // Placeholder for other reports not yet implemented in backend
                alert('Este reporte estará disponible próximamente. Por ahora prueba el "Registro de Parqueadero", "Ingresos y Gastos" o "Servicios de Lavado".');
            }
        } catch (error) {
            console.error('Error exporting report:', error);
            alert('Error al generar el reporte. Por favor intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Exportar Reportes
                </h1>
                <p className="text-gray-600">
                    Genera y descarga reportes detallados del sistema
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel - Configuration */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Date Range Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-gray-600" />
                            <h2 className="text-xl font-bold text-gray-900">Rango de Fechas</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha Inicio
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha Fin
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Quick Date Presets */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                onClick={() => {
                                    const today = new Date().toISOString().split('T')[0];
                                    setStartDate(today);
                                    setEndDate(today);
                                }}
                                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                            >
                                Hoy
                            </button>
                            <button
                                onClick={() => {
                                    const today = new Date();
                                    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                                    setStartDate(lastWeek.toISOString().split('T')[0]);
                                    setEndDate(today.toISOString().split('T')[0]);
                                }}
                                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                            >
                                Última Semana
                            </button>
                            <button
                                onClick={() => {
                                    const today = new Date();
                                    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                                    setStartDate(lastMonth.toISOString().split('T')[0]);
                                    setEndDate(today.toISOString().split('T')[0]);
                                }}
                                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                            >
                                Último Mes
                            </button>
                        </div>
                    </div>

                    {/* Report Type Selection */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Tipo de Reporte</h2>
                        <div className="space-y-3">
                            {reportOptions.map((report) => (
                                <div
                                    key={report.id}
                                    onClick={() => setSelectedReport(report.id)}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedReport === report.id
                                        ? 'border-yellow-400 bg-yellow-50'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${selectedReport === report.id ? 'bg-white' : 'bg-gray-50'
                                            }`}>
                                            {report.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {report.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {report.description}
                                            </p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedReport === report.id
                                            ? 'border-yellow-500 bg-yellow-500'
                                            : 'border-gray-300'
                                            }`}>
                                            {selectedReport === report.id && (
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payroll Specific Options */}
                    {selectedReport === 'payroll' && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-5 h-5 text-gray-600" />
                                <h2 className="text-xl font-bold text-gray-900">Opciones de Nómina</h2>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de Reporte
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="payrollViewType"
                                                value="summary"
                                                checked={payrollViewType === 'summary'}
                                                onChange={() => setPayrollViewType('summary')}
                                                className="text-yellow-600 focus:ring-yellow-500"
                                            />
                                            <span>Resumen General (Todos)</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="payrollViewType"
                                                value="detail"
                                                checked={payrollViewType === 'detail'}
                                                onChange={() => setPayrollViewType('detail')}
                                                className="text-yellow-600 focus:ring-yellow-500"
                                            />
                                            <span>Detallado por Lavador</span>
                                        </label>
                                    </div>
                                </div>

                                {payrollViewType === 'detail' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Seleccionar Lavador
                                        </label>
                                        <select
                                            value={selectedWasherId || ''}
                                            onChange={(e) => setSelectedWasherId(Number(e.target.value))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        >
                                            <option value="">Seleccione un lavador...</option>
                                            {washers.map((washer) => (
                                                <option key={washer.id} value={washer.id}>
                                                    {washer.full_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel - Export Options */}
                <div className="space-y-6">
                    {/* Format Selection */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Formato de Exportación</h2>
                        <div className="space-y-3">
                            <div
                                onClick={() => setExportFormat('excel')}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${exportFormat === 'excel'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <FileSpreadsheet className={`w-6 h-6 ${exportFormat === 'excel' ? 'text-green-600' : 'text-gray-600'
                                        }`} />
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900">Excel</div>
                                        <div className="text-xs text-gray-600">.xlsx</div>
                                    </div>
                                </div>
                            </div>
                            <div
                                onClick={() => setExportFormat('pdf')}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${exportFormat === 'pdf'
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <File className={`w-6 h-6 ${exportFormat === 'pdf' ? 'text-red-600' : 'text-gray-600'
                                        }`} />
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900">PDF</div>
                                        <div className="text-xs text-gray-600">.pdf</div>
                                    </div>
                                </div>
                            </div>
                            <div
                                onClick={() => setExportFormat('csv')}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${exportFormat === 'csv'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <FileType className={`w-6 h-6 ${exportFormat === 'csv' ? 'text-blue-600' : 'text-gray-600'
                                        }`} />
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900">CSV</div>
                                        <div className="text-xs text-gray-600">.csv</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Export Summary */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tipo de Reporte:</span>
                                <span className="font-semibold text-gray-900">
                                    {reportOptions.find(r => r.id === selectedReport)?.name}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Formato:</span>
                                <span className="font-semibold text-gray-900 uppercase">
                                    {exportFormat}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Desde:</span>
                                <span className="font-semibold text-gray-900">
                                    {startDate || 'No seleccionada'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Hasta:</span>
                                <span className="font-semibold text-gray-900">
                                    {endDate || 'No seleccionada'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleExport}
                            disabled={!startDate || !endDate || loading}
                            className={`w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${!startDate || !endDate || loading
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                                }`}
                        >
                            {loading ? (
                                <Loader className="w-5 h-5 animate-spin" />
                            ) : (
                                <Download className="w-5 h-5" />
                            )}
                            {loading ? 'Generando...' : 'Exportar Reporte'}
                        </button>
                    </div>

                    {/* Info Notice */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <p className="text-sm text-blue-800">
                            <strong>Nota:</strong> Los reportes son generados en tiempo real con los datos
                            más actualizados del sistema.
                        </p>
                    </div>
                </div>
            </div>

            {/* Preview Section */}
            {(previewData || previewLoading) && (
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Vista Previa del Reporte</h2>
                        {previewData && <span className="text-sm text-gray-500">{previewData.length} registros encontrados</span>}
                    </div>
                    
                    {previewLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader className="w-8 h-8 animate-spin text-yellow-500" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {previewData && previewData.length > 0 && Object.keys(previewData[0]).map((key) => (
                                            <th
                                                key={key}
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                            >
                                                {key.replace(/_/g, ' ')}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {previewData && previewData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            {Object.values(row).map((value: any, i) => (
                                                <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {previewData && previewData.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No se encontraron datos para el rango seleccionado.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReportsExport;