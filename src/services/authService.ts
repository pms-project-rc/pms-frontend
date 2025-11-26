import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface User {
    id: number;
    username: string;
    role: 'global_admin' | 'operational_admin' | 'washer';
    active: boolean;
}

class AuthService {
    private tokenKey = 'pms_access_token';

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const formData = new URLSearchParams();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        const response = await axios.post<AuthResponse>(
            `${API_URL}/auth/login`,
            formData,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        if (response.data.access_token) {
            this.setToken(response.data.access_token);
        }

        return response.data;
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    setToken(token: string): void {
        localStorage.setItem(this.tokenKey, token);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    // Decode JWT to get user info (simple implementation)
    getCurrentUser(): User | null {
        const token = this.getToken();
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                id: payload.user_id || 0,
                username: payload.sub,
                role: payload.role || 'operational_admin',
                active: true,
            };
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    // Get user role from token
    getUserRole(): string | null {
        const user = this.getCurrentUser();
        return user?.role || null;
    }
}

export const authService = new AuthService();

// Axios interceptor to add auth token to requests
axios.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Axios interceptor to handle 401 responses
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            authService.logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
