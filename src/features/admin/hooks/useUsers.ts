/**
 * Custom React Query hooks for User Management
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    globalAdminService,
    operationalAdminService,
    washerService,
} from '../services/userService'
import type {
    CreateGlobalAdminRequest,
    CreateOperationalAdminRequest,
    CreateWasherRequest,
    UpdateGlobalAdminRequest,
    UpdateOperationalAdminRequest,
    UpdateWasherRequest,
} from '../types/user.types'

// Query keys
export const userKeys = {
    all: ['users'] as const,
    globalAdmins: () => [...userKeys.all, 'global-admins'] as const,
    operationalAdmins: () => [...userKeys.all, 'operational-admins'] as const,
    washers: () => [...userKeys.all, 'washers'] as const,
}

/**
 * Global Admins Hooks
 */
export function useGlobalAdmins(params?: {
    skip?: number
    limit?: number
    only_active?: boolean
}) {
    return useQuery({
        queryKey: [...userKeys.globalAdmins(), params],
        queryFn: () => globalAdminService.getAll(params),
    })
}

export function useCreateGlobalAdmin() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateGlobalAdminRequest) => globalAdminService.create(data),
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: userKeys.globalAdmins() })
        },
    })
}

export function useUpdateGlobalAdmin() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateGlobalAdminRequest }) =>
            globalAdminService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.globalAdmins() })
        },
    })
}

export function useDeleteGlobalAdmin() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => globalAdminService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.globalAdmins() })
        },
    })
}

export function useToggleGlobalAdminActive() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => globalAdminService.toggleActive(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.globalAdmins() })
        },
    })
}


/**
 * Operational Admins Hooks
 */
export function useOperationalAdmins(params?: {
    skip?: number
    limit?: number
    only_active?: boolean
}) {
    return useQuery({
        queryKey: [...userKeys.operationalAdmins(), params],
        queryFn: () => operationalAdminService.getAll(params),
    })
}

export function useCreateOperationalAdmin() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateOperationalAdminRequest) => operationalAdminService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.operationalAdmins() })
        },
    })
}

export function useUpdateOperationalAdmin() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateOperationalAdminRequest }) =>
            operationalAdminService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.operationalAdmins() })
        },
    })
}

export function useDeleteOperationalAdmin() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => operationalAdminService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.operationalAdmins() })
        },
    })
}

export function useToggleOperationalAdminActive() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => operationalAdminService.toggleActive(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.operationalAdmins() })
        },
    })
}


/**
 * Washers Hooks
 */
export function useWashers(params?: {
    skip?: number
    limit?: number
    only_active?: boolean
    min_commission?: number
    max_commission?: number
}) {
    return useQuery({
        queryKey: [...userKeys.washers(), params],
        queryFn: () => washerService.getAll(params),
    })
}

export function useCreateWasher() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateWasherRequest) => washerService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.washers() })
        },
    })
}

export function useUpdateWasher() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateWasherRequest }) =>
            washerService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.washers() })
        },
    })
}

export function useDeleteWasher() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => washerService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.washers() })
        },
    })
}

export function useToggleWasherActive() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => washerService.toggleActive(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.washers() })
        },
    })
}
