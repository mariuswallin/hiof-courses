// providers/appwrite/files.ts

import { AppwriteException, ID } from "react-native-appwrite";
import { storage } from "./client";
import { asyncWrapper } from "../lib";
import type { FilesProviderApi } from "../contract";
import { APPWRITE_KEYS } from "@/constants/keys";
import { prepareFile } from "@/utils/file";

const BUCKET_ID = APPWRITE_KEYS.BUCKET_ID ?? "";

// Checked here as well as in the bucket settings. The bucket is what actually
// enforces it; this just gives a readable error before spending the upload.
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

export const appwriteFiles: FilesProviderApi = {
  async upload(uri) {
    return asyncWrapper(async () => {
      // React Native has no File API from the browser, so the SDK takes a
      // descriptor with name, type, size and uri. prepareFile reads those off
      // disk rather than guessing them from the uri.
      const file = prepareFile(uri);

      if (file.size > MAX_SIZE) {
        throw new AppwriteException(
          `Bildet er for stort. Maks ${MAX_SIZE / 1024 / 1024} MB`,
          400,
        );
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new AppwriteException(
          `Filtypen ${file.type} er ikke tillatt. Bruk JPEG eller PNG`,
          400,
        );
      }

      const created = await storage.createFile({
        bucketId: BUCKET_ID,
        fileId: ID.unique(),
        file,
      });
      return created.$id;
    });
  },

  previewUrl(fileId) {
    if (!fileId) return null;
    // Built by hand rather than with getFileView, so the url can go straight
    // to expo-image without another round trip.
    return `${APPWRITE_KEYS.API_URL}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${APPWRITE_KEYS.PROJECT_ID}`;
  },

  async remove(fileId) {
    return asyncWrapper(async () => {
      await storage.deleteFile({ bucketId: BUCKET_ID, fileId });
      return null;
    });
  },
};
