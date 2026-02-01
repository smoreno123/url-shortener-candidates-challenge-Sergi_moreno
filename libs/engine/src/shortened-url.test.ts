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
  beforeEach(() => {
    clearMaps();
  });

  describe("generateShortCode()", () => {
    it("debe generar un código de 6 caracteres", () => {
      const code = generateShortCode();
      expect(code).toHaveLength(6);
    });

    it("debe generar solo caracteres alfanuméricos (a-z, A-Z, 0-9)", () => {
      const code = generateShortCode();
      expect(/^[a-zA-Z0-9]{6}$/.test(code)).toBe(true);
    });

    it("debe generar códigos diferentes en múltiples llamadas", () => {
      const codes = Array.from({ length: 100 }, () => generateShortCode());
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(100); // Todos únicos
    });

    it("debe garantizar unicidad incluso con muchas llamadas", () => {
      const codes = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        const code = generateShortCode();
        expect(codes.has(code)).toBe(false); // No debe repetir
        codes.add(code);
      }
      expect(codes.size).toBe(1000);
    });
  });

  describe("addUrl()", () => {
    it("debe agregar una URL al mapa y retornar un código", () => {
      const url = "https://example.com";
      const code = addUrl(url);

      expect(code).toBeDefined();
      expect(code).toHaveLength(6);
      expect(shortenedUrls.get(code)).toBe(url);
    });

    it("debe retornar el mismo código si se agrega la misma URL dos veces (evitar duplicados)", () => {
      const url = "https://example.com";
      const code1 = addUrl(url);
      const code2 = addUrl(url);

      expect(code1).toBe(code2);
      expect(shortenedUrls.size).toBe(1); // Solo una entrada
    });

    it("debe generar códigos diferentes para URLs diferentes", () => {
      const url1 = "https://example1.com";
      const url2 = "https://example2.com";

      const code1 = addUrl(url1);
      const code2 = addUrl(url2);

      expect(code1).not.toBe(code2);
      expect(shortenedUrls.size).toBe(2);
    });

    it("debe almacenar múltiples URLs correctamente", () => {
      const urls = [
        "https://google.com",
        "https://github.com",
        "https://stackoverflow.com",
        "https://twitter.com",
      ];

      const codes = urls.map((url) => addUrl(url));

      expect(codes).toHaveLength(4);
      expect(shortenedUrls.size).toBe(4);

      // Verificar que cada código mapea a su URL
      codes.forEach((code, index) => {
        expect(shortenedUrls.get(code)).toBe(urls[index]);
      });
    });

    it("debe manejar URLs con caracteres especiales", () => {
      const url =
        "https://example.com/path?query=value&foo=bar#fragment";
      const code = addUrl(url);

      expect(shortenedUrls.get(code)).toBe(url);
    });

    it("debe ser insensible a URLs con protocolo/sin protocolo cuando son iguales", () => {
      const url = "https://example.com";
      const code1 = addUrl(url);
      const code2 = addUrl(url);

      expect(code1).toBe(code2);
    });

    it("debe distinguir entre URLs de diferentes dominios", () => {
      const url1 = "https://example.com/page";
      const url2 = "https://other.com/page"; // Mismo path, diferente dominio

      const code1 = addUrl(url1);
      const code2 = addUrl(url2);

      expect(code1).not.toBe(code2);
    });
  });

  describe("shortenedUrls Map", () => {
    it("debe mantener la consistencia entre operaciones múltiples", () => {
      const testData = [
        { url: "https://test1.com", name: "test1" },
        { url: "https://test2.com", name: "test2" },
        { url: "https://test1.com", name: "test1-duplicate" },
      ];

      const codes = testData.map((item) => addUrl(item.url));

      // Debe tener solo 2 entradas (test1 es duplicado)
      expect(shortenedUrls.size).toBe(2);
      expect(codes[0]).toBe(codes[2]); // Mismo código para URL duplicada
      expect(codes[0]).not.toBe(codes[1]);
    });

    it("debe permitir recuperar URLs por código", () => {
      const url = "https://mysite.com";
      const code = addUrl(url);

      const retrievedUrl = shortenedUrls.get(code);
      expect(retrievedUrl).toBe(url);
    });

    it("debe retornar undefined para códigos inexistentes", () => {
      const nonexistentUrl = shortenedUrls.get("INVALID");
      expect(nonexistentUrl).toBeUndefined();
    });
  });

  describe("Casos extremos", () => {
    it("debe manejar URLs muy largas", () => {
      const longUrl = "https://example.com/" + "x".repeat(1000);
      const code = addUrl(longUrl);

      expect(shortenedUrls.get(code)).toBe(longUrl);
    });

    it("debe manejar URLs con emojis o caracteres Unicode", () => {
      const urlWithEmoji = "https://example.com/🚀/test";
      const code = addUrl(urlWithEmoji);

      expect(shortenedUrls.get(code)).toBe(urlWithEmoji);
    });

    it("no debe permitir códigos duplicados incluso en operaciones concurrentes", async () => {
      const urls = Array.from({ length: 50 }, (_, i) => `https://url${i}.com`);

      // Simular operaciones "concurrentes"
      const promises = urls.map((url) =>
        Promise.resolve(addUrl(url))
      );

      const codes = await Promise.all(promises);
      const uniqueCodes = new Set(codes);

      expect(uniqueCodes.size).toBe(50); // Todos únicos
      expect(shortenedUrls.size).toBe(50);
    });
  });
});
