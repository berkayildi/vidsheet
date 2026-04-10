import type { SourceMode } from "../types";

interface SourceTabsProps {
  mode: SourceMode;
  onChange: (mode: SourceMode) => void;
  disabled: boolean;
}

const tabs: { value: SourceMode; label: string }[] = [
  { value: "youtube", label: "YouTube" },
  { value: "x-feed", label: "X Feed" },
];

export function SourceTabs({ mode, onChange, disabled }: SourceTabsProps) {
  return (
    <div
      role="tablist"
      className="flex rounded-full p-0.5"
      style={{ background: "var(--bg-card)" }}
    >
      {tabs.map((tab) => {
        const active = mode === tab.value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(tab.value)}
            className="flex-1 cursor-pointer rounded-full py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: active ? "var(--accent)" : "transparent",
              color: active ? "#fff" : "var(--text-muted)",
            }}
            onMouseEnter={(e) => {
              if (!active && !disabled)
                e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              if (!active)
                e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
