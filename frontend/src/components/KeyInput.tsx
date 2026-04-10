import { useEffect, useState } from "react";

interface KeyInputProps {
  label: string;
  storageKey: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function KeyInput({
  label,
  storageKey,
  value,
  onChange,
  placeholder,
}: KeyInputProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(storageKey);
    if (stored) onChange(stored);
  }, [storageKey, onChange]);

  const handleChange = (val: string) => {
    onChange(val);
    if (val) {
      sessionStorage.setItem(storageKey, val);
    } else {
      sessionStorage.removeItem(storageKey);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-xs font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="new-password"
          className="w-full rounded-lg border px-3 py-2 pr-14 text-[13px] outline-none transition-colors"
          style={{
            fontFamily: "var(--font-mono)",
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
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded px-1.5 py-0.5 text-[11px] transition-colors"
          style={{ color: "var(--text-dim)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--text-secondary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-dim)")
          }
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
