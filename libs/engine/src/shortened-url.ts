// Map que almacena los códigos cortos → URLs originales
// Estructura: {"abc123": "https://example.com", ...}
import { RedisMock } from "./storage/redis-mock";
import { saveUrlToDatabase } from "./storage/database";

// Usamos dos "namespaces" simulados en Redis: código->url y url->código
const codeStore = new RedisMock();
const urlStore = new RedisMock();

// Exponer una API asíncrona parecida a un Map para compatibilidad con tests
export const shortenedUrls = {
  async get(code: string): Promise<string | undefined> {
    const v = await codeStore.get(code);
    return v === null ? undefined : v;
  },
  async set(code: string, url: string): Promise<void> {
    await codeStore.set(code, url);
  },
  async has(code: string): Promise<boolean> {
    return (await codeStore.exists(code)) === 1;
  },
  async size(): Promise<number> {
    return await codeStore.size();
  },
  async clear(): Promise<void> {
    await codeStore.clear();
  },
};

/**
 * Genera un código corto único y aleatorio (asíncrono)
 * Usa caracteres alfanuméricos para evitar colisiones
 */
export async function generateShortCode(): Promise<string> {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 6;

  let code = "";
  do {
    code = "";
    for (let i = 0; i < length; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  } while ((await codeStore.exists(code)) === 1);

  return code;
}

/**
 * Limpia los stores (solo para testing)
 */
export async function clearMaps(): Promise<void> {
  await codeStore.clear();
  await urlStore.clear();
}

/**
 * Acorta una URL o retorna el código existente si ya fue acortada
 * Garantiza que no haya URLs duplicadas
 * Persiste la URL y estadísticas en Postgres
 */
export async function addUrl(url: string): Promise<string> {
  const existingCode = await urlStore.get(url);
  if (existingCode) {
    return existingCode;
  }

  const code = await generateShortCode();
  await codeStore.set(code, url);
  await urlStore.set(url, code);
  
  // Guardar en Postgres para persistencia y estadísticas
  await saveUrlToDatabase(code, url);

  return code;
}

