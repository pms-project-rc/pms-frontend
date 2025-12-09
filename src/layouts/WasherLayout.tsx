import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, LayoutDashboard, History, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useShift } from '@/contexts/ShiftContext'

const UserMenu = React.lazy(() => import('@/components/UserMenu'))

interface MenuItem {
  name: string
  path: string
  icon: any
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', path: '/washer/dashboard', icon: LayoutDashboard },
  { name: 'Historial', path: '/washer/history', icon: History },
]

function WasherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const { shiftStatus } = useShift()

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className={`min-h-screen flex flex-col h-screen transition-colors duration-500 ${
      shiftStatus === 'activo'
        ? 'bg-gradient-to-br from-[#F5F5F5] via-white to-[#EAFBE7]'
        : 'bg-[#1A2A2D]'
    }`}>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className={`w-full transition-all duration-500 shadow-[0_10px_30px_rgba(77,166,116,0.2)] ${
          shiftStatus === 'activo'
            ? 'bg-gradient-to-r from-[#023336] via-[#04454F] to-[#4DA674]'
            : 'bg-gradient-to-r from-[#0F1A1D] via-[#1A2A2D] to-[#2A3A3D]'
        }`}>
          <div className="px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white hover:bg-white/10 p-3 rounded-xl transition-all duration-300 hover:scale-110"
              >
                {sidebarOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
              <div className="text-3xl font-black text-white tracking-wider">PMS</div>
            </div>
            <div>
              <React.Suspense fallback={<div className="w-24 h-8 bg-white/20 rounded-lg animate-pulse" />}>
                <UserMenu />
              </React.Suspense>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className={`${
            sidebarOpen ? 'w-72' : 'w-0'
          } transition-all duration-300 overflow-hidden shadow-[10px_0_30px_rgba(0,0,0,0.08)] ${
            shiftStatus === 'activo'
              ? 'bg-white'
              : 'bg-[#1A2A2D]'
          }`}>
            <div className="p-8 space-y-6 h-full flex flex-col">
              <div>
                <h2 className={`text-2xl font-black mb-2 transition-colors duration-500 ${
                  shiftStatus === 'activo' ? 'text-[#023336]' : 'text-gray-200'
                }`}>Menú</h2>
                <div className={`h-1 w-12 rounded-full transition-colors duration-500 ${
                  shiftStatus === 'activo'
                    ? 'bg-gradient-to-r from-[#4DA674] to-[#3D8A5C]'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700'
                }`} />
              </div>
              
              {/* Navigation */}
              <nav className="space-y-2 flex-1">
                {menuItems.map(item => {
                  const Icon = item.icon
                  const active = isActive(item.path)
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold ${
                        active
                          ? shiftStatus === 'activo'
                            ? 'bg-gradient-to-r from-[#4DA674] to-[#3D8A5C] text-white shadow-lg shadow-[#4DA674]/30 scale-105'
                            : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg shadow-gray-600/30 scale-105'
                          : shiftStatus === 'activo'
                            ? 'text-[#023336] hover:bg-[#EAFBE7] hover:text-[#4DA674]'
                            : 'text-gray-400 hover:bg-[#2A3A3D] hover:text-gray-200'
                      }`}
                    >
                      <Icon size={24} />
                      <span className="text-lg">{item.name}</span>
                    </button>
                  )
                })}
              </nav>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-lg ${
                  shiftStatus === 'activo'
                    ? 'text-red-600 hover:bg-red-50 border-t border-gray-200'
                    : 'text-red-500 hover:bg-[#2A3A3D] border-t border-gray-700'
                }`}
              >
                <LogOut size={24} />
                <span>Salir</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-8">
            <div className="w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default WasherLayout
