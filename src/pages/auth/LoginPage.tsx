import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { login, clearError } from '@/store/slices/authSlice'
import { Loader2, AlertCircle } from 'lucide-react'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on role
      switch (user.role) {
        case 'global_admin':
          navigate('/admin/dashboard')
          break
        case 'operational_admin':
          navigate('/operational/dashboard')
          break
        case 'washer':
          navigate('/washer/dashboard')
          break
        default:
          navigate('/')
      }
    }
  }, [isAuthenticated, user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    dispatch(login({ email, password }))
  }

  const handleInputChange = () => {
    if (error) dispatch(clearError())
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 dark:bg-primary-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/10 dark:bg-secondary-500/5 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="card w-full max-w-md relative z-10 border-t border-gray-200/10 dark:border-white/10 bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <span className="text-3xl">🅿️</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-gray-900 dark:text-white">PMS</span>{' '}
            <span className="text-gradient">System</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Gestión de Parqueadero & Lavado</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
              Correo Electrónico
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 group-focus-within:text-primary-400 transition-colors">✉️</span>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); handleInputChange(); }}
                className="input-field w-full pl-10"
                placeholder="admin@pms.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
              Contraseña
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 group-focus-within:text-primary-400 transition-colors">🔒</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); handleInputChange(); }}
                className="input-field w-full pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 cursor-pointer transition-colors">
              <input type="checkbox" className="mr-2 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500" />
              Recordarme
            </label>
            <a href="/reset-password" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 text-lg font-semibold shadow-lg shadow-primary-900/20 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Iniciando...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2024 PMS System. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
