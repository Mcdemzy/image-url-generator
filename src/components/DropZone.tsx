import { useCallback, useRef, useState } from "react";
import { ACCEPTED, LIMITS } from "../lib/constants";

interface Props {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

const DropZone = ({ onFiles, disabled }: Props) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      onFiles(Array.from(fileList));
    },
    [onFiles],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled)
          inputRef.current?.click();
      }}
      aria-disabled={disabled}
      className={[
        "group relative flex w-full cursor-pointer flex-col items-center justify-center",
        "rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors",
        disabled
          ? "cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-60"
          : dragging
            ? "border-emerald-500 bg-emerald-50"
            : "border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <svg
        className="mb-3 h-8 w-8 text-zinc-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 16V4m0 0L7 9m5-5l5 5" />
        <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
      </svg>
      <p className="text-sm font-medium text-zinc-800">
        Drop files here or click to browse
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        Images up to {LIMITS.image.label} · Videos up to {LIMITS.video.label} ·{" "}
        {LIMITS.maxItems} files max
      </p>
    </div>
  );
};

export default DropZone;
