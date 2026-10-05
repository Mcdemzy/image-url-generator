import type { PersistedItem, QueueItem } from "../types";

const KEY = "iug.uploads.v1";
const MAX_PERSISTED = 200; // keep the log reasonable

export const loadPersisted = (): PersistedItem[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PersistedItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

export const savePersisted = (items: PersistedItem[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX_PERSISTED)));
  } catch {
    // quota exceeded or storage disabled — fail silently, not worth a toast
  }
};

// Merge persisted history with current in-memory queue (deduped by id)
export const toPersisted = (item: QueueItem): PersistedItem | null => {
  if (item.status !== "done" || !item.url) return null;
  return {
    id: item.id,
    fileName: item.file.name,
    mediaType: item.mediaType,
    size: item.file.size,
    url: item.url,
    folder: item.folder,
    uploadedAt: Date.now(),
  };
};
