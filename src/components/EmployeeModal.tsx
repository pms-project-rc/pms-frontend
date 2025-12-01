import React, { useState } from 'react';
import { X } from 'lucide-react';
import {
    EmployeeCreateRequest,
    Employee,
    EmployeeUpdateRequest
} from '../services/employeeService';

interface EmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: EmployeeCreateRequest | EmployeeUpdateRequest) => Promise<void>;
    employeeToEdit?: Employee | null;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    employeeToEdit
}) => {
    const [formData, setFormData] = useState<EmployeeCreateRequest | EmployeeUpdateRequest>({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        role: 'operational_admin',
        commission_percentage: 0
    });

    React.useEffect(() => {
        if (isOpen) {
            if (employeeToEdit) {
                setFormData({
                    full_name: employeeToEdit.full_name,
                    email: employeeToEdit.email,
                    password: '',
                    phone: employeeToEdit.phone || '',
                    role: employeeToEdit.role,
                    commission_percentage: employeeToEdit.commission_percentage || 0
                });
            } else {
                setFormData({
                    full_name: '',
                    email: '',
                    password: '',
                    phone: '',
                    role: 'operational_admin',
                    commission_percentage: 0
                });
            }
        }
    }, [isOpen, employeeToEdit]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'commission_percentage'
                ? parseInt(value) || 0
                : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await onSubmit(formData);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al crear el empleado');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {employeeToEdit ? 'Editar Empleado' : 'Nuevo Empleado'}
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Nombre */}
                        <div className="md:col-span-2">
                            <label
                                htmlFor="full_name"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Nombre Completo <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                                focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-gray-900"
                                placeholder="Juan Pérez"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                                focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-gray-900"
                                placeholder="juan@example.com"
                            />
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label
                                htmlFor="phone"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                                focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-gray-900"
                                placeholder="+57 300 123 4567"
                            />
                        </div>

                        {/* Contraseña */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Contraseña{' '}
                                {employeeToEdit
                                    ? <span className="text-gray-400 text-xs">(Opcional)</span>
                                    : <span className="text-red-500">*</span>
                                }
                            </label>

                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required={!employeeToEdit}
                                minLength={6}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                                focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-gray-900"
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>

                        {/* Rol */}
                        <div>
                            <label
                                htmlFor="role"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Rol <span className="text-red-500">*</span>
                            </label>

                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                                focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-gray-900"
                            >
                                <option value="global_admin">Administrador Global</option>
                                <option value="operational_admin">Operador</option>
                                <option value="washer">Lavador</option>
                            </select>
                        </div>

                        {/* Comisión */}
                        {formData.role === 'washer' && (
                            <div className="md:col-span-2">
                                <label
                                    htmlFor="commission_percentage"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Porcentaje de Comisión (%)
                                </label>

                                <input
                                    type="number"
                                    id="commission_percentage"
                                    name="commission_percentage"
                                    value={formData.commission_percentage}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg
                                    focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-gray-900"
                                    placeholder="0"
                                />

                                <p className="text-sm text-gray-500 mt-1">
                                    Solo aplica para lavadores. Valor entre 0 y 100.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg
                            hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900
                            font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading
                                ? 'Guardando...'
                                : (employeeToEdit ? 'Actualizar' : 'Crear Empleado')}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EmployeeModal;
