const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jxvzwidkatsnnmgonrhg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dnp3aWRrYXRzbm5tZ29ucmhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDI0NjA2MCwiZXhwIjoyMDk5ODIyMDYwfQ.x_fRt2RQLIOBhh7xqytabjca3mrnUBNeIkmB3mnTQwI';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createTestUser() {
  try {
    console.log('🔄 Eliminando usuario anterior si existe...');

    // Eliminar usuario anterior
    await supabase.auth.admin.deleteUser('3a862a96-74a8-4335-97ae-fff5650dc5f1').catch(() => {});

    console.log('✅ Usuario anterior eliminado (si existía)');

    console.log('🔄 Creando nuevo usuario...');

    // Crear usuario con Admin API
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'testuser@mdscasinos.local',
      password: 'Test123456',
      email_confirm: true, // Confirmar email automáticamente
    });

    if (authError) {
      console.error('❌ Error creando usuario en autenticación:', authError);
      return;
    }

    const userId = authUser.user.id;
    console.log('✅ Usuario creado en autenticación:', userId);

    console.log('🔄 Creando perfil...');

    // Crear perfil
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: userId,
          email: 'testuser@mdscasinos.local',
          nombre: 'Juan',
          apellido: 'Pérez',
          rol: 'user',
          activo: true,
        },
      ])
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creando perfil:', profileError);
      return;
    }

    console.log('✅ Perfil creado correctamente');

    console.log('🔄 Asignando empresa...');

    // Asignar a empresa
    const { data: assignment, error: assignError } = await supabase
      .from('user_company')
      .insert([
        {
          user_id: userId,
          company_id: '2e44a1ea-0268-49a8-9e38-580f86a1664a',
          rol_en_empresa: 'viewer',
          rut_sii: '76543210-K',
          activo: true,
        },
      ])
      .select()
      .single();

    if (assignError) {
      console.error('❌ Error al asignar empresa:', assignError);
      return;
    }

    console.log('✅ Empresa asignada correctamente');

    console.log('\n' + '='.repeat(60));
    console.log('✅ USUARIO DE PRUEBA CREADO EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log('\n📧 Correo: testuser@mdscasinos.local');
    console.log('🔑 Contraseña: Test123456');
    console.log('🆔 ID Usuario: ' + userId);
    console.log('\n🌐 Abre: http://localhost:3001/auth');
    console.log('   Ingresa con las credenciales anteriores');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestUser();
