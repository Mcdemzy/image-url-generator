import { useState } from "react";
import type { QueueItem } from "../types";
import { formatBytes } from "../lib/constants";

interface Props {
  item: QueueItem;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

const StatusPill = ({ item }: { item: QueueItem }) => {
  const base =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium";
  if (item.status === "pending")
    return <span className={`${base} bg-zinc-100 text-zinc-600`}>Queued</span>;
  if (item.status === "uploading")
    return (
      <span className={`${base} bg-blue-50 text-blue-700`}>
        {Math.round(item.progress)}%
      </span>
    );
  if (item.status === "done")
    return (
      <span className={`${base} bg-emerald-50 text-emerald-700`}>Ready</span>
    );
  return <span className={`${base} bg-red-50 text-red-700`}>Failed</span>;
};

const QueueItemRow = ({ item, onRemove, onRetry }: Props) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!item.url) return;
    await navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  // Persisted items (from a previous session) have a stub File with no
  // content. Retrying them would upload an empty file, so we hide the button.
  const canRetry = Boolean(item.file.type);

  return (
    <li className="flex gap-3 border-b border-zinc-100 px-4 py-3 last:border-b-0">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-zinc-100">
        {item.mediaType === "image" ? (
          <img
            src={item.previewUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <video
            src={item.previewUrl}
            className="h-full w-full object-cover"
            muted
            playsInline
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-zinc-900">
            {item.file.name}
          </p>
          <StatusPill item={item} />
        </div>
        <p className="mt-0.5 text-xs text-zinc-500">
          {formatBytes(item.file.size)}
        </p>

        {item.status === "uploading" && (
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full bg-emerald-500 transition-[width] duration-200"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        )}

        {item.status === "done" && item.url && (
          <div className="mt-2 flex items-center gap-2">
            <input
              readOnly
              value={item.url}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 truncate rounded border border-zinc-200 bg-zinc-50 px-2 py-1 font-mono text-[11px] text-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              onClick={copy}
              className="shrink-0 rounded border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}

        {item.status === "error" && (
          <div className="mt-1 flex items-center gap-2">
            <p className="flex-1 text-xs text-red-600">
              {item.error ?? "Upload failed"}
            </p>
            {canRetry && (
              <button
                onClick={() => onRetry(item.id)}
                className="shrink-0 rounded border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => onRemove(item.id)}
        aria-label="Remove"
        className="h-6 w-6 shrink-0 self-start rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
      >
        ×
      </button>
    </li>
  );
};

export default QueueItemRow;
