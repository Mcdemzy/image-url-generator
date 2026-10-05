export const LIMITS = {
  image: { maxBytes: 10 * 1024 * 1024, label: "10 MB" },
  video: { maxBytes: 100 * 1024 * 1024, label: "100 MB" },
  maxItems: 20,
} as const;

export const ACCEPTED = "image/*,video/*";

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
