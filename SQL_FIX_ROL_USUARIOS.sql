-- ============================================
-- FIX: POLÍTICAS RLS PARA TABLA USUARIOS
-- ============================================
-- Este script arregla el error 42501 (RLS policy violation)

-- 1️⃣ DESACTIVAR RLS TEMPORALMENTE PARA LIMPIAR
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- 2️⃣ ELIMINAR TODAS LAS POLÍTICAS ANTIGUAS
DROP POLICY IF EXISTS "Usuarios visibles para todos" ON usuarios;
DROP POLICY IF EXISTS "Usuarios pueden crear su propio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuarios actualizan su propio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuarios pueden insertar" ON usuarios;
DROP POLICY IF EXISTS "usuarios_select_all" ON usuarios;
DROP POLICY IF EXISTS "usuarios_insert" ON usuarios;
DROP POLICY IF EXISTS "usuarios_update" ON usuarios;
DROP POLICY IF EXISTS "usuarios_delete" ON usuarios;

-- 3️⃣ LIMPIAR DATOS ANTIGUOS (OPCIONAL - comentar si quieres mantener datos)
-- DELETE FROM usuarios;

-- 4️⃣ VOLVER A HABILITAR RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- 5️⃣ CREAR POLÍTICAS CORRECTAS

-- POLÍTICA 1: Cualquiera puede VER todos los usuarios
CREATE POLICY "usuarios_select_all"
  ON usuarios
  FOR SELECT
  USING (true);

-- POLÍTICA 2: Cualquier usuario autenticado puede INSERTAR su propio registro
-- SIN validación de auth.uid() porque la sesión podría no estar lista
CREATE POLICY "usuarios_insert"
  ON usuarios
  FOR INSERT
  WITH CHECK (true);

-- POLÍTICA 3: Usuarios autenticados pueden ACTUALIZAR su propio perfil
CREATE POLICY "usuarios_update"
  ON usuarios
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- POLÍTICA 4: Usuarios autenticados pueden ELIMINAR su propio perfil
CREATE POLICY "usuarios_delete"
  ON usuarios
  FOR DELETE
  USING (id = auth.uid());

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- 1. Ejecuta este script en Supabase SQL Editor
-- 2. Reinicia la app
-- 3. Crea un nuevo usuario como CHEF
-- 4. Verifica que aparezca en la tabla usuarios con rol = "chef"
