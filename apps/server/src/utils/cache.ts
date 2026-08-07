export class CacheService {
  private cache = new Map<string, { value: any; expiry: number }>();

  /**
   * Set a value in the cache with a TTL (in milliseconds).
   */
  set(key: string, value: any, ttlMs: number = 60000): void {
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { value, expiry });
  }

  /**
   * Get a value from the cache. Returns null if missing or expired.
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * Delete a specific key from the cache.
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all items from the cache.
   */
  clear(): void {
    this.cache.clear();
  }
}

export const cacheService = new CacheService();
