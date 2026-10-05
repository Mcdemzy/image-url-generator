export type MediaType = "image" | "video";
export type UploadStatus = "pending" | "uploading" | "done" | "error";

export interface QueueItem {
  id: string;
  file: File;
  mediaType: MediaType;
  previewUrl: string; // object URL for thumbnail
  status: UploadStatus;
  progress: number; // 0-100
  url?: string; // set when done
  error?: string; // set when error
}
