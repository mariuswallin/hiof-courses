// providers/appwrite/index.ts

import type { Backend } from "../contract";
import { appwriteAuth } from "./auth";
import { appwriteTasks } from "./tasks";
import { appwriteFiles } from "./files";

export const appwriteBackend: Backend = {
  name: "appwrite",
  auth: appwriteAuth,
  tasks: appwriteTasks,
  files: appwriteFiles,
};
