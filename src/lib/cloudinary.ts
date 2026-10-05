import type { QueueItem } from "../types";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUD_NAME || !UPLOAD_PRESET) {
  throw new Error(
    "Missing VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET in .env",
  );
}

/**
 * Uploads a file to Cloudinary using an unsigned upload preset.
 * Uses XHR (not fetch) because we want real upload progress events.
 */
export const cloudinaryUpload = (
  item: QueueItem,
  onProgress: (pct: number) => void,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const resource = item.mediaType === "video" ? "video" : "image";
    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resource}/upload`;

    const form = new FormData();
    form.append("file", item.file);
    form.append("upload_preset", UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      // Cap at 99 so the bar doesn't hit 100% before the server responds
      onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as {
            secure_url?: string;
            url?: string;
            error?: { message?: string };
          };
          if (data.error) {
            reject(new Error(data.error.message ?? "Cloudinary error"));
            return;
          }
          const url = data.secure_url ?? data.url;
          if (!url) {
            reject(new Error("Cloudinary response missing URL"));
            return;
          }
          onProgress(100);
          resolve(url);
        } catch {
          reject(new Error("Failed to parse Cloudinary response"));
        }
      } else {
        // Cloudinary returns JSON errors even on non-2xx
        try {
          const err = JSON.parse(xhr.responseText) as {
            error?: { message?: string };
          };
          reject(
            new Error(err.error?.message ?? `Upload failed (${xhr.status})`),
          );
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));
    xhr.ontimeout = () => reject(new Error("Upload timed out"));

    xhr.send(form);
  });
};
