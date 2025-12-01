import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSelector } from '@/hooks/useRedux';

import LogoImage from './asset/Logo.png'; 

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector(state => state.auth);

  // Redirección si ya está autenticado (deja este bloque como estaba)
  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'global_admin':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'operational_admin':
          navigate('/operational/dashboard', { replace: true });
          break;
        case 'washer':
          navigate('/washer/dashboard', { replace: true });
          break;
        default:
          break;
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ username, password });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Asegurado el fondo con bg-gray-900 (el azul oscuro que deseas)
    <div className="flex h-screen w-screen bg-gray-900">
      
      {/* Columna de la Izquierda: Formulario de Login */}
      <div className="flex w-2/5 justify-end items-center p-12">
        <div className="w-[440px] bg-white p-12 rounded-xl shadow-2xl border-2 border-yellow-400">
          <h2 className="text-3xl font-semibold mb-8 text-gray-900">
            Iniciar sesión
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-base font-medium text-gray-900 mb-1">
                Usuario
              </label>
              <input
                type="text"
               className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-base font-medium text-gray-900 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-600 transition duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : 'Entrar'}
            </button>
            
            {/*
              CAMBIO CLAVE: Contenedor flexible para alinear ambos botones/enlaces:
              "¿Olvidaste tu contraseña?" y "Registrarse".
            */}
            <div className="flex justify-between items-center pt-2 gap-2">
              <a
                href="/reset-password"
                // Clases para el botón 'Olvidaste' con fondo blanco y borde/texto amarillo
                className="flex-1 text-center px-4 py-2 text-sm font-semibold text-yellow-500 bg-white border border-yellow-500 rounded-lg hover:bg-yellow-50 transition duration-200"
              >
                ¿Olvidaste tu contraseña?
              </a>
              
              {/* Nuevo Botón de Registrarse */}
              <a
                href="/register" // <- Ruta al nuevo componente RegisterPage
                // Clases para el botón 'Registrarse': invertimos los colores para darle más prominencia
                className="flex-1 text-center px-4 py-2 text-sm font-semibold text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 transition duration-200"
              >
                Registrarse
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Columna de la Derecha: Información de Seguridad y Logo */}
      <div className="flex w-3/5 flex-col justify-center items-center text-white p-12">
        
        {/*
          SECCIÓN DEL LOGO: Ahora usa la variable importada y no tiene fondo gris.
        */}
        <div className="flex justify-center items-center mb-8">
          <img
            src={LogoImage} // <--- AHORA USA LA VARIABLE IMPORTADA
            alt="Logo de la Empresa"
            className="h-40 max-h-40 w-auto"
          />
        </div>
        
        {/* Texto de Bienvenida */}
        <p className="text-lg text-center leading-relaxed max-w-sm">
          Seguridad, acceso rápido y control total de tu espacio.
          <br />
          <span className="font-bold text-yellow-500">
            ¡Gestiona fácil y seguro!
          </span>
        </p>
        
        {/* Línea divisoria inferior */}
        <div className="w-16 h-1 bg-yellow-500 mt-4"></div>
      </div>
    </div>
  );
}

export default LoginPage;