import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit, Trash2, Eye, AlertCircle, Loader, Users } from 'lucide-react';
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
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [shiftStatus, setShiftStatus] = useState<Record<number, boolean | null>>({});

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

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
            await fetchShiftStatuses(data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al cargar los empleados');
            console.error('Error loading employees:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchShiftStatuses = async (list: Employee[]) => {
        try {
            const entries = await Promise.all(
                list.map(async (emp) => {
                    try {
                        const res = await axios.get(`${API_URL}/shifts/status`, {
                            params: { admin_id: emp.id },
                        });
                        const statusValue = res.data?.status || res.data?.is_active || res.data?.active;
                        const isActive = statusValue === true || statusValue === 'active';
                        return [emp.id, isActive] as [number, boolean];
                    } catch (error) {
                        console.error('Error fetching shift status for', emp.id, error);
                        return [emp.id, null] as [number, null];
                    }
                })
            );
            const map: Record<number, boolean | null> = {};
            entries.forEach(([id, val]) => {
                map[id] = val;
            });
            setShiftStatus(map);
        } catch (error) {
            console.error('Error fetching shift statuses:', error);
        }
    };

    const handleSaveEmployee = async (data: any) => {
        try {
            if (editingEmployee) {
                // Clean data for update
                const updateData = { ...data };
                // If password is empty string, remove it so backend doesn't try to update it
                if (updateData.password === '') {
                    delete updateData.password;
                }
                await employeeService.updateEmployee(editingEmployee.id, editingEmployee.role, updateData);
            } else {
                await employeeService.createEmployee(data);
            }
            await loadEmployees(); // Recargar la lista
            setIsModalOpen(false);
            setEditingEmployee(null);
        } catch (err: any) {
            console.error('Error saving employee:', err);
            // Re-throw to let modal handle error display
            throw err;
        }
    };

    const handleEditClick = (employee: Employee) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };

    const handleCreateClick = () => {
        setEditingEmployee(null);
        setIsModalOpen(true);
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
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Gestión de Empleados
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Administra los usuarios del sistema
                    </p>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-2.5 rounded-lg shadow-sm transition-colors duration-200 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Nuevo Empleado
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o rol..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-gray-900 placeholder-gray-500"
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center">
                    <Loader className="animate-spin text-yellow-400 mb-4" size={48} />
                    <p className="text-gray-600">Cargando empleados...</p>
                </div>
            ) : (
                <>
                    {/* Table View */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Usuario
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Rol
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Turno
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Fecha Creación
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredEmployees.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                                <p className="text-lg font-medium text-gray-900">No se encontraron empleados</p>
                                                <p className="text-sm text-gray-500">Intenta ajustar los términos de búsqueda</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEmployees.map((employee) => (
                                            <tr key={`${employee.role}-${employee.id}`} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-sm mr-3">
                                                            {employee.full_name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {employee.full_name}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600">
                                                        {employee.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                                        {roleTranslations[employee.role]}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${employee.is_active
                                                            ? 'bg-green-50 text-green-700 border-green-100'
                                                            : 'bg-red-50 text-red-700 border-red-100'
                                                            }`}
                                                    >
                                                        {employee.is_active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${shiftStatus[employee.id] === null
                                                            ? 'bg-gray-50 text-gray-600 border-gray-200'
                                                            : shiftStatus[employee.id]
                                                                ? 'bg-green-50 text-green-700 border-green-100'
                                                                : 'bg-red-50 text-red-700 border-red-100'
                                                            }`}
                                                    >
                                                        {shiftStatus[employee.id] === null
                                                            ? 'Sin datos'
                                                            : shiftStatus[employee.id]
                                                                ? 'Turno Activo'
                                                                : 'Turno Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(employee.created_at).toLocaleDateString('es-CO', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                                            title="Ver detalles"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditClick(employee)}
                                                            className="text-gray-400 hover:text-yellow-600 p-2 rounded-lg hover:bg-yellow-50 transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteEmployee(employee)}
                                                            className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Footer with info */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Mostrando <span className="font-medium">{filteredEmployees.length}</span> de <span className="font-medium">{employees.length}</span> empleados
                            </span>
                        </div>
                    </div>
                </>
            )}

            {/* Modal de Nuevo/Editar Empleado */}
            <EmployeeModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingEmployee(null);
                }}
                onSubmit={handleSaveEmployee}
                employeeToEdit={editingEmployee}
            />
        </div>
    );
};

export default EmployeesPage;
