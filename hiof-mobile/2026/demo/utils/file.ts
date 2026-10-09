// utils/file.ts
//
// Turns a local file uri into the descriptor Appwrite's createFile expects.
//
// The size matters. The SDK looks at it to decide whether to send the file in
// one request or in chunks, so a hardcoded value would break large uploads.
// expo-file-system's File class reads the real name, type and size off disk.

import { File } from "expo-file-system";
import { z } from "zod";

const StorageFileSchema = z.object({
  name: z.string(),
  type: z.string(),
  size: z.number(),
  uri: z.string(),
});

export type StorageFile = z.infer<typeof StorageFileSchema>;

/** Reads a local uri and returns what createFile needs, or throws. */
export function prepareFile(uri: string): StorageFile {
  const file = new File(uri);

  if (!file.exists) {
    throw new Error("Filen finnes ikke");
  }

  return StorageFileSchema.parse({
    uri: file.uri,
    name: file.name,
    type: file.type,
    size: file.size,
  });
}
