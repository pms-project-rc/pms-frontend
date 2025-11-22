import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector } from '@/hooks/useRedux'

// Layouts
import AuthLayout from '@/layouts/AuthLayout'
import AdminLayout from '@/layouts/AdminLayout'
import OperationalLayout from '@/layouts/OperationalLayout'
import WasherLayout from '@/layouts/WasherLayout'

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

// Admin Pages (placeholder)
import AdminDashboard from '@/pages/admin/DashboardPage'
import UsersPage from '@/pages/admin/UsersPage'

// Operational Pages (placeholder)
import OperationalDashboard from '@/pages/operational/DashboardPage'

// Washer Pages (placeholder)
import WasherDashboard from '@/pages/washer/DashboardPage'

// Protected Route Component
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles: string[]
}) {
  const { user, isAuthenticated } = useAppSelector(state => state.auth)

  // DEVELOPMENT MODE: Bypass authentication
  const isDevelopment = import.meta.env.VITE_ENV === 'development' || import.meta.env.DEV

  if (isDevelopment) {
    console.log('🔓 Development mode: Authentication bypassed')
    return <>{children}</>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

function Router() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['global_admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UsersPage />} />
      </Route>

      {/* Operational Routes */}
      <Route
        path="/operational/*"
        element={
          <ProtectedRoute allowedRoles={['operational_admin']}>
            <OperationalLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<Navigate to="/operational/dashboard" replace />}
        />
        <Route path="dashboard" element={<OperationalDashboard />} />
      </Route>

      {/* Washer Routes */}
      <Route
        path="/washer/*"
        element={
          <ProtectedRoute allowedRoles={['washer']}>
            <WasherLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/washer/dashboard" replace />} />
        <Route path="dashboard" element={<WasherDashboard />} />
      </Route>

      {/* Root redirect */}
      <Route
        path="/"
        element={
          import.meta.env.DEV ? (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
              <div className="card max-w-2xl w-full">
                <h1 className="text-3xl font-bold text-gradient mb-6">🚀 PMS - Desarrollo</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Selecciona una ruta para acceder directamente (modo desarrollo):
                </p>

                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">🔐 Autenticación</h2>
                    <div className="space-y-2">
                      <a href="/login" className="block px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        → Login
                      </a>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">👨‍💼 Admin Global</h2>
                    <div className="space-y-2">
                      <a href="/admin/dashboard" className="block px-4 py-3 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 transition-colors text-primary-600 dark:text-primary-400">
                        → Dashboard Admin
                      </a>
                      <a href="/admin/users" className="block px-4 py-3 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 transition-colors text-primary-600 dark:text-primary-400">
                        → Usuarios
                      </a>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">🚗 Operativo</h2>
                    <div className="space-y-2">
                      <a href="/operational/dashboard" className="block px-4 py-3 rounded-lg bg-secondary-500/10 hover:bg-secondary-500/20 transition-colors text-secondary-600 dark:text-secondary-400">
                        → Dashboard Operativo
                      </a>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">🚿 Lavador</h2>
                    <div className="space-y-2">
                      <a href="/washer/dashboard" className="block px-4 py-3 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 transition-colors text-primary-600 dark:text-primary-400">
                        → Dashboard Lavador
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    ⚠️ <strong>Modo desarrollo:</strong> La autenticación está deshabilitada. En producción, todas las rutas estarán protegidas.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 404 */}
      <Route path="*" element={<div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900"><div className="card"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">404 - Página no encontrada</h1></div></div>} />
    </Routes>
  )
}

export default Router
