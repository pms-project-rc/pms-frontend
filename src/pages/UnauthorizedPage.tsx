import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';
import { useAuth } from '@/contexts/AuthContext';

function UnauthorizedPage() {
    const navigate = useNavigate();
    const { user } = useAppSelector(state => state.auth);
    const { logout } = useAuth();

    const handleGoToDashboard = () => {
        if (user) {
            switch (user.role) {
                case 'global_admin':
                    navigate('/admin/dashboard');
                    break;
                case 'operational_admin':
                    navigate('/operational/dashboard');
                    break;
                case 'washer':
                    navigate('/washer/dashboard');
                    break;
                default:
                    navigate('/login');
            }
        } else {
            navigate('/login');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            textAlign: 'center'
        }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#e74c3c' }}>
                403
            </h1>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                No Autorizado
            </h2>
            <p style={{ marginBottom: '2rem', color: '#666' }}>
                No tienes permisos para acceder a esta página.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={handleGoToDashboard}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Ir a mi Dashboard
                </button>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#95a5a6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}

export default UnauthorizedPage;
