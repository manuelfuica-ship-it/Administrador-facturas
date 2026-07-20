'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser, logoutUser } from '@/api/supabase-auth-v2';
import { dteSupabaseService } from '@/api/dte-supabase';
import { DTE } from '@/types/dte';
import { parseXmlDte, validateDte } from '@/parser/xmlParser';
import { MOCK_DTE_DETAIL } from '@/utils/mockData';

export default function FacturaDetailPage({ params }: { params: { folio: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [dte, setDte] = useState<DTE | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('testMode')) {
      setDte(MOCK_DTE_DETAIL);
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

    const userId = userResult.data?.profile?.id;
    fetchDTE(userId);
  };

  const fetchDTE = async (userId?: string) => {
    setLoading(true);
    setError('');

    const companyId = typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompanyId') : null;

    const xmlResult = await dteSupabaseService.getDTEXml(
      parseInt(params.folio),
      companyId || '',
      userId
    );

    if (!xmlResult.success || !xmlResult.data) {
      setError(xmlResult.error || 'Error al cargar la factura');
      setLoading(false);
      return;
    }

    const parsedDte = parseXmlDte(xmlResult.data);

    if (!parsedDte) {
      setError('Error al procesar el XML de la factura');
      setLoading(false);
      return;
    }

    const validation = validateDte(parsedDte);
    if (!validation.valid) {
      setError(`Errores en validación: ${validation.errors.join(', ')}`);
      setLoading(false);
      return;
    }

    setDte(parsedDte);
    setLoading(false);
  };

  const handleDownloadPDF = async () => {
    if (!dte) return;

    setDownloading(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dte),
      });

      if (!response.ok) {
        setError('Error al generar PDF');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${dte.folio}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError('Error al descargar PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push('/auth');
  };

  const handleDownloadXML = async () => {
    if (!dte?.xmlOriginal) return;

    const blob = new Blob([dte.xmlOriginal], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factura-${dte.folio}.xml`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Cargando factura...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button
              onClick={() => router.back()}
              className="text-indigo-600 hover:text-indigo-900"
            >
              ← Volver
            </button>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
        </div>
      </div>
    );
  }

  if (!dte) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <button
              onClick={() => router.back()}
              className="text-indigo-600 hover:text-indigo-900 mb-2"
            >
              ← Volver
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Factura N° {dte.folio}
            </h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleDownloadXML}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Descargar XML
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {downloading ? 'Generando...' : 'Descargar PDF'}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Información de Emisor</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-semibold text-gray-700">RUT:</dt>
                <dd className="text-gray-600">{dte.rutEmisor}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-700">Razón Social:</dt>
                <dd className="text-gray-600">{dte.razonSocialEmisor}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-700">Giro:</dt>
                <dd className="text-gray-600">{dte.giroEmisor}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-700">Dirección:</dt>
                <dd className="text-gray-600">{dte.direccionEmisor}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-700">Comuna:</dt>
                <dd className="text-gray-600">{dte.comunaEmisor}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Información de Receptor</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-semibold text-gray-700">RUT:</dt>
                <dd className="text-gray-600">{dte.rutReceptor}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-700">Razón Social:</dt>
                <dd className="text-gray-600">{dte.razonSocialReceptor}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-700">Dirección:</dt>
                <dd className="text-gray-600">{dte.direccionReceptor || '-'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-700">Comuna:</dt>
                <dd className="text-gray-600">{dte.comunaReceptor || '-'}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Detalle de Ítems</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Descripción</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">Cantidad</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">Precio Unit.</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dte.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.nombreItem}</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-600">{item.cantidad || 1}</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-600">
                      ${item.precioUnitario?.toLocaleString('es-CL') || '-'}
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-semibold text-gray-900">
                      ${item.montoItem.toLocaleString('es-CL')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <div className="flex justify-end">
            <div className="w-64">
              <dl className="space-y-2 text-sm">
                {dte.montoNeto && (
                  <div className="flex justify-between">
                    <dt className="text-gray-700">Subtotal Neto:</dt>
                    <dd className="font-semibold">${dte.montoNeto.toLocaleString('es-CL')}</dd>
                  </div>
                )}
                {dte.iva && (
                  <div className="flex justify-between">
                    <dt className="text-gray-700">IVA ({dte.tasaIVA}%):</dt>
                    <dd className="font-semibold">${dte.iva.toLocaleString('es-CL')}</dd>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold border-t-2 pt-2">
                  <dt className="text-gray-900">TOTAL:</dt>
                  <dd className="text-gray-900">${dte.montoTotal.toLocaleString('es-CL')}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
