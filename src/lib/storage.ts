import { supabase } from "@/integrations/supabase/client";

/**
 * Get a signed URL for a file in a private storage bucket.
 * Falls back to the raw path if signing fails.
 * URLs are valid for 1 hour by default.
 */
export async function getSignedStorageUrl(
  bucket: string,
  path: string,
  expiresIn = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  
  if (error || !data?.signedUrl) {
    console.warn(`Failed to create signed URL for ${bucket}/${path}:`, error);
    // Return a placeholder or the raw URL
    return `/placeholder.svg`;
  }
  
  return data.signedUrl;
}

/**
 * Extract the storage path from a full URL.
 * e.g. "https://xxx.supabase.co/storage/v1/object/public/photos/workplace-id/file.jpg"
 * → "workplace-id/file.jpg"
 */
export function extractStoragePath(fullUrl: string, bucket: string): string | null {
  // Try public URL pattern
  const publicPattern = `/storage/v1/object/public/${bucket}/`;
  let idx = fullUrl.indexOf(publicPattern);
  if (idx !== -1) {
    return decodeURIComponent(fullUrl.slice(idx + publicPattern.length));
  }
  
  // Try signed URL pattern  
  const signedPattern = `/storage/v1/object/sign/${bucket}/`;
  idx = fullUrl.indexOf(signedPattern);
  if (idx !== -1) {
    const pathWithParams = fullUrl.slice(idx + signedPattern.length);
    return decodeURIComponent(pathWithParams.split("?")[0]);
  }

  // Try just the bucket name as separator
  const bucketPattern = `/${bucket}/`;
  idx = fullUrl.indexOf(bucketPattern);
  if (idx !== -1) {
    return decodeURIComponent(fullUrl.slice(idx + bucketPattern.length).split("?")[0]);
  }
  
  return null;
}

/**
 * Upload a file to a workplace-scoped path and return the storage path (not URL).
 */
export async function uploadToWorkplaceBucket(
  bucket: string,
  workplaceId: string,
  file: File,
  customName?: string
): Promise<{ path: string; error: Error | null }> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const allowedImageTypes = ["jpg", "jpeg", "png", "webp"];
  const allowedDocTypes = ["pdf"];
  
  // Client-side file type validation
  if (bucket === "photos" || bucket === "camera-uploads") {
    if (!ext || !allowedImageTypes.includes(ext)) {
      return { path: "", error: new Error("Endast bilder (jpg, png, webp) är tillåtna") };
    }
  } else if (bucket === "documents") {
    if (!ext || ![...allowedImageTypes, ...allowedDocTypes].includes(ext)) {
      return { path: "", error: new Error("Endast bilder och PDF-filer är tillåtna") };
    }
  }

  // Client-side size validation (10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { path: "", error: new Error("Filen får vara max 10 MB") };
  }

  const fileName = customName || `${Date.now()}_${file.name}`;
  const path = `${workplaceId}/${fileName}`;
  
  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) {
    return { path: "", error: new Error(error.message) };
  }
  
  return { path, error: null };
}
