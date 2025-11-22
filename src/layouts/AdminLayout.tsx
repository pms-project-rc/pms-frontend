import { Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/ThemeToggle'

function AdminLayout() {
  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 glass-panel min-h-screen border-r border-gray-200/10 dark:border-white/10">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <span className="text-xl">🅿️</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-none">PMS</h2>
                  <span className="text-xs text-primary-400 font-medium">Admin Global</span>
                </div>
              </div>
              <ThemeToggle />
            </div>

            {/* Navigation Placeholder */}
            <nav className="space-y-2">
              <div className="px-4 py-3 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-300 cursor-pointer">
                Dashboard
              </div>
              <div className="px-4 py-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 cursor-pointer transition-colors">
                Usuarios
              </div>
            </nav>
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

export default AdminLayout
