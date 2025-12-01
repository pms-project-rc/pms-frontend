import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSelector } from '@/hooks/useRedux';
import { Eye, EyeOff } from 'lucide-react';

import LogoImage from './asset/Logo.png';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const handlePasswordMouseDown = () => {
    setShowPassword(true);
  };

  const handlePasswordMouseUp = () => {
    setShowPassword(false);
  };

  return (
    // Asegurado el fondo con bg-gray-900 (el azul oscuro que deseas)
    <div className="flex h-screen w-screen bg-gray-900 flex-col md:flex-row">

      {/* Columna de la Izquierda: Formulario de Login */}
      <div className="flex md:w-5/12 w-full justify-center md:justify-end items-center p-6 md:p-12">
        <div className="w-full max-w-md md:max-w-lg bg-white p-8 md:p-12 rounded-xl shadow-2xl border-2 border-yellow-400">
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onMouseDown={handlePasswordMouseDown}
                  onMouseUp={handlePasswordMouseUp}
                  onMouseLeave={handlePasswordMouseUp}
                  onTouchStart={handlePasswordMouseDown}
                  onTouchEnd={handlePasswordMouseUp}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">Mantén presionado el ícono para ver tu contraseña</p>
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
            <div className="flex justify-center items-center pt-2">
              <a
                href="/reset-password"
                className="text-center px-4 py-2 text-sm font-semibold text-yellow-500 hover:text-yellow-600 transition duration-200"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Columna de la Derecha: Información de Seguridad y Logo */}
      <div className="flex md:w-7/12 w-full flex-col justify-center items-center text-white p-8 md:p-12">

        {/*
          SECCIÓN DEL LOGO: Ahora usa la variable importada y no tiene fondo gris.
        */}
        <div className="flex justify-center items-center mb-8">
          <img
            src={LogoImage} // <--- AHORA USA LA VARIABLE IMPORTADA
            alt="Logo de la Empresa"
            className="h-32 md:h-40 max-h-40 w-auto"
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