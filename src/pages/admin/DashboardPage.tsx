function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Dashboard - Admin Global</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Vehículos Hoy
          </h3>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">0</p>
        </div>
        <div className="card">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Ingresos Hoy
          </h3>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">$0</p>
        </div>
        <div className="card">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Lavados Activos
          </h3>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">0</p>
        </div>
        <div className="card">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Ocupación
          </h3>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">0%</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
