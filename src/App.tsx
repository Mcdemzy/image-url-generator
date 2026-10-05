import { useCallback, useMemo, useRef, useState } from "react";
import DropZone from "./components/DropZone";
import QueueItemRow from "./components/QueueItemRow";
import OutputBar from "./components/OutputBar";
import Toasts, { type Toast } from "./components/Toasts";
import { LIMITS, formatBytes } from "./lib/constants";
import { cloudinaryUpload } from "./lib/cloudinary";
import type { MediaType, QueueItem } from "./types";

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const App = () => {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const pushToast = useCallback((message: string, tone: Toast["tone"]) => {
    const id = uid();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  }, []);

  const dismissToast = (id: string) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  const startUpload = useCallback(
    (id: string) => {
      const item = itemsRef.current.find((i) => i.id === id);
      if (!item) return;
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: "uploading", progress: 0 } : i,
        ),
      );
      cloudinaryUpload(item, (pct) => {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, progress: pct } : i)),
        );
      })
        .then((url) => {
          setItems((prev) =>
            prev.map((i) =>
              i.id === id ? { ...i, status: "done", progress: 100, url } : i,
            ),
          );
        })
        .catch((err: Error) => {
          setItems((prev) =>
            prev.map((i) =>
              i.id === id ? { ...i, status: "error", error: err.message } : i,
            ),
          );
          pushToast(`${item.file.name}: ${err.message}`, "error");
        });
    },
    [pushToast],
  );

  const handleFiles = useCallback(
    (incoming: File[]) => {
      const current = itemsRef.current;
      const room = LIMITS.maxItems - current.length;
      if (room <= 0) {
        pushToast(`Queue is full (max ${LIMITS.maxItems} files).`, "error");
        return;
      }

      const accepted: QueueItem[] = [];
      const rejected: string[] = [];

      for (const file of incoming.slice(0, room + 5)) {
        if (accepted.length >= room) {
          rejected.push(`${file.name}: queue full`);
          continue;
        }
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (!isImage && !isVideo) {
          rejected.push(`${file.name}: unsupported type`);
          continue;
        }

        const mediaType: MediaType = isVideo ? "video" : "image";
        const limit = LIMITS[mediaType];

        if (file.size > limit.maxBytes) {
          rejected.push(
            `${file.name}: ${formatBytes(file.size)} exceeds ${limit.label}`,
          );
          continue;
        }

        accepted.push({
          id: uid(),
          file,
          mediaType,
          previewUrl: URL.createObjectURL(file),
          status: "pending",
          progress: 0,
        });
      }

      if (rejected.length) {
        rejected.slice(0, 3).forEach((m) => pushToast(m, "error"));
        if (rejected.length > 3)
          pushToast(`+${rejected.length - 3} more rejected`, "error");
      }

      if (!accepted.length) return;

      setItems((prev) => [...prev, ...accepted]);
      // kick off uploads on next tick so state is committed
      accepted.forEach((i) => setTimeout(() => startUpload(i.id), 0));
    },
    [pushToast, startUpload],
  );

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const clearAll = () => {
    items.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    setItems([]);
  };

  const stats = useMemo(() => {
    const images = items.filter((i) => i.mediaType === "image").length;
    const videos = items.filter((i) => i.mediaType === "video").length;
    const bytes = items.reduce((s, i) => s + i.file.size, 0);
    return { images, videos, bytes };
  }, [items]);

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-sm font-semibold tracking-tight">
              Image URL Generator
            </h1>
            <p className="text-xs text-zinc-500">
              Upload to Cloudinary, get shareable links.
            </p>
          </div>
          {items.length > 0 && (
            <p className="text-xs text-zinc-500">
              {stats.images} img · {stats.videos} vid ·{" "}
              {formatBytes(stats.bytes)}
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <DropZone
          onFiles={handleFiles}
          disabled={items.length >= LIMITS.maxItems}
        />

        {items.length > 0 && (
          <ul className="mt-6 overflow-hidden rounded-lg border border-zinc-200 bg-white">
            {items.map((item) => (
              <QueueItemRow key={item.id} item={item} onRemove={removeItem} />
            ))}
          </ul>
        )}
      </main>

      <OutputBar items={items} onClear={clearAll} />
      <Toasts toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
