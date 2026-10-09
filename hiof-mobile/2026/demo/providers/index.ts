// providers/index.ts
//
// Picks the backend once, at import time.
//
// With Appwrite configured you get the real thing. Without it you get the
// in-memory mock, so the app still runs. Everything above this file imports
// from here and never has to know which one it got.

import { hasAppwriteConfig } from "@/constants/keys";
import { appwriteBackend } from "./appwrite";
import { mockBackend } from "./mock";
import type { Backend } from "./contract";

export const backend: Backend = hasAppwriteConfig ? appwriteBackend : mockBackend;

/** True when running on demo data. The UI shows a badge for this. */
export const isMockBackend = backend.name === "mock";

export type { Backend } from "./contract";
export type { Result } from "./types";
