// providers/mock/index.ts
//
// In-memory backend, used when Appwrite is not configured. It exists so the app
// can be cloned and run without setting anything up, and so the tests have a
// backend that needs no network.
//
// Same contract as the Appwrite provider, so nothing above this layer knows
// which one it is talking to. The lectures use the same idea in
// l-30/constants/students.ts.

import type { Backend } from "../contract";
import type { Task, User } from "@/types";
import { TaskInputSchema, TaskPatchSchema } from "@/types";
import { handleError } from "../lib";

const DEMO_USER: User = {
  id: "demo-user",
  name: "Demobruker",
  email: "demo@hiof.no",
};

function seed(): Task[] {
  const day = 24 * 60 * 60 * 1000;
  return [
    {
      id: "1",
      name: "Lese kapittel om navigasjon",
      description: "Expo Router: stack, tabs og drawer",
      dueDate: new Date(Date.now() + day),
      completed: false,
      order: 0,
      imageId: null,
      userId: DEMO_USER.id,
    },
    {
      id: "2",
      name: "Sette opp Appwrite",
      description: "Database, tabell og bucket. Se APPWRITE.md",
      dueDate: new Date(Date.now() + 3 * day),
      completed: false,
      order: 1,
      imageId: null,
      userId: DEMO_USER.id,
    },
    {
      id: "3",
      name: "Skrive tester",
      description: "Vitest og React Native Testing Library",
      dueDate: new Date(Date.now() - day),
      completed: true,
      order: 2,
      imageId: null,
      userId: DEMO_USER.id,
    },
  ];
}

let tasks: Task[] = seed();
let signedIn = true;
let nextId = 4;

/** Empties and refills the store. Used between tests. */
export function resetMock(): void {
  tasks = seed();
  signedIn = true;
  nextId = 4;
}

const found = (id: string) => tasks.find((task) => task.id === id);

export const mockBackend: Backend = {
  name: "mock",

  auth: {
    async register(input) {
      signedIn = true;
      return { success: true, data: { ...DEMO_USER, name: input.name, email: input.email } };
    },
    async login(input) {
      signedIn = true;
      return { success: true, data: { ...DEMO_USER, email: input.email } };
    },
    async logout() {
      signedIn = false;
      return { success: true, data: null };
    },
    async currentUser() {
      return { success: true, data: signedIn ? DEMO_USER : null };
    },
  },

  tasks: {
    async list(userId) {
      const mine = tasks
        .filter((task) => task.userId === userId)
        .sort((a, b) => a.order - b.order);
      return { success: true, data: mine };
    },

    async getById(id) {
      const task = found(id);
      if (!task) return { success: false, error: "Ikke funnet" };
      return { success: true, data: task };
    },

    async create(userId, input) {
      try {
        const parsed = TaskInputSchema.parse(input);
        // Same MAX + 1 rule as the Appwrite provider, so both behave alike.
        const highest = tasks.reduce((max, task) => Math.max(max, task.order), -1);
        const task: Task = {
          ...parsed,
          id: String(nextId++),
          order: highest + 1,
          userId,
        };
        tasks = [...tasks, task];
        return { success: true, data: task };
      } catch (error) {
        return handleError(error);
      }
    },

    async update(id, patch) {
      try {
        const parsed = TaskPatchSchema.parse(patch);
        const task = found(id);
        if (!task) return { success: false, error: "Ikke funnet" };
        const updated = { ...task, ...parsed };
        tasks = tasks.map((t) => (t.id === id ? updated : t));
        return { success: true, data: updated };
      } catch (error) {
        return handleError(error);
      }
    },

    async remove(id) {
      const task = found(id);
      if (!task) return { success: false, error: "Ikke funnet" };
      tasks = tasks.filter((t) => t.id !== id);
      return { success: true, data: task };
    },

    async reorder(orderedIds) {
      // Check every id exists before writing anything, so a stale list from the
      // client cannot leave the store half reordered.
      const allExist = orderedIds.every((id) => found(id));
      if (!allExist) return { success: false, error: "Ikke funnet" };
      if (new Set(orderedIds).size !== orderedIds.length) {
        return { success: false, error: "Duplikate id-er" };
      }

      tasks = tasks.map((task) => {
        const index = orderedIds.indexOf(task.id);
        return index === -1 ? task : { ...task, order: index };
      });
      const sorted = [...tasks].sort((a, b) => a.order - b.order);
      return { success: true, data: sorted };
    },
  },

  files: {
    async upload(uri) {
      // Keeps the local uri as the "id", so the picture still renders.
      return { success: true, data: uri };
    },
    previewUrl(fileId) {
      return fileId;
    },
    async remove() {
      return { success: true, data: null };
    },
  },
};
