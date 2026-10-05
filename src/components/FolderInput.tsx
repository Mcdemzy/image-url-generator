interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

const FolderInput = ({ value, onChange, disabled }: Props) => {
  return (
    <div className="mb-3">
      <label
        htmlFor="folder-input"
        className="mb-1 block text-xs font-medium text-zinc-600"
      >
        Upload folder{" "}
        <span className="font-normal text-zinc-400">(optional)</span>
      </label>
      <div className="flex items-center rounded-md border border-zinc-200 bg-white focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
        <span className="pl-3 pr-1 font-mono text-xs text-zinc-400">/</span>
        <input
          id="folder-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="galleries/wedding-2026"
          spellCheck={false}
          autoComplete="off"
          className="w-full bg-transparent px-1 py-2 font-mono text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none disabled:opacity-50"
        />
      </div>
      <p className="mt-1 text-[11px] text-zinc-400">
        Nested paths allowed, e.g.{" "}
        <code className="font-mono">galleries/portfolio</code>
      </p>
    </div>
  );
};

export default FolderInput;
