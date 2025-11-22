/**
 * Users Management Page
 *
 * Admin page to manage Global Admins, Operational Admins, and Washers
 */
import { useState } from 'react'
import {
    useGlobalAdmins,
    useOperationalAdmins,
    useWashers,
    useCreateGlobalAdmin,
    useCreateOperationalAdmin,
    useCreateWasher,
    useDeleteGlobalAdmin,
    useDeleteOperationalAdmin,
    useDeleteWasher,
} from '@/features/admin/hooks/useUsers'
import type {
    CreateGlobalAdminRequest,
    CreateOperationalAdminRequest,
    CreateWasherRequest,
} from '@/features/admin/types/user.types'

type UserType = 'global-admin' | 'operational-admin' | 'washer'

export default function UsersPage() {
    const [activeTab, setActiveTab] = useState<UserType>('global-admin')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<any>(null)

    // Queries
    const { data: globalAdmins, isLoading: loadingGA } = useGlobalAdmins()
    const { data: operationalAdmins, isLoading: loadingOA } = useOperationalAdmins()
    const { data: washers, isLoading: loadingW } = useWashers()

    // Mutations
    const createGA = useCreateGlobalAdmin()
    const createOA = useCreateOperationalAdmin()
    const createW = useCreateWasher()
    const deleteGA = useDeleteGlobalAdmin()
    const deleteOA = useDeleteOperationalAdmin()
    const deleteW = useDeleteWasher()

    const handleCreate = () => {
        setEditingUser(null)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return

        try {
            if (activeTab === 'global-admin') {
                await deleteGA.mutateAsync(id)
            } else if (activeTab === 'operational-admin') {
                await deleteOA.mutateAsync(id)
            } else {
                await deleteW.mutateAsync(id)
            }
            alert('Usuario eliminado exitosamente')
        } catch (error: any) {
            alert(`Error: ${error.response?.data?.detail || error.message}`)
        }
    }

    const handleSubmit = async (data: any) => {
        try {
            if (activeTab === 'global-admin') {
                await createGA.mutateAsync(data as CreateGlobalAdminRequest)
            } else if (activeTab === 'operational-admin') {
                await createOA.mutateAsync(data as CreateOperationalAdminRequest)
            } else {
                await createW.mutateAsync(data as CreateWasherRequest)
            }
            alert('Usuario creado exitosamente')
            setIsModalOpen(false)
        } catch (error: any) {
            alert(`Error: ${error.response?.data?.detail || error.message}`)
        }
    }

    const getCurrentUsers = () => {
        if (activeTab === 'global-admin') return globalAdmins || []
        if (activeTab === 'operational-admin') return operationalAdmins || []
        return washers || []
    }

    const isLoading = loadingGA || loadingOA || loadingW

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h1>
                <button
                    onClick={handleCreate}
                    className="btn-primary"
                >
                    + Crear Usuario
                </button>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex space-x-2 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('global-admin')}
                    className={`px-4 py-2 transition-colors ${activeTab === 'global-admin'
                        ? 'border-b-2 border-primary-600 font-bold text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                >
                    Global Admins ({globalAdmins?.length || 0})
                </button>
                <button
                    onClick={() => setActiveTab('operational-admin')}
                    className={`px-4 py-2 transition-colors ${activeTab === 'operational-admin'
                        ? 'border-b-2 border-primary-600 font-bold text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                >
                    Operational Admins ({operationalAdmins?.length || 0})
                </button>
                <button
                    onClick={() => setActiveTab('washer')}
                    className={`px-4 py-2 transition-colors ${activeTab === 'washer'
                        ? 'border-b-2 border-primary-600 font-bold text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                >
                    Lavadores ({washers?.length || 0})
                </button>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="text-center text-gray-600 dark:text-gray-400">Cargando...</div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Nombre Completo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Teléfono
                                </th>
                                {activeTab === 'washer' && (
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Comisión %
                                    </th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                            {getCurrentUsers().map((user: any) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{user.id}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                        {user.email}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                        {user.full_name}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {user.phone || '-'}
                                    </td>
                                    {activeTab === 'washer' && (
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                            {user.commission_percentage}%
                                        </td>
                                    )}
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${user.is_active
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                                                }`}
                                        >
                                            {user.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {getCurrentUsers().length === 0 && (
                                <tr>
                                    <td colSpan={activeTab === 'washer' ? 7 : 6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        No hay usuarios registrados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Simple Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg">
                        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            {editingUser ? 'Editar' : 'Crear'} Usuario
                        </h2>
                        <UserForm
                            userType={activeTab}
                            onSubmit={handleSubmit}
                            onCancel={() => setIsModalOpen(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

// Simple Form Component
function UserForm({
    userType,
    onSubmit,
    onCancel,
}: {
    userType: UserType
    onSubmit: (data: any) => void
    onCancel: () => void
}) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        commission_percentage: 0,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const data: any = {
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name,
        }
        if (formData.phone) data.phone = formData.phone
        if (userType === 'washer') data.commission_percentage = formData.commission_percentage
        onSubmit(data)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
                <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field mt-1 block w-full"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña *</label>
                <input
                    type="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field mt-1 block w-full"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo *</label>
                <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="input-field mt-1 block w-full"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field mt-1 block w-full"
                />
            </div>
            {userType === 'washer' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comisión %</label>
                    <input
                        type="number"
                        min={0}
                        max={100}
                        value={formData.commission_percentage}
                        onChange={(e) =>
                            setFormData({ ...formData, commission_percentage: parseInt(e.target.value) })
                        }
                        className="input-field mt-1 block w-full"
                    />
                </div>
            )}
            <div className="flex space-x-2">
                <button type="submit" className="btn-primary flex-1">
                    Guardar
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 rounded bg-gray-300 dark:bg-gray-600 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </form>
    )
}
