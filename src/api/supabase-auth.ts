import { supabase, UserProfile } from '@/lib/supabase';
import { ApiResponse } from '@/types/dte';

export async function registerUser(
  email: string,
  password: string,
  rut: string,
  nombre: string,
  apellido: string,
  empresa: string,
): Promise<ApiResponse<{ user: any; profile: UserProfile }>> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return {
        success: false,
        error: authError.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'No user returned from signup',
      };
    }

    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: authData.user.id,
          email,
          rut,
          nombre,
          apellido,
          empresa,
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

export async function loginUser(
  email: string,
  password: string,
): Promise<ApiResponse<{ user: any; profile: UserProfile }>> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return {
        success: false,
        error: authError.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'No user returned from login',
      };
    }

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
      error: error.message || 'Login failed',
    };
  }
}

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

export async function getCurrentUser(): Promise<ApiResponse<UserProfile>> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session?.user) {
      return {
        success: false,
        error: 'No session',
      };
    }

    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', sessionData.session.user.id)
      .single();

    if (profileError) {
      return {
        success: false,
        error: profileError.message,
      };
    }

    return {
      success: true,
      data: profileData as UserProfile,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get current user',
    };
  }
}

export async function getAllUsers(): Promise<ApiResponse<UserProfile[]>> {
  try {
    const { data, error } = await supabase.from('user_profiles').select('*').eq('activo', true);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data as UserProfile[],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch users',
    };
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<ApiResponse<UserProfile>> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
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
      data: data as UserProfile,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update profile',
    };
  }
}
