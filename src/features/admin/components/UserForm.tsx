import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Save, Loader2 } from 'lucide-react'
import {
    createGlobalAdminSchema,
    updateGlobalAdminSchema,
    createOperationalAdminSchema,
    updateOperationalAdminSchema,
    createWasherSchema,
    updateWasherSchema,
} from '../schemas/userSchemas'
import type { User, CreateUserRequest, UpdateUserRequest } from '../types/user.types'

type UserType = 'global-admin' | 'operational-admin' | 'washer'

interface UserFormProps {
    type: UserType
    initialData?: User | null
    isLoading?: boolean
    onSubmit: (data: CreateUserRequest | UpdateUserRequest) => void
    onCancel: () => void
}

export function UserForm({ type, initialData, isLoading, onSubmit, onCancel }: UserFormProps) {
    const isEditing = !!initialData

    // Select the correct schema based on type and mode (create/edit)
    const getSchema = () => {
        switch (type) {
            case 'global-admin':
                return isEditing ? updateGlobalAdminSchema : createGlobalAdminSchema
            case 'operational-admin':
                return isEditing ? updateOperationalAdminSchema : createOperationalAdminSchema
            case 'washer':
                return isEditing ? updateWasherSchema : createWasherSchema
            default:
                return createGlobalAdminSchema
        }
    }

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(getSchema()),
        defaultValues: {
            email: '',
            password: '',
            full_name: '',
            phone: '',
            commission_percentage: 0,
            is_active: true,
            ...initialData,
        },
    })

    // Reset form when initialData changes
    useEffect(() => {
        if (initialData) {
            reset(initialData)
        }
    }, [initialData, reset])

    return (
        <form onSubmit={handleSubmit((data) => onSubmit(data as CreateUserRequest | UpdateUserRequest))} className="space-y-5">
            {/* Email Field - Read only in edit mode */}
            {!isEditing && (
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Correo Electrónico
                    </label>
                    <input
                        {...register('email')}
                        type="email"
                        className={`w-full rounded-lg border px-3 py-2 outline-none transition-all dark:bg-gray-800 dark:text-white
                            ${errors.email
                                ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                                : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:border-gray-600'
                            }`}
                        placeholder="ejemplo@correo.com"
                    />
                    {errors.email && (
                        <p className="text-xs text-red-500">{errors.email.message as string}</p>
                    )}
                </div>
            )}

            {/* Password Field - Only for creation */}
            {!isEditing && (
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Contraseña
                    </label>
                    <input
                        {...register('password')}
                        type="password"
                        className={`w-full rounded-lg border px-3 py-2 outline-none transition-all dark:bg-gray-800 dark:text-white
                            ${errors.password
                                ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                                : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:border-gray-600'
                            }`}
                        placeholder="••••••••"
                    />
                    {errors.password && (
                        <p className="text-xs text-red-500">{errors.password.message as string}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        Mínimo 8 caracteres, una mayúscula, una minúscula y un número.
                    </p>
                </div>
            )}

            {/* Full Name */}
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre Completo
                </label>
                <input
                    {...register('full_name')}
                    type="text"
                    className={`w-full rounded-lg border px-3 py-2 outline-none transition-all dark:bg-gray-800 dark:text-white
                        ${errors.full_name
                            ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:border-gray-600'
                        }`}
                    placeholder="Juan Pérez"
                />
                {errors.full_name && (
                    <p className="text-xs text-red-500">{errors.full_name.message as string}</p>
                )}
            </div>

            {/* Phone */}
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Teléfono <span className="text-gray-400 font-normal">(Opcional)</span>
                </label>
                <input
                    {...register('phone')}
                    type="tel"
                    className={`w-full rounded-lg border px-3 py-2 outline-none transition-all dark:bg-gray-800 dark:text-white
                        ${errors.phone
                            ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:border-gray-600'
                        }`}
                    placeholder="+51 999 999 999"
                />
                {errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone.message as string}</p>
                )}
            </div>

            {/* Commission Percentage - Only for Washers */}
            {type === 'washer' && (
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Porcentaje de Comisión (%)
                    </label>
                    <input
                        {...register('commission_percentage', { valueAsNumber: true })}
                        type="number"
                        min="0"
                        max="100"
                        className={`w-full rounded-lg border px-3 py-2 outline-none transition-all dark:bg-gray-800 dark:text-white
                            ${errors.commission_percentage
                                ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                                : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:border-gray-600'
                            }`}
                    />
                    {errors.commission_percentage && (
                        <p className="text-xs text-red-500">{errors.commission_percentage.message as string}</p>
                    )}
                </div>
            )}

            {/* Is Active - Only in Edit Mode */}
            {isEditing && (
                <div className="flex items-center space-x-2">
                    <input
                        {...register('is_active')}
                        type="checkbox"
                        id="is_active"
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Usuario Activo
                    </label>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
            </div>
        </form>
    )
}
