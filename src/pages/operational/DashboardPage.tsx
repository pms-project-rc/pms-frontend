function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Dashboard - Admin Operativo</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Vehículos Activos
          </h3>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">0</p>
        </div>
        <div className="card">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Turno Actual
          </h3>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">$0</p>
        </div>
        <div className="card">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Lavados Pendientes
          </h3>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">0</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
