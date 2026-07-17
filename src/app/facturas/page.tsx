'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logoutUser } from '@/api/supabase-auth-v2';
import { dteSupabaseService } from '@/api/dte-supabase';
import { DTEListItem } from '@/types/dte';
import { MOCK_DTE_LIST } from '@/utils/mockData';

export default function FacturasPage() {
  const router = useRouter();
  const [facturas, setFacturas] = useState<DTEListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [periodo, setPeriodo] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('testMode')) {
      setFacturas(MOCK_DTE_LIST);
      setLoading(false);
      return;
    }

    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const userResult = await getCurrentUser();

    if (!userResult.success) {
      router.push('/auth');
      return;
    }

    fetchFacturas();
  };

  const fetchFacturas = async () => {
    setLoading(true);
    setError('');

    const companyId = typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompanyId') : null;

    const result = await dteSupabaseService.getDTERecibidos({
      periodo,
      limite: 50,
      companyId: companyId || undefined,
    });

    if (result.success && result.data) {
      setFacturas(result.data);
    } else {
      setError(result.error || 'Error al cargar facturas');
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push('/auth');
  };

  const handlePeriodoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPeriodo(e.target.value);
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFacturas();
  };

  const getDTEName = (tipoDTE: number) => {
    const names: Record<number, string> = {
      33: 'Factura',
      34: 'Factura Exenta',
      52: 'Guía Despacho',
      56: 'Nota Débito',
      61: 'Nota Crédito',
    };
    return names[tipoDTE] || `DTE ${tipoDTE}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">DTE Chile - Facturas Recibidas</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Salir
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <form onSubmit={handleBuscar} className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Período (AAAA-MM)</label>
              <input
                type="month"
                value={periodo}
                onChange={handlePeriodoChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Buscar'}
            </button>
          </div>
        </form>

        {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6">{error}</div>}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Cargando facturas...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {facturas.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No hay facturas en este período</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Folio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RUT Emisor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Razón Social</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {facturas.map((factura) => (
                    <tr key={`${factura.folio}-${factura.rutEmisor}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{factura.folio}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{getDTEName(factura.tipoDTE)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{factura.rutEmisor}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{factura.razonSocialEmisor}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{factura.fechaEmision}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900">
                        ${factura.montoTotal.toLocaleString('es-CL')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() =>
                            router.push(`/facturas/${factura.folio}?rut=${factura.rutEmisor}`)
                          }
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
