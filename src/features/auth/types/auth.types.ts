export interface User {
    id: number
    email: string
    full_name: string
    role: 'global_admin' | 'operational_admin' | 'washer'
}

export interface AuthResponse {
    access_token: string
    token_type: string
    role: string
    user_id: number
    full_name: string
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
}
