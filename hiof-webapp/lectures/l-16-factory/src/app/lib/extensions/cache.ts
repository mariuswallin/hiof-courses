// /app/lib/extensions/cache.ts

import { hash } from "ohash";
import type { Client } from "@/app/types/client";

interface CacheOptions {
  ttl?: number; // Seconds
  maxSize?: number;
  key?: string; // Optional key for specific cache
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Simple wrapper that adds caching functionality
 * Follows Open/Closed principle - no changes to existing code
 */
export function withCaching<T extends Client>(
  client: T,
  options: CacheOptions
): T & { clearCache: () => void } {
  const { key, ttl = 300, maxSize = 50 } = options; // 5 min default TTL
  const cache = new Map<string, CacheEntry<any>>();

  // Generate cache key based on request parameters
  const generateCacheKey = (method: string, params: any): string => {
    // Remove signal and other runtime values from cache key
    const { options: requestOptions, ...cacheableParams } = params;
    const { signal, ...cacheableOptions } = requestOptions || {};

    return hash({
      method,
      ...cacheableParams,
      options: cacheableOptions,
    });
  };

  // Check if cache entry is expired
  const isExpired = (entry: CacheEntry<any>): boolean => {
    return Date.now() - entry.timestamp > entry.ttl * 1000;
  };

  // Cleanup cache
  const cleanupCache = () => {
    // Remove expired entries
    for (const [key, entry] of cache.entries()) {
      if (isExpired(entry)) {
        cache.delete(key);
      }
    }

    // Limit cache size
    if (cache.size > maxSize) {
      const oldest = Array.from(cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)
        .slice(0, cache.size - maxSize);

      oldest.forEach(([key]) => cache.delete(key));
    }
  };

  // Wrap client methods [GET, POST, etc.]
  const wrappedClient = Object.keys(client).reduce((acc, methodName) => {
    const originalMethod = client[methodName as keyof T] as Function;

    acc[methodName] = async (params: any) => {
      // Only cache GET requests
      if (methodName.toLowerCase() !== "get") {
        return originalMethod(params);
      }

      const cacheKey = key ?? generateCacheKey(methodName, params);
      const cached = cache.get(cacheKey);

      // Cache hit — return the cached data
      if (cached && !isExpired(cached)) {
        console.log(`[CACHE HIT] ${cacheKey.slice(0, 50)}...`);
        return cached.data;
      }

      // Cache miss - fetch from API
      try {
        const result = await originalMethod(params);

        // Cache only successful results
        if (result.success) {
          cache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
            ttl,
          });

          cleanupCache();
          console.log(`[CACHE SET] ${cacheKey.slice(0, 50)}... (TTL: ${ttl}s)`);
        }

        return result;
      } catch (error) {
        console.log(`[CACHE MISS] Error fetching data`);
        throw error;
      }
    };

    return acc;
  }, {} as any);

  // Add cache management
  wrappedClient.clearCache = () => {
    cache.clear();
    console.log("[CACHE] Cache cleared");
  };

  return wrappedClient;
}
