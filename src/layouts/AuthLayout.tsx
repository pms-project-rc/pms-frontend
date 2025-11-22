import { Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/ThemeToggle'

function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Theme toggle in top-right corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
