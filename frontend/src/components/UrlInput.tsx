interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export function UrlInput({ value, onChange, onSubmit, disabled }: UrlInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !disabled && value.trim()) onSubmit();
        }}
        placeholder="https://www.youtube.com/watch?v=..."
        className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none transition-colors"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border)",
          color: "var(--text-primary)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
        }}
        disabled={disabled}
      />
      <button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        className="w-full cursor-pointer rounded-lg py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: "var(--accent)" }}
        onMouseEnter={(e) => {
          if (!e.currentTarget.disabled)
            e.currentTarget.style.background = "var(--accent-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--accent)";
        }}
      >
        Analyze
      </button>
    </div>
  );
}
