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

  // DEVELOPMENT MODE: Bypass authentication (DISABLED FOR TESTING AUTH)
  // const isDevelopment = import.meta.env.VITE_ENV === 'development' || import.meta.env.DEV

  // if (isDevelopment) {
  //   console.log('🔓 Development mode: Authentication bypassed')
  //   return <>{children}</>
  // }

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
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 */}
      <Route path="*" element={<div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900"><div className="card"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">404 - Página no encontrada</h1></div></div>} />
    </Routes>
  )
}

export default Router
