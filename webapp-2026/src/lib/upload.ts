// src/lib/upload.ts — server-side validation + streaming upload to R2
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export type UploadError = { kind: "no-file" | "bad-type" | "too-large"; message: string };

// Loose adapter type so it accepts both a real R2Bucket and mocks in tests.
export type R2Like = {
  put: (key: string, body: any, opts?: any) => Promise<any>;
  delete: (key: string) => Promise<any>;
};

/**
 * Take one file from a multipart form, validate type and size, and stream it
 * to R2 under a unique key. Returns the key, or a typed error.
 * Streams (`file.stream()`) instead of `arrayBuffer()` — Workers have limited
 * memory per request.
 */
export async function storeUpload(
  r2: R2Like,
  formData: FormData,
  field: string,
  keyPrefix: string,
  ownerId: string,
): Promise<{ ok: true; key: string } | { ok: false; error: UploadError }> {
  const file = formData.get(field);
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: { kind: "no-file", message: "Ingen fil mottatt" } };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      ok: false,
      error: { kind: "bad-type", message: `Filtype ikke tillatt: ${file.type}` },
    };
  }
  if (file.size > MAX_SIZE) {
    return {
      ok: false,
      error: { kind: "too-large", message: "Filen er for stor (maks 5 MB)" },
    };
  }

  const extension = file.type.split("/")[1];
  // Unique key: two uploads never overwrite each other (cache busting).
  const key = `${keyPrefix}/${ownerId}-${Date.now()}.${extension}`;
  await r2.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });
  return { ok: true, key };
}

export { ALLOWED_TYPES, MAX_SIZE };
