-- ============================================
-- ELIMINAR Y RECREAR POLÍTICAS RLS
-- ============================================
-- Ejecuta este script para limpiar y recrear las políticas correctamente

-- 1️⃣ DESACTIVAR RLS PARA LIMPIAR
ALTER TABLE recetas DISABLE ROW LEVEL SECURITY;

-- 2️⃣ ELIMINAR POLÍTICAS ANTIGUAS
DROP POLICY IF EXISTS "Recetas visibles para todos" ON recetas;
DROP POLICY IF EXISTS "Chefs pueden crear recetas" ON recetas;
DROP POLICY IF EXISTS "Chefs pueden actualizar sus propias recetas" ON recetas;
DROP POLICY IF EXISTS "Chefs pueden eliminar sus propias recetas" ON recetas;
DROP POLICY IF EXISTS "recetas_select" ON recetas;
DROP POLICY IF EXISTS "recetas_insert" ON recetas;
DROP POLICY IF EXISTS "recetas_update" ON recetas;
DROP POLICY IF EXISTS "recetas_delete" ON recetas;

-- 3️⃣ HABILITAR RLS EN LA TABLA
ALTER TABLE recetas ENABLE ROW LEVEL SECURITY;

-- 4️⃣ CREAR NUEVAS POLÍTICAS PARA RECETAS

-- POLÍTICA 1: Cualquiera puede VER recetas
CREATE POLICY "recetas_select"
  ON recetas
  FOR SELECT
  USING (true);

-- POLÍTICA 2: Usuarios autenticados pueden CREAR recetas
-- Solo validamos que chef_id coincida con el usuario actual
CREATE POLICY "recetas_insert"
  ON recetas
  FOR INSERT
  WITH CHECK (chef_id = auth.uid());

-- POLÍTICA 3: Solo el DUEÑO puede ACTUALIZAR su receta
CREATE POLICY "recetas_update"
  ON recetas
  FOR UPDATE
  USING (chef_id = auth.uid())
  WITH CHECK (chef_id = auth.uid());

-- POLÍTICA 4: Solo el DUEÑO puede ELIMINAR su receta
CREATE POLICY "recetas_delete"
  ON recetas
  FOR DELETE
  USING (chef_id = auth.uid());

-- ============================================
-- ✅ VERIFICACIÓN
-- ============================================
-- Después de ejecutar este script:
-- 1. Reinicia tu aplicación en Expo
-- 2. Crea un nuevo usuario CHEF
-- 3. Intenta crear una receta
-- 4. Revisa los logs en la terminal para ver si funciona

-- Si aún falla, verifica:
-- - La tabla 'usuarios' existe y tiene registros
-- - El usuario se registró con rol 'chef'
-- - El email está verificado en Supabase Auth
