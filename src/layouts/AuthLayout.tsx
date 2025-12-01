import { Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    // CAMBIO CLAVE: Cambiamos bg-gray-950 (negro puro) por bg-gray-900 (azul muy oscuro)
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout