-- ============================================
-- FIX RLS: Agregar políticas de INSERT/CREATE
-- ============================================

-- 1️⃣ AGREGAR POLICY: INSERT en user_profiles (para registro)
-- Los usuarios pueden insertar SU PROPIO perfil
CREATE POLICY "Users can create their own profile" ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2️⃣ AGREGAR POLICY: INSERT en user_company (para asignación)
-- Admins pueden asignar usuarios a empresas
CREATE POLICY "Admins can assign users to companies" ON public.user_company
  FOR INSERT
  WITH CHECK (
    (SELECT rol FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
    OR auth.uid() = user_id  -- Usuarios pueden asignarse a sí mismos
  );

-- 3️⃣ AGREGAR POLICY: UPDATE en user_company
-- Users pueden actualizar sus asignaciones
CREATE POLICY "Users can update their company assignments" ON public.user_company
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- ✅ Políticas de INSERT/CREATE agregadas
-- ============================================
