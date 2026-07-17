import { authService } from './auth';
import { DTEListItem, ApiResponse } from '@/types/dte';

interface DTEQuery {
  periodo?: string;
  filtroRut?: string;
  filtroFechaDesde?: string;
  filtroFechaHasta?: string;
  pagina?: number;
  limite?: number;
}

export async function getDTERecibidos(query: DTEQuery): Promise<ApiResponse<DTEListItem[]>> {
  try {
    const client = authService.getApiClient();

    if (!client.defaults.headers.common.Authorization) {
      return {
        success: false,
        error: 'No authenticated session',
      };
    }

    const params = new URLSearchParams();
    if (query.periodo) params.append('periodo', query.periodo);
    if (query.filtroRut) params.append('filtroRut', query.filtroRut);
    if (query.filtroFechaDesde) params.append('filtroFechaDesde', query.filtroFechaDesde);
    if (query.filtroFechaHasta) params.append('filtroFechaHasta', query.filtroFechaHasta);
    if (query.pagina) params.append('pagina', query.pagina.toString());
    if (query.limite) params.append('limite', query.limite.toString());

    const response = await client.get(`/dte/recibidos?${params.toString()}`);

    if (response.data && Array.isArray(response.data.documentos)) {
      return {
        success: true,
        data: response.data.documentos,
      };
    }

    return {
      success: false,
      error: 'Invalid response format',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch DTE list',
    };
  }
}

export async function getDTEXml(folio: number): Promise<ApiResponse<string>> {
  try {
    const client = authService.getApiClient();

    if (!client.defaults.headers.common.Authorization) {
      return {
        success: false,
        error: 'No authenticated session',
      };
    }

    const response = await client.get(`/dte/recibidos/${folio}`);

    if (response.data && response.data.xml) {
      return {
        success: true,
        data: response.data.xml,
      };
    }

    return {
      success: false,
      error: 'XML not found in response',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch DTE XML',
    };
  }
}

export async function getRegistroCompras(periodo: string): Promise<ApiResponse<any>> {
  try {
    const client = authService.getApiClient();

    if (!client.defaults.headers.common.Authorization) {
      return {
        success: false,
        error: 'No authenticated session',
      };
    }

    const response = await client.get(`/rcv?periodo=${periodo}`);

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch RCV',
    };
  }
}
