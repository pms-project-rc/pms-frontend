import api from '@/services/api'
import type { AuthResponse, LoginCredentials } from '../types/auth.types'

const AUTH_URL = '/auth'

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>(`${AUTH_URL}/login`, credentials)
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token)
            localStorage.setItem('user', JSON.stringify({
                id: response.data.user_id,
                full_name: response.data.full_name,
                role: response.data.role
            }))
        }
        return response.data
    },

    logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user')
        if (userStr) return JSON.parse(userStr)
        return null
    },

    getToken() {
        return localStorage.getItem('token')
    }
}
