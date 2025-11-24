import { getRedisClient, isRedisAvailable } from "@/lib/redis";
import { Redis } from "ioredis";

/**
 * Cache service for managing Redis cache operations
 * Implements cache-aside (lazy loading) pattern
 */
class CacheService {
    private redis: Redis | null;

    constructor() {
        this.redis = getRedisClient();
    }

    /**
     * Get value from cache
     */
    async get<T>(key: string): Promise<T | null> {
        if (!this.redis || !isRedisAvailable()) {
            return null;
        }

        try {
            const value = await this.redis.get(key);
            if (!value) {
                return null;
            }
            return JSON.parse(value) as T;
        } catch (error) {
            console.error(`Cache GET error for key "${key}":`, error);
            return null;
        }
    }

    /**
     * Set value in cache with optional TTL
     * @param key - Cache key
     * @param value - Value to cache
     * @param ttlSeconds - Time to live in seconds (default: 5 minutes)
     */
    async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<boolean> {
        if (!this.redis || !isRedisAvailable()) {
            return false;
        }

        try {
            const serialized = JSON.stringify(value);
            await this.redis.setex(key, ttlSeconds, serialized);
            return true;
        } catch (error) {
            console.error(`Cache SET error for key "${key}":`, error);
            return false;
        }
    }

    /**
     * Delete specific key from cache
     */
    async del(key: string): Promise<boolean> {
        if (!this.redis || !isRedisAvailable()) {
            return false;
        }

        try {
            await this.redis.del(key);
            return true;
        } catch (error) {
            console.error(`Cache DEL error for key "${key}":`, error);
            return false;
        }
    }

    /**
     * Delete multiple keys from cache
     */
    async delMany(keys: string[]): Promise<boolean> {
        if (!this.redis || !isRedisAvailable() || keys.length === 0) {
            return false;
        }

        try {
            await this.redis.del(...keys);
            return true;
        } catch (error) {
            console.error(`Cache DEL MANY error for keys:`, keys, error);
            return false;
        }
    }

    /**
     * Delete all keys matching a pattern
     * Uses SCAN for safe iteration in production
     */
    async delPattern(pattern: string): Promise<number> {
        if (!this.redis || !isRedisAvailable()) {
            return 0;
        }

        try {
            let deletedCount = 0;
            const stream = this.redis.scanStream({
                match: pattern,
                count: 100,
            });

            const keysToDelete: string[] = [];

            for await (const keys of stream) {
                if (keys.length > 0) {
                    keysToDelete.push(...keys);
                }
            }

            if (keysToDelete.length > 0) {
                deletedCount = await this.redis.del(...keysToDelete);
            }

            console.log(
                `Cache pattern deletion: "${pattern}" - ${deletedCount} keys deleted`
            );
            return deletedCount;
        } catch (error) {
            console.error(`Cache DEL PATTERN error for pattern "${pattern}":`, error);
            return 0;
        }
    }

    /**
     * Check if key exists in cache
     */
    async exists(key: string): Promise<boolean> {
        if (!this.redis || !isRedisAvailable()) {
            return false;
        }

        try {
            const result = await this.redis.exists(key);
            return result === 1;
        } catch (error) {
            console.error(`Cache EXISTS error for key "${key}":`, error);
            return false;
        }
    }

    /**
     * Get remaining TTL for a key in seconds
     */
    async ttl(key: string): Promise<number> {
        if (!this.redis || !isRedisAvailable()) {
            return -2; // Key doesn't exist
        }

        try {
            return await this.redis.ttl(key);
        } catch (error) {
            console.error(`Cache TTL error for key "${key}":`, error);
            return -2;
        }
    }

    /**
     * Increment a numeric value in cache
     */
    async increment(key: string, amount: number = 1): Promise<number | null> {
        if (!this.redis || !isRedisAvailable()) {
            return null;
        }

        try {
            return await this.redis.incrby(key, amount);
        } catch (error) {
            console.error(`Cache INCREMENT error for key "${key}":`, error);
            return null;
        }
    }

    /**
     * Decrement a numeric value in cache
     */
    async decrement(key: string, amount: number = 1): Promise<number | null> {
        if (!this.redis || !isRedisAvailable()) {
            return null;
        }

        try {
            return await this.redis.decrby(key, amount);
        } catch (error) {
            console.error(`Cache DECREMENT error for key "${key}":`, error);
            return null;
        }
    }

    /**
     * Get or set pattern: Get from cache or compute and cache if not found
     */
    async getOrSet<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttlSeconds: number = 300
    ): Promise<T> {
        // Try to get from cache first
        const cached = await this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        // If not in cache, fetch from source
        const value = await fetcher();

        // Cache the result (fire and forget)
        this.set(key, value, ttlSeconds).catch((error) => {
            console.error(`Failed to cache value for key "${key}":`, error);
        });

        return value;
    }

    /**
     * Clear all cache (use with caution)
     */
    async flushAll(): Promise<boolean> {
        if (!this.redis || !isRedisAvailable()) {
            return false;
        }

        try {
            await this.redis.flushall();
            console.log("✅ All cache cleared");
            return true;
        } catch (error) {
            console.error("Cache FLUSH ALL error:", error);
            return false;
        }
    }

    /**
     * Get cache statistics
     */
    async getStats(): Promise<{
        connected: boolean;
        keyCount: number | null;
        memoryUsage: string | null;
    }> {
        const connected = isRedisAvailable();

        if (!this.redis || !connected) {
            return {
                connected: false,
                keyCount: null,
                memoryUsage: null,
            };
        }

        try {
            const info = await this.redis.info("stats");
            const dbSize = await this.redis.dbsize();
            const memory = await this.redis.info("memory");

            // Parse memory usage
            const memoryMatch = memory.match(/used_memory_human:([^\r\n]+)/);
            const memoryUsage = memoryMatch ? memoryMatch[1] : null;

            return {
                connected: true,
                keyCount: dbSize,
                memoryUsage,
            };
        } catch (error) {
            console.error("Cache STATS error:", error);
            return {
                connected: true,
                keyCount: null,
                memoryUsage: null,
            };
        }
    }
}

// Export singleton instance
export const cacheService = new CacheService();

// Cache key builders for consistent key naming
export const CacheKeys = {
    // Post related keys
    post: (postId: string) => `post:${postId}`,
    postsFeed: (userId: string | undefined, cursor: string | null, limit: number) =>
        `posts:feed:${userId || "public"}:${cursor || "start"}:${limit}`,
    postLikeCount: (postId: string) => `post:${postId}:likes:count`,
    postCommentCount: (postId: string) => `post:${postId}:comments:count`,

    // Pattern matchers for bulk deletion
    patterns: {
        allPosts: "post:*",
        allFeeds: "posts:feed:*",
        userFeeds: (userId: string) => `posts:feed:${userId}:*`,
        postData: (postId: string) => `post:${postId}*`,
    },
};

export default cacheService;
