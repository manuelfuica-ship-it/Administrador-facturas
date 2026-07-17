import axios, { AxiosInstance } from 'axios';
import { AuthSession, ApiResponse } from '@/types/dte';

class AuthService {
  private session: AuthSession | null = null;
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BASEAPI_URL,
      timeout: 10000,
    });
  }

  async authenticate(rut: string, clave: string): Promise<ApiResponse<AuthSession>> {
    try {
      const response = await this.apiClient.post('/auth', {
        rut,
        clave,
      });

      if (response.data.token) {
        const expiresAt = Date.now() + (parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '1800000'));
        this.session = {
          token: response.data.token,
          expiresAt,
          rut,
        };

        return {
          success: true,
          data: this.session,
        };
      }

      return {
        success: false,
        error: 'No token received from API',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Authentication failed',
      };
    }
  }

  getSession(): AuthSession | null {
    if (!this.session) return null;

    if (Date.now() > this.session.expiresAt) {
      this.session = null;
      return null;
    }

    return this.session;
  }

  getAuthHeader(): { Authorization: string } | null {
    const session = this.getSession();
    if (!session) return null;

    return {
      Authorization: `Bearer ${session.token}`,
    };
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  logout(): void {
    this.session = null;
  }

  getApiClient(): AxiosInstance {
    const headers = this.getAuthHeader();
    if (headers) {
      this.apiClient.defaults.headers.common = headers;
    }
    return this.apiClient;
  }
}

export const authService = new AuthService();
