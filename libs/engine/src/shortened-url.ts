// Map que almacena los códigos cortos → URLs originales
// Estructura: {"abc123": "https://example.com", ...}
export const shortenedUrls: Map<string, string> = new Map();

// Mapa inverso para detectar duplicados: URLs originales → códigos cortos
// Permite verificar si una URL ya fue acortada y evitar duplicados
const urlToCode: Map<string, string> = new Map();

/**
 * Genera un código corto único y aleatorio
 * Usa caracteres alfanuméricos para evitar colisiones
 * 62^6 = 56 mil millones de combinaciones posibles
 */
export function generateShortCode(): string {
  // Definimos un conjunto de caracteres para el código corto más amplio (a-z, A-Z, 0-9)
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  // Longitud del código corto aumentada a 6 caracteres para evitar colisiones
  const length = 6;
  
  // Generar código único (evitar colisiones si ya existe)
  let code = "";
  do {
    code = "";
    for (let i = 0; i < length; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  } while (shortenedUrls.has(code)); // Si el código ya existe, regenerar
  
  return code;
}

/**
 * Limpia los mapas para pruebas (solo para testing)
 */
export function clearMaps(): void {
  shortenedUrls.clear();
  urlToCode.clear();
}

/**
 * Acorta una URL o retorna el código existente si ya fue acortada
 * Garantiza que no haya URLs duplicadas
 * @param url - URL original a acortar
 * @returns - Código corto único para esa URL
 */
export function addUrl(url: string): string {
  // Si la URL ya existe, retornar su código acortado (evitar duplicados)
  const existingCode = urlToCode.get(url);
  if (existingCode) {
    return existingCode;
  }
  
  // Generar nuevo código único
  const code = generateShortCode();
  
  // Guardar en ambos mapas para mantener consistencia
  shortenedUrls.set(code, url);    // Para redirecciones: código → URL
  urlToCode.set(url, code);        // Para detectar duplicados: URL → código
  
  return code;
}
