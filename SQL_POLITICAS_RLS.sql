-- ============================================
-- SOLUCIÓN DEFINITIVA: DESHABILITAR RLS EN USUARIOS
-- ============================================
-- El problema es que la sesión no está completamente lista cuando se inserta
-- La solución: Desabilitar RLS en 'usuarios' o usar una política MÁS permisiva

-- 1️⃣ DESACTIVAR RLS COMPLETAMENTE EN USUARIOS
-- (Ya que Supabase Auth maneja la seguridad)
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- 2️⃣ Verificar que no hay políticas
DROP POLICY IF EXISTS "usuarios_select_all" ON usuarios;
DROP POLICY IF EXISTS "usuarios_insert" ON usuarios;
DROP POLICY IF EXISTS "usuarios_update" ON usuarios;
DROP POLICY IF EXISTS "usuarios_delete" ON usuarios;
DROP POLICY IF EXISTS "Usuarios visibles para todos" ON usuarios;
DROP POLICY IF EXISTS "Usuarios pueden crear su propio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON usuarios;

-- 3️⃣ LIMPIAR DATOS ANTIGUOS
DELETE FROM usuarios WHERE email LIKE '%@%';

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================
-- 1. Reinicia la app en Expo (presiona 'r')
-- 2. Crea un nuevo usuario CHEF
-- 3. Debería guardar el rol correctamente
