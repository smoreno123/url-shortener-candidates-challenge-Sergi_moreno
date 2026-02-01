// Simple Redis-like in-memory mock with async API
export class RedisMock {
  private store = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    const v = this.store.get(key);
    return v === undefined ? null : v;
  }

  async set(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async exists(key: string): Promise<number> {
    return this.store.has(key) ? 1 : 0;
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  // helper for tests
  async size(): Promise<number> {
    return this.store.size;
  }
}
