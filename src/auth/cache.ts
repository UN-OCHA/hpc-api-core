/**
 * Lightweight in-memory cache to speed-up authorization processes.
 *
 * TODO: extend this with some cross-container cache such as redis or memcached
 */

import { createHash } from 'node:crypto';

const sha256 = (str: string) => createHash('sha256').update(str).digest('hex');

type CachedValue<T> = {
  value: T;
  time: Date;
};

export class HashTableCache<V> {
  /**
   * The number of milliseconds a value should remain valid for
   */
  private readonly cacheItemLifetimeMs: number;

  private map = new Map<string, CachedValue<V>>();

  constructor(opts: { cacheItemLifetimeMs: number }) {
    this.cacheItemLifetimeMs = opts.cacheItemLifetimeMs;
  }

  public store = (key: string, value: V, cacheTime?: Date): void => {
    this.map.set(sha256(key), {
      value,
      time: cacheTime ?? new Date(),
    });
    this.clearExpiredValues();
  };

  public get = (key: string): V | null => {
    const item = this.map.get(sha256(key));
    if (item && item.time.getTime() + this.cacheItemLifetimeMs > Date.now()) {
      return item.value;
    }
    return null;
  };

  public clearExpiredValues = (): void => {
    const now = Date.now();
    for (const [key, item] of this.map.entries()) {
      if (item.time.getTime() + this.cacheItemLifetimeMs < now) {
        this.map.delete(key);
      }
    }
  };

  public clear = (): void => this.map.clear();

  public size = (): number => this.map.size;
}
