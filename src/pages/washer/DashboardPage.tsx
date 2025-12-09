import { useEffect, useMemo, useState, ReactNode } from 'react'
import { Clock, Activity, Plus, Bell } from 'lucide-react'
import { authService } from '@/services/authService'
import { washerDashboardService } from '@/services/washerDashboardService'
import { useShift } from '@/contexts/ShiftContext'

type ServiceStatus = 'pending' | 'in_progress' | 'completed'
type FilterStatus = 'all' | ServiceStatus
type ShiftStatus = 'activo' | 'inactivo'

interface ServiceItem {
  id: string
  vehicle: string
  plate: string
  type: string
  status: ServiceStatus
  payout: number
  scheduledAt: string
}

const statusCopy: Record<ServiceStatus, { label: string; badge: string; dot: string }> = {
  pending: { label: 'Pendiente', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  in_progress: { label: 'En progreso', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  completed: { label: 'Completado', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
}

// Componente Neumórfico Base
const NeuCard = ({ children, className = "", onClick, active = false, dark = false }: { children: ReactNode; className?: string; onClick?: () => void; active?: boolean; dark?: boolean }) => {
  const baseStyle = `
    relative transition-all duration-500 ease-in-out rounded-[32px]
    flex flex-col items-center justify-center
    ${dark
      ? active 
        ? 'shadow-[inset_8px_8px_16px_rgba(0,0,0,0.5),inset_-8px_-8px_16px_rgba(100,100,100,0.3)]' 
        : 'shadow-[12px_12px_28px_rgba(0,0,0,0.4),-12px_-12px_28px_rgba(50,50,50,0.3)] hover:shadow-[15px_15px_35px_rgba(0,0,0,0.5),-15px_-15px_35px_rgba(80,80,80,0.3)]'
      : active 
        ? 'shadow-[inset_8px_8px_16px_rgba(2,51,54,0.15),inset_-8px_-8px_16px_rgba(193,230,186,0.5)]' 
        : 'shadow-[12px_12px_28px_rgba(2,51,54,0.12),-12px_-12px_28px_rgba(255,255,255,0.95)] hover:shadow-[15px_15px_35px_rgba(2,51,54,0.15),-15px_-15px_35px_rgba(255,255,255,0.98)]'
    }
    ${dark
      ? 'bg-gradient-to-br from-[#1A2A2D] via-[#0F1D20] to-[#0A1416]'
      : 'bg-gradient-to-br from-white via-[#F8FFFE] to-[#EAFBE7]'
    }
  `;
  
  return (
    <div onClick={onClick} className={`${baseStyle} ${className} ${onClick ? 'cursor-pointer' : ''}`}>
      {children}
    </div>
  );
};

// Botón Neumórfico
const NeuButton = ({ children, className = "", active = false, onClick, dark = false }: { children: ReactNode; className?: string; active?: boolean; onClick?: () => void; dark?: boolean }) => {
  const baseStyle = `
    w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500
    ${dark
      ? `text-gray-400
        ${active 
          ? 'shadow-[inset_6px_6px_12px_rgba(0,0,0,0.4),inset_-6px_-6px_12px_rgba(100,100,100,0.2)]' 
          : 'shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(80,80,80,0.2)] active:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.4),inset_-6px_-6px_12px_rgba(100,100,100,0.2)]'
        }
        bg-gradient-to-br from-[#1A2A2D] to-[#0A1416]`
      : `text-[#4DA674]
        ${active 
          ? 'shadow-[inset_6px_6px_12px_rgba(2,51,54,0.15),inset_-6px_-6px_12px_rgba(193,230,186,0.4)]' 
          : 'shadow-[8px_8px_16px_rgba(2,51,54,0.08),-8px_-8px_16px_rgba(255,255,255,0.95)] active:shadow-[inset_6px_6px_12px_rgba(2,51,54,0.15),inset_-6px_-6px_12px_rgba(193,230,186,0.4)]'
        }
        bg-gradient-to-br from-white to-[#EAFBE7]`
    }
  `;

  return (
    <button onClick={onClick} className={`${baseStyle} ${className}`}>
      {children}
    </button>
  );
};

// Toggle Neumórfico
const ShiftToggle = ({ isActive, onChange, dark = false }: { isActive: ShiftStatus; onChange: (status: ShiftStatus) => void; dark?: boolean }) => (
  <NeuCard className="p-6 w-full" dark={dark}>
    <div className="flex items-center justify-between w-full gap-4">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          dark
            ? 'text-gray-500 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(100,100,100,0.1)]'
            : 'text-[#4DA674] shadow-[inset_4px_4px_8px_rgba(2,51,54,0.08),inset_-4px_-4px_8px_rgba(193,230,186,0.3)]'
        }`}>
          <Activity size={22} />
        </div>
        <div className="flex flex-col">
          <span className={`font-black text-sm ${dark ? 'text-gray-300' : 'text-[#023336]'}`}>Tu Turno</span>
          <span className={`text-xs font-bold ${
            isActive === 'activo' 
              ? dark ? 'text-[#4DA674]' : 'text-[#4DA674]'
              : dark ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {isActive === 'activo' ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      <button
        onClick={() => onChange(isActive === 'activo' ? 'inactivo' : 'activo')}
        className={`
          w-16 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 relative flex-shrink-0
          ${dark
            ? `shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(100,100,100,0.1)]
              ${isActive === 'activo' ? 'bg-[#4DA674]' : 'bg-gray-700'}`
            : `shadow-[inset_4px_4px_8px_rgba(2,51,54,0.1),inset_-4px_-4px_8px_rgba(193,230,186,0.3)]
              ${isActive === 'activo' ? 'bg-[#C1E6BA]' : 'bg-gray-200'}`
          }
        `}
      >
        <div
          className={`
            w-6 h-6 rounded-full ${dark ? 'shadow-[4px_4px_10px_rgba(0,0,0,0.4),-2px_-2px_6px_rgba(150,150,150,0.3)]' : 'shadow-[4px_4px_10px_rgba(2,51,54,0.2),-2px_-2px_6px_rgba(255,255,255,0.8)]'}
            bg-white transform transition-transform duration-300 flex items-center justify-center
            ${isActive === 'activo' ? 'translate-x-8' : 'translate-x-0'}
          `}
        >
          <div className={`w-2 h-2 rounded-full ${isActive === 'activo' ? 'bg-[#4DA674]' : 'bg-gray-300'}`} />
        </div>
      </button>
    </div>
  </NeuCard>
)

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

// Tarjeta de Servicio
const ServiceCard = ({ item, dark = false }: { item: ServiceItem; dark?: boolean }) => {
  const meta = statusCopy[item.status]
  return (
    <NeuCard className="p-5 w-full" dark={dark}>
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
            <p className={`text-xs font-semibold ${dark ? 'text-gray-500' : 'text-[#4DA674]'}`}>{item.vehicle} • {item.scheduledAt}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`px-2 py-1 rounded-full text-xs font-black ${meta.badge} flex items-center gap-1.5`}>
            <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
            {meta.label.split(' ')[0]}
          </span>
        </div>
      </div>
    </NeuCard>
  )
}

export default function WasherDashboard() {
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [localShiftStatus, setLocalShiftStatus] = useState<ShiftStatus>('activo')
  const [services, setServices] = useState<ServiceItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [washerCommission, setWasherCommission] = useState<number>(0)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const { setShiftStatus: setGlobalShiftStatus } = useShift()

  // Sincronizar estado local con global - sin llamadas a API
  const handleShiftChange = (newStatus: ShiftStatus) => {
    setLocalShiftStatus(newStatus)
    setGlobalShiftStatus(newStatus)
  }

  const metrics = useMemo(() => {
    const active = services.filter(s => s.status !== 'completed').length
    // Calcular ganancias como comisión del lavador
    const earningsToday = services.reduce((acc, s) => {
      if (s.status === 'completed') {
        const commission = s.payout * (washerCommission / 100)
        return acc + commission
      }
      return acc
    }, 0)
    return { active, earningsToday }
  }, [services, washerCommission])

  const filteredServices = useMemo(() => {
    if (filterStatus === 'all') return services
    return services.filter(s => s.status === filterStatus)
  }, [services, filterStatus])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Obtener usuario actual
        const current = authService.getCurrentUser()
        setUserName(current?.full_name || current?.username || 'Lavador')
        setWasherCommission(current?.commission_percentage || 0)

        // Por defecto dejamos el turno activo para mostrar datos
        setLocalShiftStatus('activo')
        setGlobalShiftStatus('activo')

        // Obtener servicios del backend
        console.log('Cargando servicios del backend...')
        const washings = await washerDashboardService.getWasherServices()
        console.log('Servicios obtenidos:', washings)
        
        if (washings && washings.length > 0) {
          const mappedServices: ServiceItem[] = washings.map((w: any) => ({
            id: w.id.toString(),
            vehicle: w.vehicle_type || 'Vehículo',
            plate: w.plate || w.vehicle_plate || 'N/A',
            type: w.service_type,
            status: w.status,
            payout: w.price,
            scheduledAt: new Date(w.service_date || w.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
          }))
          console.log('Servicios mapeados:', mappedServices)
          setServices(mappedServices)
        } else {
          console.log('No hay servicios del backend')
          setServices([])
        }
      } catch (err: any) {
        console.error('Error cargando datos del dashboard:', err?.message)
        setError('No se pudieron cargar los servicios')
        setServices([])
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#EAFBE7]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#C1E6BA] border-t-[#4DA674] animate-spin mx-auto mb-4" />
          <p className="text-[#023336] font-black">Preparando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#EAFBE7]">
        <div className="text-center">
          <p className="text-red-600 font-black mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#4DA674] text-white rounded-lg font-bold"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen font-sans antialiased text-[#023336] p-4 sm:p-6 transition-colors duration-500 ${
      localShiftStatus === 'activo' 
        ? 'bg-[#EAFBE7]' 
        : 'bg-[#023336]'
    }`}>
      {/* Contenedor Principal Neumórfico */}
      <div className="w-full max-w-[480px] mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 mt-4">
          <div>
            <p className={`font-black text-xs tracking-widest mb-1 ${localShiftStatus === 'activo' ? 'text-[#4DA674]' : 'text-gray-500'}`}>BIENVENIDO</p>
            <h1 className={`font-black text-3xl ${localShiftStatus === 'activo' ? 'text-[#023336]' : 'text-white'}`}>{userName}</h1>
          </div>
          <NeuButton dark={localShiftStatus === 'inactivo'}>
            <Bell size={18} />
          </NeuButton>
        </div>

        {/* Sección Toggle Turno */}
        <div className="mb-6">
          <ShiftToggle isActive={localShiftStatus} onChange={handleShiftChange} dark={localShiftStatus === 'inactivo'} />
        </div>

        {/* Contenido: siempre visible */}
        <>
          {/* Sección Métricas */}
          <div className="mb-8">
            <div className={`flex justify-between items-center mb-5 px-2 ${localShiftStatus === 'activo' ? 'text-[#023336]' : 'text-gray-200'}`}>
              <h2 className={`font-black text-lg ${localShiftStatus === 'activo' ? 'text-[#023336]' : 'text-white'}`}>Métricas</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <MetricCard 
                label="Activos"
                value={metrics.active.toString()}
                Icon={<Activity size={20} />}
                dark={localShiftStatus === 'inactivo'}
              />
              <MetricCard 
                label="Ganancias"
                value={`$${(metrics.earningsToday / 1000).toFixed(0)}K`}
                Icon={<Clock size={20} />}
                dark={localShiftStatus === 'inactivo'}
              />
              <MetricCard 
                label="Comisión"
                value={`${washerCommission.toFixed(0)}%`}
                Icon={<Activity size={20} />}
                dark={localShiftStatus === 'inactivo'}
              />
            </div>
          </div>

          {/* Sección Servicios */}
          <div className="pb-32">
            <div className={`flex justify-between items-center mb-5 px-2 ${localShiftStatus === 'activo' ? 'text-[#023336]' : 'text-gray-200'}`}>
              <h3 className={`font-black text-lg ${localShiftStatus === 'activo' ? 'text-[#023336]' : 'text-white'}`}>Servicios</h3>
              <button className={`font-black ${localShiftStatus === 'activo' ? 'text-[#4DA674]' : 'text-gray-300'}`}><Plus size={20} /></button>
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
                      ? localShiftStatus === 'activo'
                        ? 'bg-[#C1E6BA] text-[#023336] border-[#C1E6BA]'
                        : 'bg-[#4DA674] text-white border-[#4DA674]'
                      : localShiftStatus === 'activo'
                        ? 'bg-white text-[#023336] border-[#E0F2E9]'
                        : 'bg-[#1A2A2D] text-gray-300 border-[#2A3A3D]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
              <div className="space-y-4">
                {filteredServices.length === 0 ? (
                  <div className="text-center py-8">
                    <p className={`${localShiftStatus === 'activo' ? 'text-gray-400' : 'text-gray-500'} font-semibold`}>No hay servicios asignados</p>
                  </div>
                ) : (
                  filteredServices.map(item => (
                    <ServiceCard key={item.id} item={item} dark={localShiftStatus === 'inactivo'} />
                  ))
                )}
              </div>
          </div>
        </>

      </div>

      {/* Estilos Globales */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
