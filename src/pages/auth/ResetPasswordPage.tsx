import React, { useState } from 'react';
import { Mail, ArrowLeftCircle, Send } from 'lucide-react';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    if (!email) {
      setError('Por favor, ingresa tu dirección de email.');
      setIsLoading(false);
      return;
    }

    // --- Simulación de la lógica de recuperación de contraseña ---
    // Aquí se integraría la llamada a la API de FastAPI (Backend)
    console.log(`Solicitud de recuperación para: ${email}`);
    
    setTimeout(() => {
      setIsLoading(false);
      if (email.includes('test')) {
        setError('No pudimos encontrar una cuenta asociada a ese email.');
      } else {
        setMessage('✅ Enlace enviado. Revisa tu correo electrónico para restablecer tu contraseña.');
        setEmail('');
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      
      {/* Tarjeta de Recuperación */}
      <div className="w-full max-w-sm bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8">
        
        <div className="text-center mb-6">
          <Mail className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
          <h1 className="text-3xl font-extrabold text-gray-100">
            Recuperar Contraseña
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Ingresa tu email y te enviaremos un enlace seguro.
          </p>
        </div>

        {/* Mensajes de Estado */}
        {message && (
          <div className="bg-green-600 bg-opacity-30 border border-green-500 text-green-200 p-3 rounded-lg mb-4 text-sm text-center">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-600 bg-opacity-30 border border-red-500 text-red-200 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-700 bg-gray-900 text-white rounded-lg focus:border-yellow-500 transition"
                placeholder="correo@ejemplo.com"
                required
                disabled={isLoading}
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading || message}
            className="w-full py-3 bg-yellow-500 text-gray-900 font-bold rounded-xl text-lg shadow-lg hover:bg-yellow-600 transition duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span>{isLoading ? 'Enviando...' : 'Enviar Enlace'}</span>
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <a href="/login" className="text-sm text-blue-400 hover:text-blue-300 transition flex items-center justify-center space-x-1">
            <ArrowLeftCircle className="w-4 h-4" />
            <span>Volver al inicio de sesión</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;