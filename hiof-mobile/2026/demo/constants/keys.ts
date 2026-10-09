// constants/keys.ts
//
// All environment variables in one place. Expo only exposes variables prefixed
// with EXPO_PUBLIC_ to the app bundle, which also means they are readable by
// anyone with the app. Nothing secret belongs here.

export const APPWRITE_KEYS = {
  API_URL: process.env.EXPO_PUBLIC_API_URL,
  PROJECT_ID: process.env.EXPO_PUBLIC_PROJECT_ID,
  PLATFORM_ID: process.env.EXPO_PUBLIC_PLATFORM_ID,
  DATABASE_ID: process.env.EXPO_PUBLIC_DATABASE_ID,
  TASKS_TABLE_ID: process.env.EXPO_PUBLIC_TASKS_TABLE_ID,
  BUCKET_ID: process.env.EXPO_PUBLIC_BUCKET_ID,
};

/**
 * Whether the app has enough configuration to talk to Appwrite.
 *
 * When this is false, providers/index.ts falls back to the in-memory mock so
 * the app still runs. That is what lets you clone the repo and see something
 * without setting up a backend first.
 */
export const hasAppwriteConfig = Boolean(
  APPWRITE_KEYS.API_URL &&
    APPWRITE_KEYS.PROJECT_ID &&
    APPWRITE_KEYS.DATABASE_ID &&
    APPWRITE_KEYS.TASKS_TABLE_ID,
);
