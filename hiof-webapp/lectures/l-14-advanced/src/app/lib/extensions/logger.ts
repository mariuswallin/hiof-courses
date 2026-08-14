// /app/lib/extensions/logger.ts

import type { Client } from "@/app/types/client";

interface LoggingOptions {
  enabled?: boolean;
  prefix?: string;
}

/**
 * Wrapper that adds simple logging functionality
 * Follows Open/Closed principle - no changes to existing code
 */
export function withLogging<T extends Client>(
  client: T,
  options: LoggingOptions = {}
): T {
  const { enabled = true, prefix = "[API]" } = options;

  if (!enabled) return client;

  const wrappedClient = Object.keys(client).reduce((acc, methodName) => {
    const originalMethod = client[methodName as keyof T] as Function;

    acc[methodName] = async (params: any) => {
      console.log(
        `${prefix} ${methodName.toUpperCase()} ${params.url || "unknown"} `
      );

      try {
        const result = await originalMethod(params);
        console.log(`${prefix} [SUCCESS] ${methodName.toUpperCase()}  `);
        return result;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log(`${prefix} [ABORTED] ${methodName.toUpperCase()}  `);
        } else {
          console.error(
            `${prefix} [ERROR] ${methodName.toUpperCase()}  `,
            error
          );
        }

        throw error;
      }
    };

    return acc;
  }, {} as any);

  return wrappedClient;
}
