import React, { useState, useCallback } from 'react';
// Cambiamos 'LoaderCircle' por 'Loader', que es el nombre correcto en Lucide-React.
import { Download, Calendar, Table, CheckCircle, FileText, Loader } from 'lucide-react';

// --- Definiciones de Tipos ---
type ReportType = 'servicios' | 'transacciones' | 'ocupacion' | 'inventario';
type ExportFormat = 'excel' | 'pdf';

interface ReportOption {
    value: ReportType;
    label: string;
    icon: React.ElementType; // Tipo para componente de icono Lucide
    description: string;
}

// --- Datos Fijos ---
const reportOptions: ReportOption[] = [
    { value: 'servicios', label: 'Reporte Detallado de Servicios', icon: Table, description: 'Listado completo de lavados, tarifas y comisiones por lavador.' },
    { value: 'transacciones', label: 'Cierre Financiero y Transacciones', icon: CheckCircle, description: 'Resumen de ingresos, gastos y métodos de pago utilizados.' },
    { value: 'ocupacion', label: 'Análisis de Ocupación', icon: Calendar, description: 'Detalle de tiempos de permanencia y uso de puestos de lavado/parqueo.' },
    { value: 'inventario', label: 'Consumo de Inventario (Químicos)', icon: FileText, description: 'Reporte sobre el uso y stock actual de productos de limpieza.' },
];

// --- Componente Principal ---
function ReportsExport() {
    // Estado de los filtros y la acción
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedReport, setSelectedReport] = useState<ReportType>('servicios');
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('excel');
    const [isDownloading, setIsDownloading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // Manejador de la descarga del reporte
    const handleDownload = useCallback(() => {
        if (!startDate || !endDate) {
            setMessage('Por favor, selecciona un rango de fechas válido.');
            return;
        }

        setIsDownloading(true);
        setMessage(null);

        // Simulación de la API Call para exportar el reporte
        console.log(`Exportando reporte de ${selectedReport} en formato ${selectedFormat} desde ${startDate} hasta ${endDate}`);

        setTimeout(() => {
            setIsDownloading(false);
            const reportName = reportOptions.find(opt => opt.value === selectedReport)?.label || 'Reporte';
            const formatText = selectedFormat === 'excel' ? 'Excel (.xlsx)' : 'PDF';
            setMessage(` ¡Descarga simulada exitosa! Generado: ${reportName} (${formatText}).`);
        }, 2500);
    }, [startDate, endDate, selectedReport, selectedFormat]);

    const isDownloadDisabled = isDownloading || !startDate || !endDate;

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
            <header className="mb-8 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                    <Download className="inline h-6 w-6 text-purple-600 mr-2" />
                    Generación y Exportación de Reportes
                </h1>
                <p className="text-gray-600">
                    Selecciona los parámetros para generar reportes financieros, operativos y de personal.
                </p>
            </header>

            {/* Contenedor principal de filtros */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Columna 1: Rango de Fechas */}
                <div className="lg:col-span-1 border-r lg:pr-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
                        1. Rango de Fechas
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                            <input
                                type="date"
                                id="startDate"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
                            <input
                                type="date"
                                id="endDate"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate} // Asegura que la fecha final no sea anterior a la inicial
                                disabled={!startDate}
                                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm disabled:bg-gray-100"
                            />
                        </div>
                    </div>
                </div>

                {/* Columna 2: Tipo de Reporte */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <FileText className="h-5 w-5 text-teal-500 mr-2" />
                        2. Selecciona el Tipo de Reporte
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reportOptions.map(option => {
                            const IconComponent = option.icon;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => setSelectedReport(option.value)}
                                    className={`p-4 rounded-xl text-left border-2 transition-all duration-200 
                                        ${selectedReport === option.value 
                                            ? 'border-purple-600 bg-purple-50 shadow-md' 
                                            : 'border-gray-200 hover:border-purple-300 bg-white'
                                        }`
                                    }
                                >
                                    <div className="flex items-center mb-1">
                                        <IconComponent className={`h-5 w-5 mr-3 ${selectedReport === option.value ? 'text-purple-600' : 'text-gray-500'}`} />
                                        <span className={`font-semibold ${selectedReport === option.value ? 'text-purple-800' : 'text-gray-800'}`}>
                                            {option.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 ml-8">{option.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>
            
            {/* Fila de Formato y Botón de Descarga */}
            <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-center">
                
                {/* 3. Formato de Exportación */}
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <span className="text-lg font-bold text-gray-800 mr-2">3. Formato:</span>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="format"
                            value="excel"
                            checked={selectedFormat === 'excel'}
                            onChange={() => setSelectedFormat('excel')}
                            className="form-radio text-green-500 h-5 w-5"
                        />
                        <FileText className="h-6 w-6 text-green-600 ml-2" />
                        <span className="ml-2 text-gray-700">Excel (.xlsx)</span>
                    </label>
                    
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="format"
                            value="pdf"
                            checked={selectedFormat === 'pdf'}
                            onChange={() => setSelectedFormat('pdf')}
                            className="form-radio text-red-500 h-5 w-5"
                        />
                        <FileText className="h-6 w-6 text-red-600 ml-2" />
                        <span className="ml-2 text-gray-700">PDF</span>
                    </label>
                </div>
                
                {/* Botón de Descargar */}
                <button
                    onClick={handleDownload}
                    disabled={isDownloadDisabled}
                    className="bg-purple-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-purple-700 transition duration-300 shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center min-w-[200px] justify-center"
                >
                    {isDownloading ? (
                        // Usamos 'Loader' en lugar de 'LoaderCircle'
                        <Loader className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                        <Download className="h-5 w-5 mr-2" />
                    )}
                    {isDownloading ? 'Generando...' : 'Descargar Reporte'}
                </button>
            </div>
            
            {/* Mensaje de estado */}
            {message && (
                <div className={`mt-6 p-4 rounded-lg bg-indigo-100 text-indigo-700 border-l-4 border-indigo-500`}>
                    {message}
                </div>
            )}

        </div>
    );
}

export default ReportsExport;