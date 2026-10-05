export interface Toast {
  id: string;
  message: string;
  tone: "error" | "info";
}

interface Props {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const Toasts = ({ toasts, onDismiss }: Props) => {
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            "pointer-events-auto flex items-start gap-3 rounded-lg border px-3 py-2 text-sm shadow-sm",
            t.tone === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-zinc-200 bg-white text-zinc-800",
          ].join(" ")}
        >
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-xs font-medium opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toasts;
