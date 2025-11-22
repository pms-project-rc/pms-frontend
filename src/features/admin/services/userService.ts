/**
 * User Management API Service
 * 
 * HTTP client for user-related operations
 */
import api from '@/services/api'
import type {
    GlobalAdmin,
    OperationalAdmin,
    Washer,
    CreateGlobalAdminRequest,
    CreateOperationalAdminRequest,
    CreateWasherRequest,
    UpdateGlobalAdminRequest,
    UpdateOperationalAdminRequest,
    UpdateWasherRequest,
} from '../types/user.types'

const USERS_BASE = '/users'

/**
 * Global Admins API
 */
export const globalAdminService = {
    /**
     * Fetch all global admins
     */
    async getAll(params?: { skip?: number; limit?: number; only_active?: boolean }) {
        const response = await api.get<GlobalAdmin[]>(`${USERS_BASE}/global-admins`, { params })
        return response.data
    },

    /**
     * Get a global admin by ID
     */
    async getById(id: number) {
        const response = await api.get<GlobalAdmin>(`${USERS_BASE}/global-admins/${id}`)
        return response.data
    },

    /**
     * Create a new global admin
     */
    async create(data: CreateGlobalAdminRequest) {
        const response = await api.post<GlobalAdmin>(`${USERS_BASE}/global-admins`, data)
        return response.data
    },

    /**
     * Update a global admin
     */
    async update(id: number, data: UpdateGlobalAdminRequest) {
        const response = await api.put<GlobalAdmin>(`${USERS_BASE}/global-admins/${id}`, data)
        return response.data
    },

    /**
     * Delete a global admin
     */
    async delete(id: number) {
        const response = await api.delete<{ message: string }>(`${USERS_BASE}/global-admins/${id}`)
        return response.data
    },

    /**
     * Toggle active status of a global admin
     */
    async toggleActive(id: number) {
        const response = await api.patch<GlobalAdmin>(`${USERS_BASE}/global-admins/${id}/toggle-active`)
        return response.data
    },
}

/**
 * Operational Admins API
 */
export const operationalAdminService = {
    async getAll(params?: { skip?: number; limit?: number; only_active?: boolean }) {
        const response = await api.get<OperationalAdmin[]>(`${USERS_BASE}/operational-admins`, {
            params,
        })
        return response.data
    },

    async getById(id: number) {
        const response = await api.get<OperationalAdmin>(`${USERS_BASE}/operational-admins/${id}`)
        return response.data
    },

    async create(data: CreateOperationalAdminRequest) {
        const response = await api.post<OperationalAdmin>(`${USERS_BASE}/operational-admins`, data)
        return response.data
    },

    async update(id: number, data: UpdateOperationalAdminRequest) {
        const response = await api.put<OperationalAdmin>(
            `${USERS_BASE}/operational-admins/${id}`,
            data
        )
        return response.data
    },

    async delete(id: number) {
        const response = await api.delete<{ message: string }>(
            `${USERS_BASE}/operational-admins/${id}`
        )
        return response.data
    },

    /**
     * Toggle active status of an operational admin
     */
    async toggleActive(id: number) {
        const response = await api.patch<OperationalAdmin>(
            `${USERS_BASE}/operational-admins/${id}/toggle-active`
        )
        return response.data
    },
}

/**
 * Washers API
 */
export const washerService = {
    async getAll(params?: {
        skip?: number
        limit?: number
        only_active?: boolean
        min_commission?: number
        max_commission?: number
    }) {
        const response = await api.get<Washer[]>(`${USERS_BASE}/washers`, { params })
        return response.data
    },

    async getById(id: number) {
        const response = await api.get<Washer>(`${USERS_BASE}/washers/${id}`)
        return response.data
    },

    async create(data: CreateWasherRequest) {
        const response = await api.post<Washer>(`${USERS_BASE}/washers`, data)
        return response.data
    },

    async update(id: number, data: UpdateWasherRequest) {
        const response = await api.put<Washer>(`${USERS_BASE}/washers/${id}`, data)
        return response.data
    },

    async delete(id: number) {
        const response = await api.delete<{ message: string }>(`${USERS_BASE}/washers/${id}`)
        return response.data
    },

    /**
     * Toggle active status of a washer
     */
    async toggleActive(id: number) {
        const response = await api.patch<Washer>(`${USERS_BASE}/washers/${id}/toggle-active`)
        return response.data
    },
}
