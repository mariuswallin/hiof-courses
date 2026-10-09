// providers/appwrite/client.ts
//
// One Appwrite client, shared by auth, tasks and files.

import { Client, Account, TablesDB, Storage } from "react-native-appwrite";
import { APPWRITE_KEYS } from "@/constants/keys";

export const client = new Client();

client
  .setEndpoint(APPWRITE_KEYS.API_URL ?? "")
  .setProject(APPWRITE_KEYS.PROJECT_ID ?? "")
  .setPlatform(APPWRITE_KEYS.PLATFORM_ID ?? "");

export const account = new Account(client);
// TablesDB was added in Appwrite 1.8. The document methods on the older
// Databases service are marked deprecated since that version and point here
// instead. Collections became tables, documents became rows, attributes
// became columns.
export const tablesDB = new TablesDB(client);
export const storage = new Storage(client);
