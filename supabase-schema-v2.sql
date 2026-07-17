-- ============================================
-- DTE Chile App - Database Schema v2
-- Many-to-Many: Users ↔ Companies
-- ============================================

-- 1️⃣ TABLA: companies (Empresas)
CREATE TABLE public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  rut VARCHAR(12) NOT NULL UNIQUE,
  descripcion TEXT,
  estado BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para companies
CREATE INDEX idx_companies_rut ON public.companies(rut);
CREATE INDEX idx_companies_estado ON public.companies(estado);

-- ============================================

-- 2️⃣ TABLA: user_profiles (Usuarios - SIN empresa individual)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'user', -- 'admin' global o 'user'
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para user_profiles
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_activo ON public.user_profiles(activo);

-- ============================================

-- 3️⃣ TABLA: user_company (Relación Many-to-Many)
-- Un usuario puede tener múltiples empresas
-- Una empresa puede tener múltiples usuarios
CREATE TABLE public.user_company (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  rol_en_empresa VARCHAR(50) NOT NULL DEFAULT 'viewer', -- 'admin', 'editor', 'viewer'
  rut_sii VARCHAR(12), -- RUT tributario para esta empresa
  credenciales_sii_encriptadas TEXT, -- Clave SII encriptada (AES-256)
  permisos JSONB DEFAULT '{}', -- JSON con permisos específicos
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, company_id)
);

-- Índices para user_company
CREATE INDEX idx_user_company_user_id ON public.user_company(user_id);
CREATE INDEX idx_user_company_company_id ON public.user_company(company_id);
CREATE INDEX idx_user_company_activo ON public.user_company(activo);

-- ============================================

-- 🔐 ROW LEVEL SECURITY (RLS)

-- Habilitar RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_company ENABLE ROW LEVEL SECURITY;

-- COMPANIES: Users ven empresas a las que están asignados
CREATE POLICY "Users can view their assigned companies" ON public.companies
  FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM public.user_company
      WHERE user_id = auth.uid() AND activo = true
    )
    OR
    (SELECT rol FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
  );

-- USER_PROFILES: Users ven su propio perfil
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- USER_PROFILES: Users actualizan su propio perfil
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- USER_COMPANY: Users ven sus propias asignaciones
CREATE POLICY "Users can view their own company assignments" ON public.user_company
  FOR SELECT
  USING (auth.uid() = user_id);

-- USER_COMPANY: Admins ven todas las asignaciones
CREATE POLICY "Admins can view all company assignments" ON public.user_company
  FOR SELECT
  USING (
    (SELECT rol FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
  );

-- ============================================

-- ⏰ TRIGGERS (Actualizar updated_at automáticamente)

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para companies
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para user_profiles
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para user_company
CREATE TRIGGER update_user_company_updated_at BEFORE UPDATE ON public.user_company
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================

-- 📋 DATOS DE PRUEBA (OPCIONAL - Comentar si no quieres)

-- Crear empresas de prueba
INSERT INTO public.companies (nombre, rut, descripcion) VALUES
  ('Mi Empresa LTDA', '76543210-K', 'Empresa principal'),
  ('Filial Santiago', '87654321-1', 'Oficina en Santiago'),
  ('Filial Valparaíso', '99999999-9', 'Oficina en Valparaíso')
ON CONFLICT (rut) DO NOTHING;

-- ============================================

-- 🎯 FUNCIONES ÚTILES

-- Función: Obtener empresas de un usuario
CREATE OR REPLACE FUNCTION get_user_companies(user_id UUID)
RETURNS TABLE(
  company_id UUID,
  company_nombre VARCHAR,
  company_rut VARCHAR,
  rol_en_empresa VARCHAR,
  rut_sii VARCHAR
) AS $$
SELECT
  c.id,
  c.nombre,
  c.rut,
  uc.rol_en_empresa,
  uc.rut_sii
FROM public.companies c
JOIN public.user_company uc ON c.id = uc.company_id
WHERE uc.user_id = user_id AND uc.activo = true AND c.estado = true
ORDER BY c.nombre;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Función: Obtener usuarios de una empresa
CREATE OR REPLACE FUNCTION get_company_users(company_id UUID)
RETURNS TABLE(
  user_id UUID,
  email VARCHAR,
  nombre VARCHAR,
  apellido VARCHAR,
  rol_en_empresa VARCHAR
) AS $$
SELECT
  up.id,
  up.email,
  up.nombre,
  up.apellido,
  uc.rol_en_empresa
FROM public.user_profiles up
JOIN public.user_company uc ON up.id = uc.user_id
WHERE uc.company_id = company_id AND uc.activo = true
ORDER BY up.nombre;
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================
-- ✅ Schema v2 completo
-- ============================================
