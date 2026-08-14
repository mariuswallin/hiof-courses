// src/app/lib/container.ts
//
// Small IoC container that shows the principle without pulling in
// tsyringe/Inversify/Awilix. For larger projects, prefer one of those
// libraries over a hand-rolled container.
//
// Usage:
//   const c = createContainer();
//   c.register("db", () => drizzle(env.DB, { schema }));
//   c.register("questionRepository", (c) => createQuestionRepository(c.resolve("db")));
//   c.register("questionService", (c) => createQuestionService(c.resolve("questionRepository")));
//   const service = c.resolve("questionService");

type Factory<T, R extends Registry = Registry> = (container: Container<R>) => T;

type Registry = Record<string, unknown>;

export interface Container<R extends Registry = Registry> {
  register<K extends string, T>(
    key: K,
    factory: Factory<T, R & Record<K, T>>
  ): Container<R & Record<K, T>>;
  resolve<K extends keyof R>(key: K): R[K];
}

export function createContainer<R extends Registry = {}>(): Container<R> {
  const factories = new Map<string, Factory<unknown>>();
  const instances = new Map<string, unknown>();

  const container: Container<R> = {
    register(key, factory) {
      factories.set(key, factory as Factory<unknown>);
      // Singleton: invalidate the previous cache if the key is registered again
      instances.delete(key);
      return container as Container<typeof container extends Container<infer X> ? X : never>;
    },
    resolve(key) {
      const stringKey = String(key);
      if (instances.has(stringKey)) {
        return instances.get(stringKey) as R[typeof key];
      }
      const factory = factories.get(stringKey);
      if (!factory) {
        throw new Error(`Container: ingen registrering for "${stringKey}"`);
      }
      const value = factory(container);
      instances.set(stringKey, value);
      return value as R[typeof key];
    },
  };

  return container;
}
