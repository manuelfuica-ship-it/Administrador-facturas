'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/api/auth';

export default function LoginPage() {
  const router = useRouter();
  const [rut, setRut] = useState('');
  const [clave, setClave] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTestMode, setShowTestMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await authService.authenticate(rut, clave);

    if (result.success) {
      router.push('/facturas');
    } else {
      setError(result.error || 'Error de autenticación');
    }

    setLoading(false);
  };

  const handleTestMode = () => {
    authService.authenticate('76543210-K', 'test_password');
    sessionStorage.setItem('testMode', 'true');
    router.push('/facturas');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">DTE Chile</h1>
          <p className="text-gray-600 mt-2">Recreación de Facturas Electrónicas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="rut" className="block text-sm font-medium text-gray-700">
              RUT
            </label>
            <input
              id="rut"
              type="text"
              placeholder="12345678-9"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="clave" className="block text-sm font-medium text-gray-700">
              Clave Tributaria
            </label>
            <input
              id="clave"
              type="password"
              placeholder="••••••••"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition disabled:opacity-50"
          >
            {loading ? 'Autenticando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setShowTestMode(!showTestMode)}
            className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            {showTestMode ? '← Ocultar' : '🧪 Modo Prueba'}
          </button>

          {showTestMode && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900 mb-3">
                <strong>Modo Prueba:</strong> Carga datos ficticios para explorar la app sin API Key real.
              </p>
              <button
                onClick={handleTestMode}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition"
              >
                ▶ Entrar en Modo Prueba
              </button>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center mt-8">
          Tus credenciales se utilizan solo durante la sesión actual y no se almacenan.
        </p>
      </div>
    </div>
  );
}
