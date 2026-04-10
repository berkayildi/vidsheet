interface SectionHeaderProps {
  title: string;
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  disabled?: boolean;
}

export function SectionHeader({
  title,
  enabled,
  onToggle,
  disabled,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h3
        className="text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: "var(--text-dim)" }}
      >
        {title}
      </h3>
      {onToggle !== undefined && (
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onToggle(!enabled)}
          disabled={disabled}
          className="relative h-5 w-9 rounded-full transition-colors disabled:opacity-50"
          style={{
            background: enabled ? "var(--accent)" : "var(--bg-card)",
            border: `1px solid ${enabled ? "var(--accent)" : "var(--border-hover)"}`,
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          <span
            className="absolute top-0.5 left-0.5 h-3.5 w-3.5 rounded-full transition-transform"
            style={{
              background: enabled ? "#fff" : "var(--text-dim)",
              transform: enabled ? "translateX(16px)" : "translateX(0)",
            }}
          />
        </button>
      )}
    </div>
  );
}
