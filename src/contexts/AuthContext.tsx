import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, LoginCredentials, User } from '../services/authService';
import { useAppDispatch } from '../hooks/useRedux';
import { setCredentials, logout as logoutAction } from '../store/slices/authSlice';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useAppDispatch();

    useEffect(() => {
        console.log('[AuthProvider] Initializing on mount');
        // Check if user is already logged in on mount
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            console.log('[AuthProvider] Found existing user:', currentUser);
            setUser(currentUser);
            // Sync with Redux
            dispatch(setCredentials({
                user: currentUser,
                token: authService.getToken() || '',
            }));
        } else {
            console.log('[AuthProvider] No existing user found');
        }
        setIsLoading(false);
        console.log('[AuthProvider] Initialization complete');
    }, [dispatch]);

    const login = async (credentials: LoginCredentials) => {
        try {
            console.log('[AuthContext] Login called with:', credentials.username);
            const response = await authService.login(credentials);
            console.log('[AuthContext] Login response:', response);
            
            const currentUser = authService.getCurrentUser();
            console.log('[AuthContext] getCurrentUser result:', currentUser);
            
            if (!currentUser) {
                throw new Error('No se pudo obtener la información del usuario después del login');
            }
            
            console.log('[AuthContext] Setting user and syncing Redux');
            setUser(currentUser);

            // Sync with Redux
            dispatch(setCredentials({
                user: currentUser,
                token: response.access_token,
            }));
            console.log('[AuthContext] Login complete, user and Redux updated');
        } catch (error) {
            console.error('[AuthContext] Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        console.log('[AuthContext] Logging out');
        authService.logout();
        setUser(null);

        // Sync with Redux
        dispatch(logoutAction());
        console.log('[AuthContext] Logout complete');
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
