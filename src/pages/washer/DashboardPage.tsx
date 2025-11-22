function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Mis Servicios - Lavador</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Servicios Asignados
          </h3>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">0</p>
        </div>
        <div className="card">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Bonos Acumulados
          </h3>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">$0</p>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Servicios Pendientes</h2>
        <div className="card">
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No hay servicios asignados
          </p>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
