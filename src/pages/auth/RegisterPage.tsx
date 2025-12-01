import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowLeftCircle, UserPlus } from 'lucide-react';

// IMPORTANTE: si la imagen está en "src/pages/auth/asset/Logo.png"
import LogoImage from './asset/Logo.png';

function RegisterPage() {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setRegistrationSuccess(false);

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setRegistrationSuccess(true);

            setTimeout(() => navigate('/login'), 2000);

        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al registrar el usuario.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-gray-900 items-center justify-center p-4 overflow-x-hidden">

            {/* Card del formulario */}
            <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-10 border-2 border-yellow-500">

                {/* LOGO CENTRADO */}
                <div className="flex justify-center mb-6">
                    <img
                        src={LogoImage}
                        alt="Logo"
                        className="h-16 md:h-20 w-auto object-contain"
                    />
                </div>

                {/* TÍTULO */}
                <div className="text-center mb-8">
                    <UserPlus className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                    <h1 className="text-3xl font-extrabold text-gray-100">
                        Crear Cuenta
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">
                        Únete a la plataforma de gestión de estacionamiento.
                    </p>
                </div>

                {/* Mensajes */}
                {error && (
                    <div className="bg-red-600 bg-opacity-30 border border-red-500 text-red-200 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                {registrationSuccess && (
                    <div className="bg-green-600 bg-opacity-30 border border-green-500 text-green-200 p-3 rounded-lg mb-4 text-sm text-center font-semibold">
                        ¡Registro exitoso! Redirigiendo...
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Nombre Completo
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-3 border border-gray-700 bg-gray-900 text-white rounded-lg focus:border-yellow-500 transition"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isLoading || registrationSuccess}
                            />
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Correo Electrónico
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                className="w-full pl-10 pr-4 py-3 border border-gray-700 bg-gray-900 text-white rounded-lg focus:border-yellow-500 transition"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={isLoading || registrationSuccess}
                            />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                className="w-full pl-10 pr-4 py-3 border border-gray-700 bg-gray-900 text-white rounded-lg focus:border-yellow-500 transition"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading || registrationSuccess}
                            />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        </div>
                    </div>

                    {/* Confirmar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Confirmar Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                className="w-full pl-10 pr-4 py-3 border border-gray-700 bg-gray-900 text-white rounded-lg focus:border-yellow-500 transition"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={isLoading || registrationSuccess}
                            />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        </div>
                    </div>

                    {/* Botón */}
                    <button
                        type="submit"
                        className="w-full py-3 bg-yellow-500 text-gray-900 font-bold rounded-xl text-lg shadow-lg hover:bg-yellow-600 transition disabled:opacity-50 mt-6 flex items-center justify-center space-x-2"
                        disabled={isLoading || registrationSuccess}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-gray-900" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                            </svg>
                        ) : (
                            <UserPlus className="w-5 h-5" />
                        )}
                        <span>{isLoading ? "Registrando..." : "Registrar Cuenta"}</span>
                    </button>

                    {/* Volver */}
                    <div className="mt-6 text-center">
                        <a
                            href="/login"
                            className="text-sm text-blue-400 hover:text-blue-300 transition flex items-center justify-center space-x-1"
                        >
                            <ArrowLeftCircle className="w-4 h-4" />
                            <span>¿Ya tienes una cuenta? Inicia sesión</span>
                        </a>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default RegisterPage;
