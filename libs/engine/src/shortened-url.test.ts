import { describe, it, expect, beforeEach } from "vitest";
import { shortenedUrls, addUrl, generateShortCode, clearMaps } from "./shortened-url";

/**
 * Test Suite para la funcionalidad de acortamiento de URLs
 * Valida:
 * - Generación de códigos únicos
 * - Prevención de duplicados
 * - Almacenamiento correcto
 */
describe("URL Shortener", () => {
  // Limpiar el estado antes de cada test
  beforeEach(async () => {
    await clearMaps();
  });

  describe("generateShortCode()", () => {
    it("debe generar un código de 6 caracteres", async () => {
      const code = await generateShortCode();
      expect(code).toHaveLength(6);
    });

    it("debe generar solo caracteres alfanuméricos (a-z, A-Z, 0-9)", async () => {
      const code = await generateShortCode();
      expect(/^[a-zA-Z0-9]{6}$/.test(code)).toBe(true);
    });

    it("debe generar códigos diferentes en múltiples llamadas", async () => {
      const codes: string[] = [];
      for (let i = 0; i < 100; i++) {
        codes.push(await generateShortCode());
      }
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(100); // Todos únicos
    });

    it("debe garantizar unicidad incluso con muchas llamadas", async () => {
      const codes = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        const code = await generateShortCode();
        expect(codes.has(code)).toBe(false); // No debe repetir
        codes.add(code);
      }
      expect(codes.size).toBe(1000);
    });
  });

  describe("addUrl()", () => {
    it("debe agregar una URL al mapa y retornar un código", async () => {
      const url = "https://example.com";
      const code = await addUrl(url);

      expect(code).toBeDefined();
      expect(code).toHaveLength(6);
      expect(await shortenedUrls.get(code)).toBe(url);
    });

    it("debe retornar el mismo código si se agrega la misma URL dos veces (evitar duplicados)", async () => {
      const url = "https://example.com";
      const code1 = await addUrl(url);
      const code2 = await addUrl(url);

      expect(code1).toBe(code2);
      expect(await shortenedUrls.size()).toBe(1); // Solo una entrada
    });

    it("debe generar códigos diferentes para URLs diferentes", async () => {
      const url1 = "https://example1.com";
      const url2 = "https://example2.com";

      const code1 = await addUrl(url1);
      const code2 = await addUrl(url2);

      expect(code1).not.toBe(code2);
      expect(await shortenedUrls.size()).toBe(2);
    });

    it("debe almacenar múltiples URLs correctamente", async () => {
      const urls = [
        "https://google.com",
        "https://github.com",
        "https://stackoverflow.com",
        "https://twitter.com",
      ];
      const codes: string[] = [];
      for (const url of urls) codes.push(await addUrl(url));

      expect(codes).toHaveLength(4);
      expect(await shortenedUrls.size()).toBe(4);

      // Verificar que cada código mapea a su URL
      for (let index = 0; index < codes.length; index++) {
        expect(await shortenedUrls.get(codes[index]!)).toBe(urls[index]);
      }
    });

    it("debe manejar URLs con caracteres especiales", async () => {
      const url =
        "https://example.com/path?query=value&foo=bar#fragment";
      const code = await addUrl(url);

      expect(await shortenedUrls.get(code)).toBe(url);
    });

    it("debe ser insensible a URLs con protocolo/sin protocolo cuando son iguales", async () => {
      const url = "https://example.com";
      const code1 = await addUrl(url);
      const code2 = await addUrl(url);

      expect(code1).toBe(code2);
    });

    it("debe distinguir entre URLs de diferentes dominios", async () => {
      const url1 = "https://example.com/page";
      const url2 = "https://other.com/page"; // Mismo path, diferente dominio

      const code1 = await addUrl(url1);
      const code2 = await addUrl(url2);

      expect(code1).not.toBe(code2);
    });
  });

  describe("shortenedUrls Map", () => {
    it("debe mantener la consistencia entre operaciones múltiples", async () => {
      const testData = [
        { url: "https://test1.com", name: "test1" },
        { url: "https://test2.com", name: "test2" },
        { url: "https://test1.com", name: "test1-duplicate" },
      ];
      const codes: string[] = [];
      for (const item of testData) codes.push(await addUrl(item.url));

      // Debe tener solo 2 entradas (test1 es duplicado)
      expect(await shortenedUrls.size()).toBe(2);
      expect(codes[0]).toBe(codes[2]); // Mismo código para URL duplicada
      expect(codes[0]).not.toBe(codes[1]);
    });

    it("debe permitir recuperar URLs por código", async () => {
      const url = "https://mysite.com";
      const code = await addUrl(url);

      const retrievedUrl = await shortenedUrls.get(code);
      expect(retrievedUrl).toBe(url);
    });

    it("debe retornar undefined para códigos inexistentes", async () => {
      const nonexistentUrl = await shortenedUrls.get("INVALID");
      expect(nonexistentUrl).toBeUndefined();
    });
  });

  describe("Casos extremos", () => {
    it("debe manejar URLs muy largas", async () => {
      const longUrl = "https://example.com/" + "x".repeat(1000);
      const code = await addUrl(longUrl);

      expect(await shortenedUrls.get(code)).toBe(longUrl);
    });

    it("debe manejar URLs con emojis o caracteres Unicode", async () => {
      const urlWithEmoji = "https://example.com/🚀/test";
      const code = await addUrl(urlWithEmoji);

      expect(await shortenedUrls.get(code)).toBe(urlWithEmoji);
    });

    it("no debe permitir códigos duplicados incluso en operaciones concurrentes", async () => {
      const urls = Array.from({ length: 50 }, (_, i) => `https://url${i}.com`);

      // Simular operaciones "concurrentes"
      const promises = urls.map((url) => Promise.resolve(addUrl(url)));

      const codes = await Promise.all(promises as Promise<string>[]);
      const uniqueCodes = new Set(codes);

      expect(uniqueCodes.size).toBe(50); // Todos únicos
      expect(await shortenedUrls.size()).toBe(50);
    });
  });
});
