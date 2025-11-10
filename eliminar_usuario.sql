-- ============================================
-- ELIMINAR UN USUARIO ESPECÍFICO
-- ============================================
-- Este script elimina un usuario de la tabla 'usuarios'
-- y también de Supabase Auth

-- ⚠️ IMPORTANTE: Reemplaza 'correo@ejemplo.com' con el email real del usuario

-- 1️⃣ OBTENER EL ID DEL USUARIO POR EMAIL
-- Ejecuta esto primero para obtener el ID
SELECT id, email, rol FROM usuarios WHERE email = 'correo@ejemplo.com';

-- 2️⃣ ELIMINAR RECETAS DEL USUARIO (si es chef)
-- Reemplaza 'tu-id-aqui' con el ID obtenido arriba
DELETE FROM recetas WHERE chef_id = 'tu-id-aqui';

-- 3️⃣ ELIMINAR EL USUARIO DE LA TABLA USUARIOS
DELETE FROM usuarios WHERE id = 'tu-id-aqui';

-- 4️⃣ ELIMINAR DE SUPABASE AUTH (desde el Dashboard)
-- ⚠️ Esto NO se puede hacer con SQL directo
-- Debes ir a: Dashboard → Authentication → Users
-- Y eliminar el usuario manualmente desde allí

-- ============================================
-- ALTERNATIVA: Si quieres eliminar TODO de un usuario
-- ============================================
-- Usa este script si quieres borrar completamente a un usuario
-- y todas sus recetas

-- Paso 1: Obtén el email del usuario a eliminar
-- SELECT id, email, rol FROM usuarios WHERE email = 'tu-email-aqui';

-- Paso 2: Copia el ID y ejecuta esto:
-- DELETE FROM recetas WHERE chef_id = 'ID-DEL-USUARIO';
-- DELETE FROM usuarios WHERE id = 'ID-DEL-USUARIO';

-- Paso 3: Ve al Dashboard de Supabase → Authentication → Users
-- y elimina el usuario de Auth manualmente

-- ============================================
-- EJEMPLO PRÁCTICO
-- ============================================
-- Si quieres eliminar al usuario con email 'juan@email.com':
-- 
-- 1. SELECT id, email, rol FROM usuarios WHERE email = 'juan@email.com';
--    Result: id = '12345-67890-abcde-fghij'
--
-- 2. DELETE FROM recetas WHERE chef_id = '12345-67890-abcde-fghij';
--
-- 3. DELETE FROM usuarios WHERE id = '12345-67890-abcde-fghij';
--
-- 4. Ve al Dashboard → Authentication → Users y elimina 'juan@email.com'

-- ============================================
-- ✅ PASOS COMPLETOS
-- ============================================
-- 1. Abre tu Dashboard de Supabase
-- 2. Ve a SQL Editor
-- 3. Ejecuta este query para obtener el ID:
--    SELECT id, email, rol FROM usuarios WHERE email = 'correo@ejemplo.com';
-- 4. Copia el ID que aparece
-- 5. Ejecuta los DELETEs reemplazando 'tu-id-aqui' con el ID copiado
-- 6. Después ve a Authentication → Users y elimina el usuario de Auth
