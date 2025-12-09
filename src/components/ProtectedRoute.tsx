import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: ('global_admin' | 'operational_admin' | 'washer')[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated, token } = useAppSelector(state => state.auth);

    // If not authenticated AND no token, redirect to login
    if (!isAuthenticated && !token) {
        return <Navigate to="/login" replace />;
    }

    // If hay token pero aún no tenemos user (ej: decode lento), dejamos pasar para evitar rebote al login
    if (token && !user) {
        return <>{children}</>;
    }

    // If we have a user but they don't have the right role, redirect to unauthorized
    if (user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Everything is good!
    return <>{children}</>;
}

export default ProtectedRoute;
