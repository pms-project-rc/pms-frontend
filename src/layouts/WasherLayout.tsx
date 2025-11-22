import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { logout } from '@/store/slices/authSlice'

function WasherLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 glass-panel min-h-screen border-r border-gray-200/10 dark:border-white/10 flex flex-col">
          <div className="p-6 flex-1">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <span className="text-xl">🚿</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-none">PMS</h2>
                  <span className="text-xs text-primary-300 font-medium">Lavador</span>
                </div>
              </div>
              <ThemeToggle />
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <Link
                to="/washer/dashboard"
                className={`block px-4 py-3 rounded-lg transition-colors ${isActive('/washer/dashboard')
                    ? 'bg-primary-500/10 border border-primary-500/20 text-primary-300'
                    : 'hover:bg-white/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'
                  }`}
              >
                📊 Dashboard
              </Link>
            </nav>
          </div>

          {/* User Profile & Logout */}
          <div className="p-6 border-t border-gray-200/10 dark:border-white/10">
            <div className="mb-3 p-3 rounded-lg bg-white/5 dark:bg-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.full_name?.charAt(0).toUpperCase() || 'L'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.full_name || 'Lavador'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email || 'lavador@pms.com'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <span>🚪</span>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default WasherLayout
