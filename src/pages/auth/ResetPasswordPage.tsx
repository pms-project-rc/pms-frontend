function ResetPasswordPage() {
  return (
    <div className="card p-8 rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold text-center mb-2 text-gray-800 dark:text-white">
        Recuperar Contraseña
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6 text-sm">
        Ingresa tu email y te enviaremos un enlace para recuperar tu contraseña
      </p>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            className="input-field w-full"
            placeholder="correo@ejemplo.com"
          />
        </div>
        <button type="submit" className="btn-primary w-full">
          Enviar Enlace
        </button>
      </form>
      <div className="mt-4 text-center">
        <a href="/login" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
          Volver al inicio de sesión
        </a>
      </div>
    </div>
  )
}

export default ResetPasswordPage
