import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, LayoutDashboard, History, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const UserMenu = React.lazy(() => import('@/components/UserMenu'))

interface MenuItem {
  name: string
  path: string
  icon: React.ComponentType<{ className?: string; size?: number }>
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

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-md">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-900 hover:bg-yellow-600 p-2 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="text-2xl font-bold text-gray-900">PMS - Lavador</div>
            </div>
            <div>
              <React.Suspense fallback={<div className="w-24 h-6 bg-gray-200 rounded" />}>
                <UserMenu />
              </React.Suspense>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } bg-white shadow-lg transition-all duration-300 overflow-hidden`}>
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Menú</h2>
              
              {/* Navigation */}
              <nav className="space-y-2">
                {menuItems.map(item => {
                  const Icon = item.icon
                  const active = isActive(item.path)
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        active
                          ? 'bg-yellow-400 text-gray-900 font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.name}</span>
                    </button>
                  )
                })}
              </nav>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-6 border-t border-gray-200 pt-6"
              >
                <LogOut size={20} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
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
