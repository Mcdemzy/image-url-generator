import { useState } from "react";
import type { QueueItem } from "../types";

type Format = "plain" | "markdown" | "html";

interface Props {
  items: QueueItem[];
  onClear: () => void;
}

const buildOutput = (urls: string[], format: Format) => {
  if (format === "plain") return urls.join("\n");
  if (format === "markdown") return urls.map((u) => `![](${u})`).join("\n");
  return urls.map((u) => `<img src="${u}" alt="" />`).join("\n");
};

const OutputBar = ({ items, onClear }: Props) => {
  const [format, setFormat] = useState<Format>("plain");
  const [copied, setCopied] = useState(false);

  const ready = items.filter((i) => i.status === "done" && i.url);
  if (!ready.length) return null;

  const copyAll = async () => {
    const urls = ready.map((i) => i.url!);
    await navigator.clipboard.writeText(buildOutput(urls, format));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const tabs: { id: Format; label: string }[] = [
    { id: "plain", label: "Plain" },
    { id: "markdown", label: "Markdown" },
    { id: "html", label: "HTML" },
  ];

  return (
    <div className="sticky bottom-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-4 py-3">
        <div className="flex rounded-md border border-zinc-200 p-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setFormat(t.id)}
              className={[
                "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                format === t.id
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:text-zinc-900",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-zinc-500">
          {ready.length} URL{ready.length === 1 ? "" : "s"} ready
        </span>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onClear}
            className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Clear all
          </button>
          <button
            onClick={copyAll}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
          >
            {copied ? "Copied!" : "Copy all URLs"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutputBar;
