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
    full_name?: string;
    email?: string;
    role: 'global_admin' | 'operational_admin' | 'washer';
    active: boolean;
    commission_percentage?: number;
}

class AuthService {
    private tokenKey = 'pms_access_token';

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        // Use the unified login endpoint
        const response = await axios.post<AuthResponse>(
            `${API_URL}/auth/login`,
            {
                email: credentials.username,
                password: credentials.password
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
            
            // Extract role - MUST be present in token
            const role = payload.role;
            if (!role) {
                console.warn('No role found in JWT payload');
                return null;
            }
            
            // Validate role is one of allowed values
            if (!['global_admin', 'operational_admin', 'washer'].includes(role)) {
                console.warn('Invalid role in token:', role);
                return null;
            }
            
            // Extract user ID - try multiple field names
            const userId = payload.user_id || payload.sub;
            if (!userId) {
                console.warn('No user_id or sub found in JWT payload');
                return null;
            }
            
            // Extract username
            const username = payload.username || payload.email || payload.sub || 'unknown';
            
            // Extract full_name and email
            const full_name = payload.full_name || payload.name;
            const email = payload.email;
            
            // Extract commission percentage (only for washers)
            const commission_percentage = payload.commission_percentage;
            
            return {
                id: userId,
                username,
                full_name,
                email,
                role: role as 'global_admin' | 'operational_admin' | 'washer',
                active: true,
                commission_percentage
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

