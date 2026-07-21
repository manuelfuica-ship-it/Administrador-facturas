// Check if required environment variables are present
const requiredEnvs = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_BASEAPI_URL',
  'SESSION_SECRET',
];

const missingEnvs = requiredEnvs.filter(env => !process.env[env]);

if (missingEnvs.length > 0) {
  console.warn(`⚠️  Missing environment variables: ${missingEnvs.join(', ')}`);
  console.warn('ℹ️  Using default/demo values for build...');
  
  // Set default values for build
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://jxvzwidkatsnnmgonrhg.supabase.co';
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_568Cg26wuVe4zfIr_bn9PQ_3T-ZxkL5';
  }
  if (!process.env.NEXT_PUBLIC_BASEAPI_URL) {
    process.env.NEXT_PUBLIC_BASEAPI_URL = 'https://api.baseapi.cl/v1';
  }
  if (!process.env.SESSION_SECRET) {
    process.env.SESSION_SECRET = 'demo_session_secret_32_chars_minimum_value';
  }
}

console.log('✓ Environment check passed');
