import { authService } from './auth';
import { ApiResponse } from '@/types/dte';

export interface ContribuyenteDatos {
  rut: string;
  razonSocial: string;
  giro: string;
  direccion: string;
  comuna: string;
  ciudad?: string;
  acteco?: string;
  telefonos?: string[];
  emails?: string[];
}

export async function getContribuyenteDatos(rut: string): Promise<ApiResponse<ContribuyenteDatos>> {
  try {
    const client = authService.getApiClient();

    if (!client.defaults.headers.common.Authorization) {
      return {
        success: false,
        error: 'No authenticated session',
      };
    }

    const response = await client.get(`/contribuyente/datos-receptor?rut=${encodeURIComponent(rut)}`);

    if (response.data) {
      const datos: ContribuyenteDatos = {
        rut: response.data.rut || rut,
        razonSocial: response.data.razonSocial || response.data.rsocial || '',
        giro: response.data.giro || '',
        direccion: response.data.direccion || response.data.dir_origen || '',
        comuna: response.data.comuna || response.data.cmna_origen || '',
        ciudad: response.data.ciudad || response.data.ciudad_origen,
        acteco: response.data.acteco,
        telefonos: response.data.telefonos,
        emails: response.data.emails,
      };

      return {
        success: true,
        data: datos,
      };
    }

    return {
      success: false,
      error: 'No data found for contributor',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch contributor data',
    };
  }
}
