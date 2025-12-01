import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, AlertCircle, Loader } from 'lucide-react';
import { employeeService, Employee, EmployeeCreateRequest } from '../../services/employeeService';
import EmployeeModal from '../../components/EmployeeModal';

const roleTranslations: { [key: string]: string } = {
    global_admin: 'Administrador Global',
    operational_admin: 'Operador',
    washer: 'Lavador',
};

const EmployeesPage: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cargar empleados al montar el componente
    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await employeeService.getAllEmployees();
            setEmployees(data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al cargar los empleados');
            console.error('Error loading employees:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEmployee = async (data: EmployeeCreateRequest) => {
        await employeeService.createEmployee(data);
        await loadEmployees(); // Recargar la lista
    };

    const handleDeleteEmployee = async (employee: Employee) => {
        console.log('Intentando eliminar empleado:', employee);
        if (!window.confirm(`¿Estás seguro de eliminar a ${employee.full_name}?`)) {
            return;
        }

        try {
            await employeeService.deleteEmployee(employee.id, employee.role);
            await loadEmployees(); // Recargar la lista
        } catch (err: any) {
            console.error('Error al eliminar:', err);
            alert(err.response?.data?.detail || 'Error al eliminar el empleado');
        }
    };

    const filteredEmployees = employees.filter(
        (emp) =>
            emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            roleTranslations[emp.role].toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Gestión de Empleados
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Administra los usuarios del sistema
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-3 rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Nuevo Empleado
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input




                        type="text"
                        placeholder="Buscar por nombre, email o rol..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-gray-900"
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button
                        onClick={loadEmployees}
                        className="ml-auto text-red-600 hover:text-red-800 font-medium"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="bg-white rounded-lg shadow-md p-12 flex flex-col items-center justify-center">
                    <Loader className="animate-spin text-yellow-400 mb-4" size={48} />
                    <p className="text-gray-600">Cargando empleados...</p>
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usuario
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rol
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha Creación
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredEmployees.map((employee) => (
                                    <tr key={`${employee.role}-${employee.id}`} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {employee.full_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {employee.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {roleTranslations[employee.role]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {employee.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(employee.created_at).toLocaleDateString('es-CO')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                    title="Ver detalles"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => alert('La edición de empleados estará disponible próximamente')}
                                                    className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                                                    title="Editar"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteEmployee(employee)}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredEmployees.length === 0 && !loading && (
                            <div className="text-center py-12 text-gray-500">
                                No se encontraron empleados
                            </div>
                        )}
                    </div>

                    {/* Footer con info */}
                    <div className="mt-4 text-sm text-gray-600">
                        Mostrando {filteredEmployees.length} de {employees.length} empleados
                    </div>
                </>
            )}

            {/* Modal de Nuevo Empleado */}
            <EmployeeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateEmployee}
            />
        </div>
    );
};

export default EmployeesPage;

