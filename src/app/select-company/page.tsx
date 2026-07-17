'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logoutUser } from '@/api/supabase-auth-v2';
import type { UserCompanyAccess } from '@/api/supabase-auth-v2';

export default function SelectCompanyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [companies, setCompanies] = useState<UserCompanyAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    setLoading(false);

    if (!result.data?.companies || result.data.companies.length === 0) {
      setError('No tienes empresas asignadas. Contacta al administrador.');
    }
  };

  const handleSelectCompany = (company: UserCompanyAccess) => {
    sessionStorage.setItem('selectedCompanyId', company.company_id);
    sessionStorage.setItem('selectedCompanyName', company.company_nombre);
    sessionStorage.setItem('selectedCompanyRut', company.company_rut);
    sessionStorage.setItem('selectedCompanyRolSii', company.rut_sii || '');
    router.push('/facturas');
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
          <p className="mt-4 text-gray-600">Cargando empresas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">DTE Chile</h1>
            <p className="text-sm text-gray-600">Selecciona una empresa</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Salir
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Usuario Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Bienvenido, {user?.nombre} {user?.apellido}
          </h2>
          <p className="text-gray-600">{user?.email}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-8">{error}</div>
        )}

        {/* Empresas Grid */}
        {companies.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Mis Empresas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {companies.map((company) => (
                <div
                  key={company.company_id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                  onClick={() => handleSelectCompany(company)}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900">
                          {company.company_nombre}
                        </h4>
                        <p className="text-sm text-gray-600">RUT: {company.company_rut}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          company.rol_en_empresa === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : company.rol_en_empresa === 'editor'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {company.rol_en_empresa === 'admin'
                          ? '👑 Admin'
                          : company.rol_en_empresa === 'editor'
                            ? '✏️ Editor'
                            : '👁️ Viewer'}
                      </span>
                    </div>

                    {/* SII Info */}
                    {company.rut_sii ? (
                      <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                        <p className="text-sm text-green-800">
                          <strong>✅ RUT SII Configurado:</strong> {company.rut_sii}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                        <p className="text-sm text-yellow-800">
                          <strong>⚠️ RUT SII No Configurado</strong>
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Deberás ingresarlo después
                        </p>
                      </div>
                    )}

                    {/* Button */}
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition">
                      Entrar →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {companies.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">No tienes empresas asignadas</p>
            <button
              onClick={handleLogout}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded"
            >
              Volver a Ingresar
            </button>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Nota:</strong> Selecciona una empresa para continuar. Puedes cambiar de
            empresa en cualquier momento desde el menú.
          </p>
        </div>
      </div>
    </div>
  );
}
