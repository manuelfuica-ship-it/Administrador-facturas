import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types/dte';

export interface UserProfile {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'admin' | 'user';
  activo: boolean;
  created_at: string;
}

export interface Company {
  id: string;
  nombre: string;
  rut: string;
  descripcion?: string;
  estado: boolean;
}

export interface UserCompanyAccess {
  company_id: string;
  company_nombre: string;
  company_rut: string;
  rol_en_empresa: 'admin' | 'editor' | 'viewer';
  rut_sii?: string;
}

// ============================================
// REGISTRO
// ============================================

export async function registerUser(
  email: string,
  password: string,
  nombre: string,
  apellido: string,
): Promise<ApiResponse<{ user: any; profile: UserProfile }>> {
  try {
    // 1. Crear usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message || 'Signup failed',
      };
    }

    // 2. Crear perfil en user_profiles
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: authData.user.id,
          email,
          nombre,
          apellido,
          rol: 'user',
          activo: true,
        },
      ])
      .select()
      .single();

    if (profileError) {
      return {
        success: false,
        error: `Profile creation failed: ${profileError.message}`,
      };
    }

    return {
      success: true,
      data: {
        user: authData.user,
        profile: profileData as UserProfile,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Registration failed',
    };
  }
}

// ============================================
// LOGIN
// ============================================

export async function loginUser(
  email: string,
  password: string,
): Promise<ApiResponse<{ user: any; profile: UserProfile; companies: UserCompanyAccess[] }>> {
  try {
    // 1. Autenticar
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message || 'Login failed',
      };
    }

    // 2. Obtener perfil
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      return {
        success: false,
        error: `Profile fetch failed: ${profileError.message}`,
      };
    }

    // 3. Obtener empresas del usuario
    const { data: companiesData, error: companiesError } = await supabase.rpc(
      'get_user_companies',
      { user_id: authData.user.id },
    );

    if (companiesError) {
      return {
        success: false,
        error: `Companies fetch failed: ${companiesError.message}`,
      };
    }

    return {
      success: true,
      data: {
        user: authData.user,
        profile: profileData as UserProfile,
        companies: (companiesData || []) as UserCompanyAccess[],
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Login failed',
    };
  }
}

// ============================================
// LOGOUT
// ============================================

export async function logoutUser(): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: null,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Logout failed',
    };
  }
}

// ============================================
// OBTENER USUARIO ACTUAL
// ============================================

export async function getCurrentUser(): Promise<
  ApiResponse<{ profile: UserProfile; companies: UserCompanyAccess[] }>
> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session?.user) {
      return {
        success: false,
        error: 'No session',
      };
    }

    const userId = sessionData.session.user.id;

    // Obtener perfil
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      return {
        success: false,
        error: profileError.message,
      };
    }

    // Obtener empresas
    const { data: companiesData, error: companiesError } = await supabase.rpc(
      'get_user_companies',
      { user_id: userId },
    );

    if (companiesError) {
      return {
        success: false,
        error: companiesError.message,
      };
    }

    return {
      success: true,
      data: {
        profile: profileData as UserProfile,
        companies: (companiesData || []) as UserCompanyAccess[],
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get current user',
    };
  }
}

// ============================================
// GESTIÓN DE EMPRESAS
// ============================================

export async function getAllCompanies(): Promise<ApiResponse<Company[]>> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('estado', true);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data as Company[],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch companies',
    };
  }
}

export async function createCompany(
  nombre: string,
  rut: string,
  descripcion?: string,
): Promise<ApiResponse<Company>> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert([
        {
          nombre,
          rut,
          descripcion,
          estado: true,
        },
      ])
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data as Company,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create company',
    };
  }
}

// ============================================
// ASIGNACIÓN DE USUARIO A EMPRESA
// ============================================

export async function assignUserToCompany(
  userId: string,
  companyId: string,
  rolEnEmpresa: 'admin' | 'editor' | 'viewer' = 'viewer',
  rutSii?: string,
): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('user_company')
      .insert([
        {
          user_id: userId,
          company_id: companyId,
          rol_en_empresa: rolEnEmpresa,
          rut_sii: rutSii,
          activo: true,
        },
      ])
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to assign user to company',
    };
  }
}

// ============================================
// GUARDAR CREDENCIALES SII ENCRIPTADAS
// ============================================

export async function updateCompanyCredentials(
  userId: string,
  companyId: string,
  rutSii: string,
  claveSiiEncriptada: string,
): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('user_company')
      .update({
        rut_sii: rutSii,
        credenciales_sii_encriptadas: claveSiiEncriptada,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update credentials',
    };
  }
}

// ============================================
// OBTENER USUARIOS DE UNA EMPRESA
// ============================================

export async function getCompanyUsers(companyId: string): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase.rpc('get_company_users', {
      company_id: companyId,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch company users',
    };
  }
}
