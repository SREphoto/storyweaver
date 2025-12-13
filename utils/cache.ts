type CacheEntry<T> = {
    value: T;
    expiresAt: number;
};

/**
 * Simple in‑memory LRU‑like cache with TTL.
 * For the scope of this project we keep it lightweight – a plain Map.
 * Keys are strings (e.g., a hash of the prompt) and values are generic.
 */
export class SimpleCache<T> {
    private store = new Map<string, CacheEntry<T>>();
    private ttlMs: number;

    constructor(ttlMs: number = 5 * 60 * 1000) { // default 5 minutes
        this.ttlMs = ttlMs;
    }

    get(key: string): T | undefined {
        const entry = this.store.get(key);
        if (!entry) return undefined;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return undefined;
        }
        return entry.value;
    }

    set(key: string, value: T, ttlMs?: number): void {
        const expiresAt = Date.now() + (ttlMs ?? this.ttlMs);
        this.store.set(key, { value, expiresAt });
    }

    clear(): void {
        this.store.clear();
    }
}
