import { useEffect, useState, useMemo, ReactNode } from 'react'
import { Clock, Activity, TrendingUp, Calendar } from 'lucide-react'
import { washerDashboardService } from '@/services/washerDashboardService'
import { authService } from '@/services/authService'
import { useShift } from '@/contexts/ShiftContext'

type ServiceStatus = 'pending' | 'in_progress' | 'completed'
type FilterStatus = 'all' | ServiceStatus

interface ServiceItem {
  id: string
  vehicle: string
  plate: string
  type: string
  status: ServiceStatus
  payout: number
  scheduledAt: string
  completedAt?: string
}

// Componente Neumórfico Base
const NeuCard = ({ children, className = "", dark = false }: { children: ReactNode; className?: string; dark?: boolean }) => {
  const baseStyle = `
    relative transition-all duration-500 ease-in-out rounded-[32px]
    flex flex-col
    ${dark
      ? 'shadow-[12px_12px_28px_rgba(0,0,0,0.4),-12px_-12px_28px_rgba(50,50,50,0.3)] bg-gradient-to-br from-[#1A2A2D] via-[#0F1D20] to-[#0A1416]'
      : 'shadow-[12px_12px_28px_rgba(2,51,54,0.12),-12px_-12px_28px_rgba(255,255,255,0.95)] bg-gradient-to-br from-white via-[#F8FFFE] to-[#EAFBE7]'
    }
  `
  
  return (
    <div className={`${baseStyle} ${className}`}>
      {children}
    </div>
  )
}

// Tarjeta de Métrica
const MetricCard = ({ label, value, Icon, dark = false }: { label: string; value: string; Icon: ReactNode; dark?: boolean }) => (
  <NeuCard className="p-8 w-full" dark={dark}>
    <div className={`flex items-center justify-between w-full gap-4 mb-4 ${dark ? 'text-gray-400' : 'text-[#023336]'}`}>
      <p className={`text-xs font-black tracking-widest uppercase ${dark ? 'text-gray-500' : 'text-[#023336]'}`}>{label}</p>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
        dark
          ? 'bg-gradient-to-br from-[#2A3A3D] to-[#1A2A2D] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(100,100,100,0.1)] text-gray-500'
          : 'bg-gradient-to-br from-[#C1E6BA] to-[#EAFBE7] shadow-[inset_4px_4px_8px_rgba(2,51,54,0.08),inset_-4px_-4px_8px_rgba(193,230,186,0.3)] text-[#4DA674]'
      }`}>
        {Icon}
      </div>
    </div>
    <p className={`text-4xl font-black ${dark ? 'text-gray-200' : 'text-[#023336]'}`}>{value}</p>
  </NeuCard>
)

// Tarjeta de Servicio en Historial
const HistoryServiceCard = ({ item, dark = false }: { item: ServiceItem; dark?: boolean }) => (
  <NeuCard className="p-5 w-full mb-4" dark={dark}>
    <div className="w-full flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <div className={`w-14 h-14 rounded-[24px] flex items-center justify-center font-black text-xs ${
          dark
            ? 'bg-gradient-to-br from-[#2A3A3D] to-[#1A2A2D] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(100,100,100,0.1)] text-gray-400'
            : 'bg-gradient-to-br from-[#C1E6BA] to-[#EAFBE7] shadow-[inset_4px_4px_8px_rgba(2,51,54,0.08),inset_-4px_-4px_8px_rgba(255,255,255,0.6)] text-[#023336]'
        }`}>
          {item.plate.substring(0, 3)}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-black text-sm truncate ${dark ? 'text-gray-200' : 'text-[#023336]'}`}>{item.type}</p>
          <p className={`text-xs font-semibold ${dark ? 'text-gray-500' : 'text-[#4DA674]'}`}>
            {item.vehicle} • {item.scheduledAt}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`px-3 py-1 rounded-full text-sm font-black ${
          dark ? 'bg-[#2A3A3D] text-emerald-400' : 'bg-emerald-100 text-emerald-700'
        }`}>
          ${(item.payout / 1000).toFixed(0)}K
        </span>
      </div>
    </div>
  </NeuCard>
)

export default function WasherHistory() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [washerCommission, setWasherCommission] = useState<number>(0)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const { shiftStatus } = useShift()
  const dark = shiftStatus === 'inactivo'

  const metrics = useMemo(() => {
    const completedServices = services.filter(s => s.status === 'completed')
    const totalCompleted = completedServices.length
    // Calcular ganancias como comisión del lavador
    const totalEarnings = completedServices.reduce((acc, s) => {
      const commission = s.payout * (washerCommission / 100)
      return acc + commission
    }, 0)
    const avgEarnings = totalCompleted > 0 ? totalEarnings / totalCompleted : 0
    return { totalCompleted, totalEarnings, avgEarnings }
  }, [services, washerCommission])

  const filteredServices = useMemo(() => {
    if (filterStatus === 'all') return services
    return services.filter(s => s.status === filterStatus)
  }, [services, filterStatus])

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true)
        
        // Obtener información del lavador
        const current = authService.getCurrentUser()
        setWasherCommission(current?.commission_percentage || 0)
        
        // Obtener todos los servicios del lavador
        const washings = await washerDashboardService.getWasherServices()
        
        console.log('Servicios obtenidos:', washings)
        
        // Mostrar todos los servicios (no solo completados)
        // Ya que el backend puede no tener end_time en todos
        const mappedServices: ServiceItem[] = washings.map((w: any) => {
          // Preferir el status que viene del backend; si no, calcular por tiempos
          let status: ServiceStatus = w.status || 'pending'
          if (!w.status) {
            if (w.end_time) {
              status = 'completed'
            } else if (w.start_time) {
              status = 'in_progress'
            }
          }
          
          return {
            id: w.id.toString(),
            vehicle: w.vehicle_type || 'Vehículo',
            plate: w.plate || w.vehicle_plate || 'N/A',
            type: w.service_type,
            status: status,
            payout: w.price,
            scheduledAt: new Date(w.service_date || w.created_at).toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: 'short' 
            }),
            completedAt: w.end_time
          }
        })
        
        console.log('Servicios mapeados:', mappedServices)
        
        setServices(mappedServices)
        setLoading(false)
      } catch (err) {
        console.error('Error cargando historial:', err)
        setServices([])
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen transition-colors duration-500 ${
        dark ? 'bg-[#023336]' : 'bg-[#EAFBE7]'
      }`}>
        <div className="text-center">
          <div className={`w-12 h-12 rounded-full border-4 animate-spin mx-auto mb-4 ${
            dark 
              ? 'border-gray-700 border-t-[#4DA674]'
              : 'border-[#C1E6BA] border-t-[#4DA674]'
          }`} />
          <p className={`font-black ${dark ? 'text-white' : 'text-[#023336]'}`}>Cargando historial...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen font-sans antialiased p-4 sm:p-6 transition-colors duration-500 ${
      dark ? 'bg-[#023336]' : 'bg-[#EAFBE7]'
    }`}>
      <div className="w-full max-w-[480px] mx-auto">
        
        {/* Header */}
        <div className="mb-8 mt-4">
          <p className={`font-black text-xs tracking-widest mb-1 ${dark ? 'text-gray-500' : 'text-[#4DA674]'}`}>
            HISTORIAL
          </p>
          <h1 className={`font-black text-3xl ${dark ? 'text-white' : 'text-[#023336]'}`}>
            Mis Servicios
          </h1>
        </div>

        {/* Contenido siempre visible, estilo cambia por turno */}
        <>
          {/* Métricas */}
          <div className="mb-8 space-y-4">
            <MetricCard 
              label="Total Completados"
              value={metrics.totalCompleted.toString()}
              Icon={<Activity size={20} />}
              dark={dark}
            />

            <div className="grid grid-cols-2 gap-6">
              <MetricCard 
                label="Total"
                value={`$${(metrics.totalEarnings / 1000).toFixed(0)}K`}
                Icon={<TrendingUp size={20} />}
                dark={dark}
              />
              <MetricCard 
                label="Promedio"
                value={`$${(metrics.avgEarnings / 1000).toFixed(0)}K`}
                Icon={<Clock size={20} />}
                dark={dark}
              />
              <MetricCard 
                label="Comisión"
                value={`${washerCommission.toFixed(0)}%`}
                Icon={<Activity size={20} />}
                dark={dark}
              />
            </div>
          </div>

          {/* Lista de Servicios */}
          <div className="pb-32">
            <div className={`flex justify-between items-center mb-5 px-2 ${dark ? 'text-gray-200' : 'text-[#023336]'}`}>
              <h3 className={`font-black text-lg ${dark ? 'text-white' : 'text-[#023336]'}`}>
                Últimos Servicios
              </h3>
            </div>

            {/* Filtros por estado */}
            <div className="flex gap-2 mb-4 px-2 flex-wrap">
              {[
                { key: 'all', label: 'Todos' },
                { key: 'in_progress', label: 'En ejecución' },
                { key: 'completed', label: 'Terminados' },
                { key: 'pending', label: 'Pendientes' }
              ].map(option => (
                <button
                  key={option.key}
                  onClick={() => setFilterStatus(option.key as FilterStatus)}
                  className={`px-3 py-1.5 rounded-full text-xs font-black transition-all duration-200 border ${
                    filterStatus === option.key
                      ? dark
                        ? 'bg-[#4DA674] text-white border-[#4DA674]'
                        : 'bg-[#C1E6BA] text-[#023336] border-[#C1E6BA]'
                      : dark
                        ? 'bg-[#1A2A2D] text-gray-300 border-[#2A3A3D]'
                        : 'bg-white text-[#023336] border-[#E0F2E9]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            {filteredServices.length === 0 ? (
              <NeuCard className="p-12 text-center" dark={dark}>
                <Calendar className={`w-16 h-16 mx-auto mb-4 ${dark ? 'text-gray-500' : 'text-gray-300'}`} />
                <p className={`font-black ${dark ? 'text-gray-200' : 'text-gray-600'}`}>
                  No hay servicios asignados
                </p>
              </NeuCard>
            ) : (
              <div>
                {filteredServices.map(item => (
                  <HistoryServiceCard key={item.id} item={item} dark={dark} />
                ))}
              </div>
            )}
          </div>
        </>

      </div>
    </div>
  )
}
