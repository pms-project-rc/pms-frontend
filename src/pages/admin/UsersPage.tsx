/**
 * Users Management Page
 *
 * Admin page to manage Global Admins, Operational Admins, and Washers
 * Includes CRUD operations, validations, and notifications.
 */
import { useState } from 'react'
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Shield,
    Briefcase,
    Droplets,
    CheckCircle2,
    XCircle
} from 'lucide-react'

// Hooks & Services
import {
    useGlobalAdmins,
    useOperationalAdmins,
    useWashers,
    useCreateGlobalAdmin,
    useUpdateGlobalAdmin,
    useDeleteGlobalAdmin,
    useToggleGlobalAdminActive,
    useCreateOperationalAdmin,
    useUpdateOperationalAdmin,
    useDeleteOperationalAdmin,
    useToggleOperationalAdminActive,
    useCreateWasher,
    useUpdateWasher,
    useDeleteWasher,
    useToggleWasherActive,
} from '@/features/admin/hooks/useUsers'
import { useToast } from '@/hooks/useToast'
import type {
    User,
    GlobalAdmin,
    OperationalAdmin,
    Washer,
    CreateUserRequest,
    UpdateUserRequest,
    CreateGlobalAdminRequest,
    CreateOperationalAdminRequest,
    CreateWasherRequest,
    UpdateGlobalAdminRequest,
    UpdateOperationalAdminRequest,
    UpdateWasherRequest
} from '@/features/admin/types/user.types'

// Components
import { UserForm } from '@/features/admin/components/UserForm'
import { Toast, ToastContainer } from '@/components/ui/Toast'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

type UserType = 'global-admin' | 'operational-admin' | 'washer'

export default function UsersPage() {
    // State
    const [activeTab, setActiveTab] = useState<UserType>('global-admin')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({
        isOpen: false,
        id: null,
    })

    // Hooks
    const { toasts, success, error: toastError, removeToast } = useToast()

    // Data Queries
    const { data: globalAdmins, isLoading: loadingGA } = useGlobalAdmins()
    const { data: operationalAdmins, isLoading: loadingOA } = useOperationalAdmins()
    const { data: washers, isLoading: loadingW } = useWashers()

    // Mutations - Global Admin
    const createGA = useCreateGlobalAdmin()
    const updateGA = useUpdateGlobalAdmin()
    const deleteGA = useDeleteGlobalAdmin()
    const toggleGA = useToggleGlobalAdminActive()

    // Mutations - Operational Admin
    const createOA = useCreateOperationalAdmin()
    const updateOA = useUpdateOperationalAdmin()
    const deleteOA = useDeleteOperationalAdmin()
    const toggleOA = useToggleOperationalAdminActive()

    // Mutations - Washer
    const createW = useCreateWasher()
    const updateW = useUpdateWasher()
    const deleteW = useDeleteWasher()
    const toggleW = useToggleWasherActive()

    // Handlers
    const handleCreate = () => {
        setEditingUser(null)
        setIsFormOpen(true)
    }

    const handleEdit = (user: User) => {
        setEditingUser(user)
        setIsFormOpen(true)
    }

    const handleDeleteClick = (id: number) => {
        setDeleteModal({ isOpen: true, id })
    }

    const handleConfirmDelete = async () => {
        if (!deleteModal.id) return

        try {
            if (activeTab === 'global-admin') {
                await deleteGA.mutateAsync(deleteModal.id)
            } else if (activeTab === 'operational-admin') {
                await deleteOA.mutateAsync(deleteModal.id)
            } else {
                await deleteW.mutateAsync(deleteModal.id)
            }
            success('Usuario eliminado exitosamente')
            setDeleteModal({ isOpen: false, id: null })
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } }; message?: string }
            const errorMessage = error.response?.data?.detail || error.message || 'Error al eliminar usuario'
            toastError(errorMessage)
        }
    }

    const handleToggleActive = async (id: number, currentStatus: boolean) => {
        try {
            if (activeTab === 'global-admin') {
                await toggleGA.mutateAsync(id)
            } else if (activeTab === 'operational-admin') {
                await toggleOA.mutateAsync(id)
            } else {
                await toggleW.mutateAsync(id)
            }
            success(`Usuario ${currentStatus ? 'desactivado' : 'activado'} exitosamente`)
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } }; message?: string }
            const errorMessage = error.response?.data?.detail || error.message || 'Error al cambiar estado'
            toastError(errorMessage)
        }
    }

    const handleFormSubmit = async (data: CreateUserRequest | UpdateUserRequest) => {
        try {
            if (editingUser) {
                // Update
                if (activeTab === 'global-admin') {
                    await updateGA.mutateAsync({ id: editingUser.id, data: data as UpdateGlobalAdminRequest })
                } else if (activeTab === 'operational-admin') {
                    await updateOA.mutateAsync({ id: editingUser.id, data: data as UpdateOperationalAdminRequest })
                } else {
                    await updateW.mutateAsync({ id: editingUser.id, data: data as UpdateWasherRequest })
                }
                success('Usuario actualizado exitosamente')
            } else {
                // Create
                if (activeTab === 'global-admin') {
                    await createGA.mutateAsync(data as CreateGlobalAdminRequest)
                } else if (activeTab === 'operational-admin') {
                    await createOA.mutateAsync(data as CreateOperationalAdminRequest)
                } else {
                    await createW.mutateAsync(data as CreateWasherRequest)
                }
                success('Usuario creado exitosamente')
            }
            setIsFormOpen(false)
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } }; message?: string }
            const errorMessage = error.response?.data?.detail || error.message || 'Error al guardar usuario'
            toastError(errorMessage)
        }
    }

    // Helper to get current data
    const getCurrentUsers = (): User[] => {
        if (activeTab === 'global-admin') return (globalAdmins as GlobalAdmin[]) || []
        if (activeTab === 'operational-admin') return (operationalAdmins as OperationalAdmin[]) || []
        return (washers as Washer[]) || []
    }

    const isLoading = loadingGA || loadingOA || loadingW
    const isSubmitting = createGA.isPending || updateGA.isPending || createOA.isPending || updateOA.isPending || createW.isPending || updateW.isPending

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <ToastContainer>
                {toasts.map((toast) => (
                    <Toast key={toast.id} {...toast} onClose={removeToast} />
                ))}
            </ToastContainer>

            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Gestión de Usuarios
                    </h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                        Administra los accesos y roles del sistema
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900 transition-all shadow-lg shadow-primary-500/30"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Usuario
                </button>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                    <li>
                        <button
                            onClick={() => setActiveTab('global-admin')}
                            className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group transition-colors ${activeTab === 'global-admin'
                                ? 'text-primary-600 border-primary-600 dark:text-primary-500 dark:border-primary-500'
                                : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <Shield className={`w-4 h-4 mr-2 ${activeTab === 'global-admin' ? 'text-primary-600' : 'text-gray-400'}`} />
                            Global Admins
                            <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                                {globalAdmins?.length || 0}
                            </span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('operational-admin')}
                            className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group transition-colors ${activeTab === 'operational-admin'
                                ? 'text-primary-600 border-primary-600 dark:text-primary-500 dark:border-primary-500'
                                : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <Briefcase className={`w-4 h-4 mr-2 ${activeTab === 'operational-admin' ? 'text-primary-600' : 'text-gray-400'}`} />
                            Operational Admins
                            <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                                {operationalAdmins?.length || 0}
                            </span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('washer')}
                            className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group transition-colors ${activeTab === 'washer'
                                ? 'text-primary-600 border-primary-600 dark:text-primary-500 dark:border-primary-500'
                                : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <Droplets className={`w-4 h-4 mr-2 ${activeTab === 'washer' ? 'text-primary-600' : 'text-gray-400'}`} />
                            Lavadores
                            <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                                {washers?.length || 0}
                            </span>
                        </button>
                    </li>
                </ul>
            </div>

            {/* Table Content */}
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                        <p className="mt-4 text-gray-500 dark:text-gray-400">Cargando usuarios...</p>
                    </div>
                ) : getCurrentUsers().length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                            <Search className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                        </div>
                        <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">No hay usuarios</h3>
                        <p className="text-gray-500 dark:text-gray-400">No se encontraron usuarios en esta categoría.</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Usuario</th>
                                <th scope="col" className="px-6 py-3">Contacto</th>
                                {activeTab === 'washer' && (
                                    <th scope="col" className="px-6 py-3">Comisión</th>
                                )}
                                <th scope="col" className="px-6 py-3">Estado</th>
                                <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getCurrentUsers().map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                                                {user.full_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="font-medium text-gray-900 dark:text-white">{user.full_name}</div>
                                                <div className="text-gray-500 dark:text-gray-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.phone ? (
                                            <span className="text-gray-900 dark:text-white">{user.phone}</span>
                                        ) : (
                                            <span className="text-gray-400 italic">No registrado</span>
                                        )}
                                    </td>
                                    {activeTab === 'washer' && 'commission_percentage' in user && (
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400">
                                                {user.commission_percentage}%
                                            </span>
                                        </td>
                                    )}
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleActive(user.id, user.is_active)}
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${user.is_active
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                                                }`}
                                        >
                                            {user.is_active ? (
                                                <>
                                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                                    Activo
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="mr-1 h-3 w-3" />
                                                    Inactivo
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(user.id)}
                                                className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-red-400 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800 animate-in zoom-in-95 duration-200">
                        <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
                            {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                        </h2>
                        <UserForm
                            type={activeTab}
                            initialData={editingUser}
                            isLoading={isSubmitting}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setIsFormOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="¿Eliminar usuario?"
                message="Esta acción no se puede deshacer. El usuario perderá acceso al sistema inmediatamente."
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                variant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteModal({ isOpen: false, id: null })}
            />
        </div>
    )
}
