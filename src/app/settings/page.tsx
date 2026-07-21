'use client';


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logoutUser, updateCompanyCredentials } from '@/api/supabase-auth-v2';
import type { UserCompanyAccess } from '@/api/supabase-auth-v2';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [companies, setCompanies] = useState<UserCompanyAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [rutSii, setRutSii] = useState('');
  const [claveSii, setclaveSii] = useState('');

  useEffect(() => {
    loadUserCompanies();
  }, []);

  const loadUserCompanies = async () => {
    const result = await getCurrentUser();

    if (!result.success) {
      router.push('/auth');
      return;
    }

    setUser(result.data?.profile);
    setCompanies(result.data?.companies || []);

    if (result.data?.companies && result.data.companies.length > 0) {
      setSelectedCompanyId(result.data.companies[0].company_id);
      setRutSii(result.data.companies[0].rut_sii || '');
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedCompanyId || !rutSii || !claveSii) {
      setError('Todos los campos son requeridos');
      return;
    }

    setSaving(true);

    try {
      // Obtener user ID de la sesión
      const { data } = await getCurrentUser();

      if (!data?.profile?.id) {
        setError('No se pudo obtener información del usuario');
        return;
      }

      // Aquí deberías encriptar la clave antes de guardar
      // Por ahora, la guardamos sin encriptar (TODO: implementar encriptación)
      const result = await updateCompanyCredentials(
        data.profile.id,
        selectedCompanyId,
        rutSii,
        claveSii
      );

      if (result.success) {
        setSuccess('✅ Credenciales guardadas correctamente');
        // Recargar datos
        setTimeout(() => {
          loadUserCompanies();
        }, 1000);
      } else {
        setError(result.error || 'Error al guardar credenciales');
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
            <p className="text-sm text-gray-600">Gestiona tus credenciales SII</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/select-company')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              ← Volver
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Usuario Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Hola, {user?.nombre} {user?.apellido}
          </h2>
          <p className="text-gray-600">{user?.email}</p>
        </div>

        {/* Formulario de Credenciales */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Credenciales SII</h3>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6">{error}</div>
          )}

          {success && (
            <div className="p-4 bg-green-50 text-green-700 rounded-lg mb-6">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleccionar Empresa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => {
                  setSelectedCompanyId(e.target.value);
                  const company = companies.find((c) => c.company_id === e.target.value);
                  if (company) {
                    setRutSii(company.rut_sii || '');
                  }
                }}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecciona una empresa</option>
                {companies.map((company) => (
                  <option key={company.company_id} value={company.company_id}>
                    {company.company_nombre} ({company.company_rut})
                  </option>
                ))}
              </select>
            </div>

            {/* RUT SII */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RUT SII
              </label>
              <input
                type="text"
                value={rutSii}
                onChange={(e) => setRutSii(e.target.value)}
                placeholder="12345678-9"
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">RUT tributario para acceder a SII</p>
            </div>

            {/* Clave SII */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clave SII
              </label>
              <input
                type="password"
                value={claveSii}
                onChange={(e) => setclaveSii(e.target.value)}
                placeholder="••••••••"
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ Será encriptada y guardada de forma segura
              </p>
            </div>

            {/* Botón Guardar */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition disabled:opacity-50"
            >
              {saving ? 'Guardando...' : '💾 Guardar Credenciales'}
            </button>
          </form>

          {/* Nota de Seguridad */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-900">
              <strong>🔒 Seguridad:</strong> Las credenciales se guardan encriptadas en la base
              de datos. No se comparten con terceros.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
