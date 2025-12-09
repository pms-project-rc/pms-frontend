import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, X, Home, Car, Droplets, BarChart3, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { parkingService } from '@/services/parkingService'
import { washingService } from '@/services/washingService'

const UserMenu = React.lazy(() => import('@/components/UserMenu'))

interface NavItem {
  name: string
  path: string
  icon: React.ReactNode
  color: string
}

interface SystemStats {
  activeParking: number
  activeWashing: number
  occupancy: number
  maxCapacity: number
}

function OperationalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { logout, user } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [stats, setStats] = useState<SystemStats>({
    activeParking: 0,
    activeWashing: 0,
    occupancy: 0,
    maxCapacity: 30
  })

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/operational/dashboard', icon: <Home size={22} />, color: 'text-blue-600' },
    { name: 'Parqueadero', path: '/operational/parking', icon: <Car size={22} />, color: 'text-yellow-600' },
    { name: 'Servicios Lavado', path: '/operational/washing', icon: <Droplets size={22} />, color: 'text-cyan-600' },
    { name: 'Reportes', path: '/operational/reports', icon: <BarChart3 size={22} />, color: 'text-green-600' },
  ]

  // 📊 Cargar estadísticas del sistema
  useEffect(() => {
    loadStats()
    
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      loadStats()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      // Cargar vehículos activos en parqueo
      const parkingData = await parkingService.getActiveVehicles()
      
      // Cargar servicios de lavado activos
      const washingData = await washingService.getActiveServices()
      
      const maxCap = 30 // Podría venir de configuración
      const occupation = parkingData.length > 0 ? Math.round((parkingData.length / maxCap) * 100) : 0
      
      setStats({
        activeParking: parkingData.length,
        activeWashing: washingData.length,
        occupancy: occupation,
        maxCapacity: maxCap
      })
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }

  const handleLogout = () => {
    logout()
    setShowLogoutConfirm(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-gray-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-slate-900 to-slate-800 shadow-2xl z-50 border-b border-slate-700">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors text-gray-300 hover:text-white"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg">
                🚗
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Panel Operador</h1>
                <p className="text-gray-400 text-xs">PMS - Parking Management System</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-gray-300">
              <span className="text-sm font-medium">Bienvenido,</span>
              <span className="font-bold text-cyan-400">{user?.username}</span>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-red-900/40 text-red-400 hover:text-red-300 rounded-lg transition-colors font-medium"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">Salir</span>
              </button>
              
              {showLogoutConfirm && (
                <div className="absolute right-0 mt-2 bg-slate-800 rounded-lg shadow-xl border border-slate-600 p-4 w-48 z-50">
                  <p className="text-gray-200 text-sm font-medium mb-4">¿Cerrar sesión?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleLogout}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded font-bold transition-colors text-sm"
                    >
                      Sí, salir
                    </button>
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-gray-200 px-3 py-2 rounded font-bold transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-[80px]">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-72' : 'w-0'
          } bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl transition-all duration-300 fixed lg:relative h-[calc(100vh-80px)] overflow-y-auto z-40 lg:z-auto border-r border-slate-700 scrollbar-hide`}
        >
          <nav className="p-8 space-y-6 h-full overflow-y-auto scrollbar-hide">
            {/* Navigation Items */}
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mb-4">
                Operaciones Principales
              </h2>

              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <a
                      href={item.path}
                      className="flex items-center gap-4 px-4 py-3 rounded-lg text-gray-300 hover:bg-slate-800 hover:text-white transition-all group border-l-4 border-transparent hover:border-blue-500"
                    >
                      <span className="text-gray-400 group-hover:text-white group-hover:scale-110 transition-all">
                        {item.icon}
                      </span>
                      <span className="font-semibold text-sm">{item.name}</span>
                      <ChevronDown size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-gray-500" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="border-slate-700" />

            {/* System Status Card */}
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mb-3">
                Información
              </h2>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-700 shadow-lg">
                <p className="text-xs text-gray-300 font-medium mb-4">📊 Estado del Sistema</p>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Parqueos activos:</span>
                    <span className="font-bold text-amber-300 text-sm">{stats.activeParking}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">En lavado:</span>
                    <span className="font-bold text-cyan-300 text-sm">{stats.activeWashing}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Ocupación:</span>
                    <span className={`font-bold text-sm ${
                      stats.occupancy >= 80 ? 'text-red-300' : 
                      stats.occupancy >= 60 ? 'text-yellow-300' : 
                      'text-emerald-300'
                    }`}>
                      {stats.occupancy}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-700" />

            {/* Settings */}
            <ul className="space-y-2">
              <li>
                <a
                  href="#settings"
                  className="flex items-center gap-4 px-4 py-3 rounded-lg text-gray-300 hover:bg-slate-800 hover:text-white transition-all group"
                >
                  <Settings size={22} className="text-gray-500 group-hover:text-white transition-colors" />
                  <span className="font-semibold text-sm">Configuración</span>
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Overlay para mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 mt-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
          <div className="p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default OperationalLayout
