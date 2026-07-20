import axios, { AxiosInstance } from 'axios';
import { supabase } from '@/lib/supabase';
import { DTEListItem, ApiResponse } from '@/types/dte';
import { MOCK_DTE_LIST, MOCK_DTE_DETAIL, getMockDTEByFolio } from '@/utils/mockData';

interface DTEQuery {
  periodo?: string;
  filtroRut?: string;
  filtroFechaDesde?: string;
  filtroFechaHasta?: string;
  pagina?: number;
  limite?: number;
  companyId?: string;
}

class DTESupabaseService {
  private baseApiUrl = process.env.NEXT_PUBLIC_BASEAPI_URL;
  private baseApiKey = process.env.BASEAPI_API_KEY;
  private tokenCache: Map<string, { token: string; expiresAt: number }> = new Map();

  /**
   * Obtiene las credenciales SII del usuario para una empresa
   */
  async getCompanyCredentials(companyId: string, userId?: string) {
    try {
      // Si se proporciona userId, usarlo; si no, obtenerlo de sesión
      let finalUserId = userId;

      if (!finalUserId) {
        const { data } = await supabase.auth.getSession();

        if (!data?.session?.user) {
          console.error('[DTE] No authenticated user');
          return { success: false, error: 'No authenticated user' };
        }

        finalUserId = data.session.user.id;
      }

      console.log('[DTE] Getting credentials for user:', finalUserId, 'company:', companyId);

      // Obtener credenciales del usuario para esta empresa
      const { data, error } = await supabase
        .from('user_company')
        .select('rut_sii, credenciales_sii_encriptadas')
        .eq('user_id', finalUserId)
        .eq('company_id', companyId)
        .single();

      if (error) {
        console.error('[DTE] Error fetching credentials:', error);
        return { success: false, error: `Query error: ${error.message}` };
      }

      if (!data) {
        console.error('[DTE] No data returned from query');
        return { success: false, error: 'Credentials not found in database' };
      }

      console.log('[DTE] Credentials found:', {
        rut_sii: data.rut_sii,
        has_credentials: !!data.credenciales_sii_encriptadas
      });

      return {
        success: true,
        data: {
          rutSii: data.rut_sii,
          credencialesEncriptadas: data.credenciales_sii_encriptadas,
        },
      };
    } catch (error: any) {
      console.error('[DTE] Exception:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene token de BaseAPI usando credenciales SII
   */
  async getBaseApiToken(rutSii: string, claveSii: string): Promise<string | null> {
    try {
      const cacheKey = `${rutSii}`;
      const cached = this.tokenCache.get(cacheKey);

      // Verificar si token en cache es válido
      if (cached && Date.now() < cached.expiresAt) {
        return cached.token;
      }

      const response = await axios.post(
        `${this.baseApiUrl}/auth`,
        {
          rut: rutSii,
          clave: claveSii,
        },
        {
          timeout: 10000,
        }
      );

      if (response.data?.token) {
        const expiresAt = Date.now() + 3600000; // 1 hora
        this.tokenCache.set(cacheKey, {
          token: response.data.token,
          expiresAt,
        });

        return response.data.token;
      }

      return null;
    } catch (error: any) {
      console.error('BaseAPI auth error:', error.message);
      return null;
    }
  }

  /**
   * Obtiene DTEs recibidos desde BaseAPI
   */
  async getDTERecibidos(query: DTEQuery): Promise<ApiResponse<DTEListItem[]>> {
    try {
      // Si no hay companyId, usar mock data
      if (!query.companyId) {
        return {
          success: true,
          data: MOCK_DTE_LIST,
        };
      }

      // Obtener credenciales del usuario
      const credsResult = await this.getCompanyCredentials(query.companyId);

      if (!credsResult.success || !credsResult.data) {
        console.warn('No company credentials found, using mock data');
        return {
          success: true,
          data: MOCK_DTE_LIST,
        };
      }

      const { rutSii, credencialesEncriptadas } = credsResult.data;

      // TODO: Desencriptar credenciales
      // Por ahora, usamos el RUT SII como clave (DEMO)
      const claveSii = credencialesEncriptadas || 'demo_password';

      // Obtener token de BaseAPI
      const token = await this.getBaseApiToken(rutSii, claveSii);

      if (!token) {
        console.warn('Could not authenticate with BaseAPI, using mock data');
        return {
          success: true,
          data: MOCK_DTE_LIST,
        };
      }

      // Llamar a BaseAPI
      const client = axios.create({
        baseURL: this.baseApiUrl,
        timeout: 10000,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
        error: 'Invalid response format from BaseAPI',
      };
    } catch (error: any) {
      console.error('getDTERecibidos error:', error.message);

      // Fallback a mock data en caso de error
      return {
        success: true,
        data: MOCK_DTE_LIST,
      };
    }
  }

  /**
   * Obtiene un DTE específico
   */
  async getDTE(folio: number, companyId: string, userId?: string): Promise<ApiResponse<any>> {
    try {
      const credsResult = await this.getCompanyCredentials(companyId, userId);

      if (!credsResult.success || !credsResult.data) {
        console.warn('[DTE] No credentials, using mock data for folio', folio);
        // Fallback a mock data si no hay credenciales
        const mockDte = getMockDTEByFolio(folio);
        return {
          success: true,
          data: mockDte,
        };
      }

      const { rutSii, credencialesEncriptadas } = credsResult.data;
      const claveSii = credencialesEncriptadas || 'demo_password';

      const token = await this.getBaseApiToken(rutSii, claveSii);

      if (!token) {
        console.warn('[DTE] Could not authenticate with BaseAPI, using mock data for folio', folio);
        // Fallback a mock data si falla BaseAPI
        const mockDte = getMockDTEByFolio(folio);
        return {
          success: true,
          data: mockDte,
        };
      }

      const client = axios.create({
        baseURL: this.baseApiUrl,
        timeout: 10000,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await client.get(`/dte/recibidos/${folio}`);

      if (response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: 'DTE not found in response',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch DTE XML',
      };
    }
  }
}

export const dteSupabaseService = new DTESupabaseService();
