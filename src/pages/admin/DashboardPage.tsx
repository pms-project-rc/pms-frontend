import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, CreditCard, Car, Receipt, Download, BarChart3, LayoutDashboard } from 'lucide-react';
// 1. Interfaz para KpiCard Props
interface KpiCardProps {
    title: string;
    value: string;
    icon: string;
    trend: string;
    color: string;
    accent: string;
}

// Tarjeta KPI estilizada (siguiendo el esquema de color oscuro/amarillo)
const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, trend, color, accent }) => (
    <div className="bg-white p-5 rounded-xl shadow-lg border-b-4" style={{ borderColor: accent }}>
        <div className="flex justify-between items-center">
            <div className="text-xl font-medium text-gray-500">{title}</div>
            <div className={`p-2 rounded-full ${color}`}>
                {/* Nota: Asumo que 'fa-solid' y los iconos son provistos por Font Awesome, que debe estar cargado globalmente. */}
                <i className={`text-xl ${icon} text-white`}></i>
            </div>
        </div>
        <div className="text-2xl font-extrabold text-gray-800 mt-2">{value}</div>
        <div className="mt-3 text-sm flex items-center">
            <span className={`font-semibold mr-2 ${trend.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
                {trend}
            </span>
            <span className="text-gray-500">vs mes pasado</span>
        </div>
    </div>
);

// 2. Interfaz para ChartPlaceholder Props
interface ChartPlaceholderProps {
    title: string;
    description: string;
}

// Componente para simular un gráfico (Placeholder)
const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({ title, description }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg h-96">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        <div className="h-full w-full bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-center p-4">
            [Gráfico de {title}] - Usaría Recharts aquí.
        </div>
    </div>
);

// 3. Interfaz para DateFilter Props
interface DateFilterProps {
    activeFilter: string;
    setActiveFilter: React.Dispatch<React.SetStateAction<string>>;
}

// Filtro de Fechas (Desktop y Mobile responsive)
const DateFilter: React.FC<DateFilterProps> = ({ activeFilter, setActiveFilter }) => {
    const filters: string[] = ['Hoy', 'Esta Semana', 'Este Mes', 'Rango Personalizado'];

    return (
        <div className="flex flex-wrap gap-2 mb-6 p-2 bg-white rounded-xl shadow-sm">
            <label className="text-gray-600 font-medium mr-2 self-center hidden sm:block">Filtrar por:</label>
            {filters.map((filter) => (
                <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                        activeFilter === filter
                            ? 'bg-yellow-500 text-gray-900 shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    {filter}
                </button>
            ))}
        </div>
    );
};


const DashboardPage: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState<string>('Este Mes');

    const navigate = useNavigate(); 

    const handleExportClick = () => {
        navigate('/admin/export/report');
    };
    // Data tipada usando la interfaz KpiCardProps[]
    const kpiData: KpiCardProps[] = [
        {
            title: "Ingresos Totales",
            value: "$18,450,000",
            icon: "fa-solid fa-dollar-sign",
            trend: "+12.5%",
            color: "bg-green-500",
            accent: "#48bb78"
        },
        {
            title: "Gastos Totales",
            value: "$4,120,000",
            icon: "fa-solid fa-credit-card",
            trend: "+3.1%",
            color: "bg-red-500",
            accent: "#f56565"
        },
        {
            title: "Vehículos Atendidos",
            value: "1,540",
            icon: "fa-solid fa-car",
            trend: "+21.8%",
            color: "bg-blue-500",
            accent: "#4299e1"
        },
        {
            title: "Ticket Promedio",
            value: "$12,000",
            icon: "fa-solid fa-receipt",
            trend: "-0.5%",
            color: "bg-yellow-500",
            accent: "#f6e05e"
        },
    ];

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Encabezado */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900 border-b-4 border-yellow-500 pb-1 inline-block">
                    Dashboard Gerencial
                </h1>
                 <button 
                    onClick={handleExportClick} // <-- FUNCIÓN DE NAVEGACIÓN
                    className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-purple-700 transition duration-200 text-sm flex items-center"
                >
                    <Download className="w-4 h-4 mr-2" /> Exportar Reporte
                </button>
            </div>

            {/* 1. Filtro Global de Fechas */}
            <DateFilter activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

            {/* 2. Tarjetas KPI (Top Row) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {kpiData.map((kpi, index) => (
                    <KpiCard key={index} {...kpi} />
                ))}
            </div>

            {/* 3. Gráficas Principales */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfico 1: Ingresos vs Gastos (Barras/Líneas) - 2/3 de ancho en desktop */}
                <div className="lg:col-span-2">
                    <ChartPlaceholder 
                        title="Ingresos vs Gastos"
                        description={`Rendimiento financiero comparado para el periodo: ${activeFilter}`}
                    />
                </div>

                {/* Gráfico 2: Distribución Tipos de Lavado (Pie Chart) - 1/3 de ancho en desktop */}
                <ChartPlaceholder 
                    title="Distribución de Servicios"
                    description="Clasificación por Tipo de Lavado y Servicios Adicionales."
                />
            </div>

            {/* Fila de Gráficos Secundarios (Full Width) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Gráfico 3: Ocupación Promedio por Hora */}
                <ChartPlaceholder 
                    title="Ocupación Promedio por Hora"
                    description="Identifica las horas pico de entrada y salida de vehículos."
                />

                {/* Gráfico 4: Top Lavadores (Ranking) */}
                <ChartPlaceholder 
                    title="Top 5 Lavadores (Ranking)"
                    description="Lavadores con mayor número de servicios completados y comisiones generadas."
                />
            </div>

            {/* Área para el Reporte Exportable */}
            <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border-l-4 border-yellow-500">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Resumen Operativo</h2>
                <p className="text-gray-600">Este dashboard proporciona la visión consolidada para la toma de decisiones estratégicas, basándose en la data filtrada actualmente ({activeFilter}).</p>
            </div>
        </div>
    );
}

export default DashboardPage;