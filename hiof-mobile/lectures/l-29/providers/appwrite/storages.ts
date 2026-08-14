// providers/appwrite/storages.ts

import { AppwriteException, ID } from "react-native-appwrite";
import { storages } from ".";
import { APPWRITE_KEYS } from "@/constants/keys";
import type { Result } from "./types";
import { asyncWrapper } from "./lib";

import { prepareFile, type StorageFile } from "@/utils/file";

const BUCKET_ID = "images";

export const uploadImage = async (
  file: StorageFile,
): Promise<Result<string>> => {
  return asyncWrapper(async () => {
    const maxSize = 2 * 1024 * 1024;
    const allowedTypes = ["image/jpeg", "image/png"];

    console.log("Uploading file:", file.name, file.size, file.type);

    if (file.size > maxSize) {
      throw new AppwriteException(
        `Filen er for stor. Max størrelse: ${maxSize / 1024 / 1024}MB`,
      );
    }
    if (!allowedTypes.includes(file.type)) {
      throw new AppwriteException(
        `Filtype ikke tillatt. Tillatte typer: ${allowedTypes.join(", ")}`,
      );
    }

    const response = await storages.createFile({
      bucketId: BUCKET_ID,
      fileId: ID.unique(),
      file,
    });
    console.log("File uploaded:", response);

    const fileViewResult = await getImageHref(response.$id);

    if (!fileViewResult.success) return fileViewResult.error;

    return fileViewResult.data;
  });
};

export const getImageHref = async (fileId: string): Promise<Result<string>> => {
  return asyncWrapper(async () => {
    return `${APPWRITE_KEYS.API_URL}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${APPWRITE_KEYS.PROJECT_ID}`;
  });
};

export const handleFileUpload = async (uri?: string | null) => {
  return asyncWrapper(async () => {
    if (!uri) {
      throw new AppwriteException("Ingen fil valgt");
    }
    const preparedFile = await prepareFile(uri);

    if (!preparedFile.success) {
      throw new AppwriteException(preparedFile.error);
    }

    const { data: file } = preparedFile;

    console.log("Prepared file for upload:", file);

    const uploadResult = await uploadImage(file);

    if (!uploadResult.success) {
      throw new AppwriteException(uploadResult.error);
    }

    return uploadResult.data;
  });
};
