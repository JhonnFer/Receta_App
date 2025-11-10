import { supabase } from "@/src/data/services/supabaseClient";
import { Usuario } from "../../models/Usuario";

/**
 * AuthUseCase - Caso de Uso de Autenticación
 *
 * Contiene toda la lógica de negocio relacionada con autenticación:
 * - Registro de usuarios
 * - Inicio de sesión
 * - Cierre de sesión
 * - Obtener usuario actual
 * - Escuchar cambios de autenticación
 *
 * Este UseCase es el "cerebro" de la autenticación.
 * Los componentes no hablan directamente con Supabase, sino con este UseCase.
 */

export class AuthUseCase {
  /**
   * Registrar nuevo usuario
   *
   * @param email - Email del usuario
   * @param password - Contraseña (mínimo 6 caracteres)
   * @param rol - Tipo de usuario: "chef" o "usuario"
   * @returns Objeto con success y datos o error
   */
  async registrar(email: string, password: string, rol: "chef" | "usuario") {
    try {
      console.log("📝 Registrando usuario:", { email, rol });

      // PASO 1: Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      // Verificar si hubo error
      if (authError) throw authError;
      if (!authData.user) throw new Error("No se pudo crear el usuario");

      console.log("✅ Usuario creado en Auth con ID:", authData.user.id);

      // PASO 2: Guardar información adicional en tabla usuarios
      // Usamos upsert (insert + update) para manejar casos donde el usuario ya existe
      const { data: userData, error: upsertError } = await supabase
        .from("usuarios")
        .upsert(
          {
            id: authData.user.id,    // Mismo ID que en Auth
            email: authData.user.email,
            rol: rol,                 // Chef o usuario
          },
          {
            onConflict: "id",         // Si el ID ya existe, actualiza
          }
        )
        .select();

      if (upsertError) {
        console.error("❌ Error al guardar usuario:", upsertError);
        throw upsertError;
      }

      console.log("✅ Usuario guardado en tabla 'usuarios':", userData);
      return { success: true, user: authData.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Iniciar sesión
   *
   * @param email - Email del usuario
   * @param password - Contraseña
   * @returns Objeto con success y datos o error
   */
  async iniciarSesion(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Cerrar sesión
   */
  async cerrarSesion() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener usuario actual con toda su información
   *
   * @returns Usuario completo o null si no hay sesión
   */
  async obtenerUsuarioActual(): Promise<Usuario | null> {
    try {
      // PASO 1: Obtener usuario de Auth
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      // PASO 2: Obtener información completa de tabla usuarios
      // Usamos .maybeSingle() en lugar de .single() para evitar error si no encuentra
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();  // Retorna el resultado o null (sin error)

      if (error) {
        console.error("❌ Error al obtener usuario de BD:", error);
        throw error;
      }

      if (!data) {
        console.log("⚠️ Usuario en Auth pero no en tabla usuarios:", user.id);
        return null;
      }

      console.log("✅ Usuario obtenido:", data);
      return data as Usuario;
    } catch (error) {
      console.error("❌ Error al obtener usuario:", error);
      return null;
    }
  }

  /**
   * Escuchar cambios de autenticación
   *
   * Esta función permite reaccionar en tiempo real cuando:
   * - Un usuario inicia sesión
   * - Un usuario cierra sesión
   * - El token expira y se refresca
   *
   * @param callback - Función que se ejecuta cuando hay cambios
   * @returns Suscripción que debe limpiarse al desmontar
   */
  onAuthStateChange(callback: (usuario: Usuario | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Hay sesión activa: obtener datos completos
        const usuario = await this.obtenerUsuarioActual();
        callback(usuario);
      } else {
        // No hay sesión: retornar null
        callback(null);
      }
    });
  }
}
