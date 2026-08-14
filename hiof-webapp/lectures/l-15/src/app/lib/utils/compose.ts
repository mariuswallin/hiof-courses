// app/lib/utils/compose.ts

/**
 * Pipe-function for left to right evaluation
 */
export function pipe<T>(...enhancers: Array<(client: T) => T>) {
  return (client: T): T => {
    return enhancers.reduce((acc, enhancer) => enhancer(acc), client);
  };
}

/**
 * Compose-function for right to left evaluation
 */
export function compose<T>(...enhancers: Array<(client: T) => T>) {
  return (client: T): T => {
    return enhancers.reduceRight((acc, enhancer) => enhancer(acc), client);
  };
}
