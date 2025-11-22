/**
 * User Form Validation Schemas
 * 
 * Zod schemas for validating user forms
 */
import { z } from 'zod'

/**
 * Base user schema with common fields
 */
const baseUserSchema = z.object({
    email: z
        .string()
        .min(1, 'El email es requerido')
        .email('Debe ser un email válido'),
    full_name: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    phone: z
        .string()
        .optional()
        .refine(
            (val) => !val || /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(val),
            'Formato de teléfono inválido'
        ),
})

/**
 * Password schema for creation
 */
const passwordSchema = z.object({
    password: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(100, 'La contraseña no puede exceder 100 caracteres')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
        ),
})

/**
 * Global Admin Schemas
 */
export const createGlobalAdminSchema = baseUserSchema.merge(passwordSchema)

export const updateGlobalAdminSchema = z.object({
    full_name: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    phone: z
        .string()
        .optional()
        .refine(
            (val) => !val || /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(val),
            'Formato de teléfono inválido'
        ),
    is_active: z.boolean(),
})

export type CreateGlobalAdminFormData = z.infer<typeof createGlobalAdminSchema>
export type UpdateGlobalAdminFormData = z.infer<typeof updateGlobalAdminSchema>

/**
 * Operational Admin Schemas
 */
export const createOperationalAdminSchema = baseUserSchema.merge(passwordSchema)

export const updateOperationalAdminSchema = z.object({
    full_name: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    phone: z
        .string()
        .optional()
        .refine(
            (val) => !val || /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(val),
            'Formato de teléfono inválido'
        ),
    is_active: z.boolean(),
})

export type CreateOperationalAdminFormData = z.infer<typeof createOperationalAdminSchema>
export type UpdateOperationalAdminFormData = z.infer<typeof updateOperationalAdminSchema>

/**
 * Washer Schemas
 */
export const createWasherSchema = baseUserSchema
    .merge(passwordSchema)
    .extend({
        commission_percentage: z
            .number()
            .min(0, 'La comisión no puede ser negativa')
            .max(100, 'La comisión no puede exceder 100%')
            .int('La comisión debe ser un número entero'),
    })

export const updateWasherSchema = z.object({
    full_name: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    phone: z
        .string()
        .optional()
        .refine(
            (val) => !val || /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(val),
            'Formato de teléfono inválido'
        ),
    commission_percentage: z
        .number()
        .min(0, 'La comisión no puede ser negativa')
        .max(100, 'La comisión no puede exceder 100%')
        .int('La comisión debe ser un número entero'),
    is_active: z.boolean(),
})

export type CreateWasherFormData = z.infer<typeof createWasherSchema>
export type UpdateWasherFormData = z.infer<typeof updateWasherSchema>
