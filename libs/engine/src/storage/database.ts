// import { PrismaClient } from "@prisma/client";

// Lazy load Prisma client only if DATABASE_URL is configured
// let prisma: PrismaClient | null = null;

// function getPrismaClient(): PrismaClient | null {
//   if (!process.env.DATABASE_URL) {
//     console.warn(
//       "DATABASE_URL not set. Database persistence is disabled. URLs will only be stored in Redis mock."
//     );
//     return null;
//   }

//   if (!prisma) {
//     prisma = new PrismaClient();
//   }
//   return prisma;
// }

/**
 * Crea o actualiza un registro de URL acortada en Postgres
 * Guarda: código, URL original y timestamp de creación
 * (DESHABILITADO - Prisma comentado)
 */
export async function saveUrlToDatabase(
  code: string,
  url: string
): Promise<void> {
  // Database persistence disabled (Prisma not initialized)
  // URLs stored only in Redis mock
}

/**
 * Incrementa el contador de clicks para un código acortado
 * (DESHABILITADO - Prisma comentado)
 */
export async function incrementClickCount(code: string): Promise<number> {
  // Database persistence disabled (Prisma not initialized)
  return 0;
}

/**
 * Obtiene estadísticas de una URL acortada
 * (DESHABILITADO - Prisma comentado)
 */
export async function getUrlStats(code: string) {
  // Database persistence disabled (Prisma not initialized)
  return null;
}

/**
 * Obtiene todas las URLs acortadas con sus estadísticas
 * (DESHABILITADO - Prisma comentado)
 */
export async function getAllUrls() {
  // Database persistence disabled (Prisma not initialized)
  return [];
}

/**
 * Desconecta el cliente de Prisma
 * (DESHABILITADO - Prisma comentado)
 */
export async function disconnectDatabase(): Promise<void> {
  // Database persistence disabled (Prisma not initialized)
}
