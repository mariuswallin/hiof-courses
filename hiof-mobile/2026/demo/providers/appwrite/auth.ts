// providers/appwrite/auth.ts

import { ID } from "react-native-appwrite";
import { account } from "./client";
import { asyncWrapper } from "../lib";
import type { AuthProviderApi } from "../contract";
import { CredentialsSchema, RegisterSchema, type User } from "@/types";

/** Appwrite returns $id; the rest of the app only knows `id`. */
function toUser(raw: { $id: string; name: string; email: string }): User {
  return { id: raw.$id, name: raw.name, email: raw.email };
}

export const appwriteAuth: AuthProviderApi = {
  async register(input) {
    return asyncWrapper(async () => {
      const parsed = RegisterSchema.parse(input);
      await account.create({
        userId: ID.unique(),
        email: parsed.email,
        password: parsed.password,
        name: parsed.name,
      });
      // Creating an account does not sign you in, so log in right after.
      await account.createEmailPasswordSession({
        email: parsed.email,
        password: parsed.password,
      });
      return toUser(await account.get());
    });
  },

  async login(input) {
    return asyncWrapper(async () => {
      const parsed = CredentialsSchema.parse(input);
      await account.createEmailPasswordSession({
        email: parsed.email,
        password: parsed.password,
      });
      return toUser(await account.get());
    });
  },

  async logout() {
    return asyncWrapper(async () => {
      await account.deleteSession({ sessionId: "current" });
      return null;
    });
  },

  async currentUser() {
    // A missing session is a normal state, not an error, so this returns
    // Result<User | null> rather than failing when nobody is signed in.
    try {
      return { success: true, data: toUser(await account.get()) };
    } catch {
      return { success: true, data: null };
    }
  },
};
