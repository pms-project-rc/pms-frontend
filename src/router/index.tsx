import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector } from '@/hooks/useRedux'
import ProtectedRoute from '@/components/ProtectedRoute'
import AdminPricingConfig from '@/pages/admin/AdminPricingConfig.tsx';
import ReportsExport from '@/pages/admin/ReportsExport.tsx';
import EmployeesPage from '@/pages/admin/EmployeesPage';
import VehiclesPage from '@/pages/admin/VehiclesPage';
import WashesPage from '@/pages/admin/WashesPage';
import SubscriptionsPage from '@/pages/admin/SubscriptionsPage';
import AgreementsPage from '@/pages/admin/AgreementsPage';
import ExpensesPage from '@/pages/admin/ExpensesPage';


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

// Operational Pages (placeholder)
import OperationalDashboard from '@/pages/operational/DashboardPage'
import ReceptionPage from '@/pages/operational/ReceptionPage'

// Washer Pages (placeholder)
import WasherDashboard from '@/pages/washer/DashboardPage'

// Error Pages
import UnauthorizedPage from '@/pages/UnauthorizedPage'

// Smart redirect component based on user role
function SmartRedirect() {
  const { user, isAuthenticated } = useAppSelector(state => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user) {
    switch (user.role) {
      case 'global_admin':
        return <Navigate to="/admin/dashboard" replace />
      case 'operational_admin':
        return <Navigate to="/operational/dashboard" replace />
      case 'washer':
        return <Navigate to="/washer/dashboard" replace />
      default:
        return <Navigate to="/login" replace />
    }
  }

  return <Navigate to="/login" replace />
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
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="washes" element={<WashesPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="agreements" element={<AgreementsPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="reports" element={<ReportsExport />} />
        <Route path="pricing" element={<AdminPricingConfig />} />
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
        {/* 2 */}
        <Route path="reception" element={<ReceptionPage />} />

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
        {/* More routes will be added here */}
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />

      </Route>




      {/* Error Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Root redirect - smart redirect based on user role */}
      <Route path="/" element={<SmartRedirect />} />

      {/* 404 */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  )
}

export default Router
