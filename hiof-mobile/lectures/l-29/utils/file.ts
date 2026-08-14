// utils/file.ts

// Could move this to utils, so it is not locked to providers.
import { asyncWrapper } from "@/providers/appwrite/lib";

import { File } from "expo-file-system";
import { z } from "zod";

const FileSchema = z.object({
  name: z.string(),
  type: z.string(),
  size: z.number(),
  uri: z.string(),
});

export type StorageFile = z.infer<typeof FileSchema>;

export const prepareFile = async (uri: string, name?: string) => {
  return asyncWrapper(async () => {
    const file = new File(uri);

    if (!file.exists) {
      throw new Error("Filen eksisterer ikke");
    }

    // The File class gives the MIME type directly through `type` (the Blob interface)
    return FileSchema.parseAsync({
      uri: file.uri,
      name: name || file.name,
      type: file.type,
      size: file.size,
    });
  });
};
