import Redis from "ioredis";

/**
 * Redis client for caching
 * Using Upstash Redis with TLS connection
 */
class RedisClient {
    private static instance: Redis | null = null;
    private static isInitialized = false;

    private constructor() { }

    /**
     * Get or create Redis client instance
     */
    public static getInstance(): Redis | null {
        if (!this.isInitialized) {
            this.initialize();
        }
        return this.instance;
    }

    /**
     * Initialize Redis connection
     */
    private static initialize(): void {
        this.isInitialized = true;

        const redisUrl = process.env.REDIS_URL;

        if (!redisUrl) {
            console.warn(
                "REDIS_URL environment variable is not set. Caching will be disabled."
            );
            return;
        }

        try {
            this.instance = new Redis(redisUrl, {
                maxRetriesPerRequest: 3,
                retryStrategy: (times: number) => {
                    // Exponential backoff with max delay of 2 seconds
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                reconnectOnError: (err: Error) => {
                    // Reconnect on READONLY errors (useful for Redis cluster)
                    const targetError = "READONLY";
                    if (err.message.includes(targetError)) {
                        return true;
                    }
                    return false;
                },
                // Enable offline queue to buffer commands when connection is lost
                enableOfflineQueue: true,
                // Connection timeout
                connectTimeout: 10000,
                // Enable keep-alive
                keepAlive: 30000,
                // TLS is handled automatically by the rediss:// protocol in the URL
            });

            // Handle connection events
            this.instance.on("connect", () => {
                console.log("✅ Redis connected successfully");
            });

            this.instance.on("ready", () => {
                console.log("✅ Redis ready to accept commands");
            });

            this.instance.on("error", (err: Error) => {
                console.error("❌ Redis error:", err.message);
            });

            this.instance.on("close", () => {
                console.warn("⚠️  Redis connection closed");
            });

            this.instance.on("reconnecting", (ms: number) => {
                console.log(`🔄 Redis reconnecting in ${ms}ms`);
            });
        } catch (error) {
            console.error("Failed to initialize Redis client:", error);
            this.instance = null;
        }
    }

    /**
     * Close Redis connection
     */
    public static async disconnect(): Promise<void> {
        if (this.instance) {
            await this.instance.quit();
            this.instance = null;
            this.isInitialized = false;
            console.log("Redis connection closed gracefully");
        }
    }

    /**
     * Check if Redis is available
     */
    public static isAvailable(): boolean {
        return this.instance !== null && this.instance.status === "ready";
    }
}

// Export singleton instance getter
export const getRedisClient = (): Redis | null => {
    return RedisClient.getInstance();
};

// Export disconnect function for cleanup
export const disconnectRedis = async (): Promise<void> => {
    await RedisClient.disconnect();
};

// Export availability check
export const isRedisAvailable = (): boolean => {
    return RedisClient.isAvailable();
};

// Default export
export default RedisClient;
