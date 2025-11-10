import { supabase } from "@/src/data/services/supabaseClient";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { Receta } from "../../models/Receta";

/**
 * RecipesUseCase - Caso de Uso de Recetas
 *
 * Gestiona toda la lógica de negocio de recetas:
 * - Listar recetas
 * - Buscar por ingrediente
 * - Crear, actualizar, eliminar
 * - Subir imágenes
 * - Seleccionar imagen de galería
 */

export class RecipesUseCase {
  /**
   * Obtener todas las recetas ordenadas por más recientes
   */
  async obtenerRecetas(): Promise<Receta[]> {
    const { data, error } = await supabase
      .from("recetas")
      .select("*")
      .order("created_at", { ascending: false }); // Más recientes primero

    if (error) {
      console.error("Error al obtener recetas:", error);
      return [];
    }

    return data as Receta[];
  }

  /**
   * Buscar recetas que contengan un ingrediente específico
   *
   * Usa el operador 'contains' de PostgreSQL para buscar en arrays
   *
   * @param ingrediente - Ingrediente a buscar
   */
  async buscarPorIngrediente(ingrediente: string): Promise<Receta[]> {
    const { data, error } = await supabase
      .from("recetas")
      .select("*")
      .contains("ingredientes", [ingrediente.toLowerCase()])
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error en búsqueda:", error);
      return [];
    }

    return data as Receta[];
  }

  /**
   * Crear nueva receta
   *
   * @param titulo - Título de la receta
   * @param descripcion - Descripción detallada
   * @param ingredientes - Array de ingredientes
   * @param chefId - ID del chef que la crea
   * @param imagenUri - URI local de la imagen (opcional)
   */
  async crearReceta(
    titulo: string,
    descripcion: string,
    ingredientes: string[],
    chefId: string,
    imagenUri?: string
  ) {
    try {
      let imagenUrl: string | null = null;

      // PASO 1: Subir imagen si existe
      if (imagenUri) {
        imagenUrl = await this.subirImagen(imagenUri);
      }

      // PASO 2: Insertar receta en base de datos
      const { data, error } = await supabase
        .from("recetas")
        .insert({
          titulo,
          descripcion,
          ingredientes,
          chef_id: chefId,
          imagen_url: imagenUrl,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Error de Supabase al crear receta:", error);
        throw error;
      }

      console.log("✅ Receta creada exitosamente:", data);
      return { success: true, receta: data };
    } catch (error: any) {
      console.error("❌ Error al crear receta:", error.message, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualizar receta existente
   *
   * @param id - ID de la receta
   * @param titulo - Nuevo título
   * @param descripcion - Nueva descripción
   * @param ingredientes - Nuevos ingredientes
   */
  async actualizarReceta(
    id: string,
    titulo: string,
    descripcion: string,
    ingredientes: string[]
  ) {
    try {
      const { data, error } = await supabase
        .from("recetas")
        .update({
          titulo,
          descripcion,
          ingredientes,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, receta: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Eliminar receta
   *
   * @param id - ID de la receta a eliminar
   */
  async eliminarReceta(id: string) {
    try {
      const { error } = await supabase.from("recetas").delete().eq("id", id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Subir imagen al Storage de Supabase
   *
   * PROCESO:
   * 1. Leer archivo de imagen usando expo-file-system
   * 2. Convertir base64 a Uint8Array
   * 3. Generar nombre único
   * 4. Subir a bucket "recetas-fotos"
   * 5. Obtener URL pública
   *
   * @param uri - URI local de la imagen (file://)
   * @returns URL pública de la imagen subida
   */
  private async subirImagen(uri: string): Promise<string> {
    try {
      console.log("📷 Iniciando carga de imagen:", uri);

      // PASO 1: Leer archivo como base64 usando expo-file-system
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });

      // PASO 2: Convertir base64 a Uint8Array
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // PASO 3: Generar nombre único
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

      console.log("📤 Subiendo archivo:", fileName);

      // PASO 4: Subir a Supabase Storage
      const { data, error } = await supabase.storage
        .from("recetas-fotos")
        .upload(fileName, bytes, {
          contentType: "image/jpeg",
          cacheControl: "3600",  // Cache de 1 hora
          upsert: false,         // No sobrescribir si existe
        });

      if (error) {
        console.error("❌ Error al subir archivo a Storage:", error);
        throw error;
      }

      console.log("✅ Archivo subido:", data.path);

      // PASO 5: Obtener URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("recetas-fotos").getPublicUrl(data.path);

      console.log("🔗 URL pública generada:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("❌ Error al subir imagen:", error);
      throw error;
    }
  }

  /**
   * Seleccionar imagen de la galería
   *
   * PROCESO:
   * 1. Pedir permisos de galería
   * 2. Abrir selector de imágenes
   * 3. Permitir edición (recorte)
   * 4. Retornar URI local
   */
  async seleccionarImagen(): Promise<string | null> {
    try {
      // PASO 1: Pedir permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        alert("Necesitamos permisos para acceder a tus fotos");
        return null;
      }

      // PASO 2: Abrir galería
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,  // Permitir recortar
        aspect: [4, 3],       // Proporción 4:3
        quality: 0.8,         // Calidad 80% (balance tamaño/calidad)
      });

      if (!result.canceled) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      return null;
    }
  }
}
