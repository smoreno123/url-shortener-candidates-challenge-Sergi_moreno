import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Crea o actualiza un registro de URL acortada en Postgres
 * Guarda: código, URL original y timestamp de creación
 */
export async function saveUrlToDatabase(
  code: string,
  url: string
): Promise<void> {
  try {
    await prisma.shortenedUrl.upsert({
      where: { code },
      create: {
        code,
        url,
        clicks: 0,
      },
      update: {
        // Si ya existe, solo actualizar timestamp
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error(`Error saving URL to database: ${error}`);
    // No fallar la aplicación si la DB no está disponible
  }
}

/**
 * Incrementa el contador de clicks para un código acortado
 * Se llama cada vez que alguien accede a la URL redirigida
 */
export async function incrementClickCount(code: string): Promise<number> {
  try {
    const result = await prisma.shortenedUrl.update({
      where: { code },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });
    return result.clicks;
  } catch (error) {
    console.error(`Error incrementing clicks for code ${code}: ${error}`);
    return 0;
  }
}

/**
 * Obtiene estadísticas de una URL acortada
 */
export async function getUrlStats(code: string) {
  try {
    return await prisma.shortenedUrl.findUnique({
      where: { code },
    });
  } catch (error) {
    console.error(`Error fetching stats for code ${code}: ${error}`);
    return null;
  }
}

/**
 * Obtiene todas las URLs acortadas con sus estadísticas
 */
export async function getAllUrls() {
  try {
    return await prisma.shortenedUrl.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error(`Error fetching all URLs: ${error}`);
    return [];
  }
}

/**
 * Desconecta el cliente de Prisma
 * Útil para tests y graceful shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
