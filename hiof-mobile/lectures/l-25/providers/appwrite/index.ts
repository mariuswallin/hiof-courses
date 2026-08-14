// providers/appwrite/index.ts

import { APPWRITE_KEYS } from "@/constants/keys";
import { Client, Account, TablesDB } from "react-native-appwrite";

// Set up the Appwrite client and the account used for authentication
export const client = new Client();

client
	.setEndpoint(APPWRITE_KEYS.API_URL) // API endpoint
	.setProject(APPWRITE_KEYS.PROJECT_ID)
	.setPlatform(APPWRITE_KEYS.PLATFORM_ID);

// Set up the Appwrite account API
export const account = new Account(client);
// TablesDB replaces the deprecated Databases service (Appwrite 1.8.0):
// collections → tables, documents → rows.
export const tablesDB = new TablesDB(client);
