import { useAuth } from '@/contexts/AuthContext';
import { Loader } from 'lucide-react';

interface AuthInitializerProps {
    children: React.ReactNode;
}

export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
    const { isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <Loader className="animate-spin mx-auto mb-4" size={48} />
                    <p className="text-gray-600">Inicializando autenticación...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
