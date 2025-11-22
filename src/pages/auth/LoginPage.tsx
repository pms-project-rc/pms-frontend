function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 dark:bg-primary-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/10 dark:bg-secondary-500/5 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="card w-full max-w-md relative z-10 border-t border-gray-200/10 dark:border-white/10">
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

        <form className="space-y-6">
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
                className="input-field w-full pl-10"
                placeholder="admin@pms.com"
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
                className="input-field w-full pl-10"
                placeholder="••••••••"
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

          <button type="submit" className="btn-primary w-full py-3 text-lg font-semibold shadow-lg shadow-primary-900/20">
            Iniciar Sesión
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
