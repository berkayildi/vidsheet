interface XFeedInputsProps {
  accounts: string;
  onAccountsChange: (value: string) => void;
  topics: string;
  onTopicsChange: (value: string) => void;
  hoursBack: number;
  onHoursBackChange: (value: number) => void;
  disabled: boolean;
}

const timeRangeOptions = [
  { label: "Last 24 hours", value: 24 },
  { label: "Last 48 hours", value: 48 },
  { label: "Last 7 days", value: 168 },
];

const inputStyle = {
  background: "var(--bg-card)",
  borderColor: "var(--border)",
  color: "var(--text-primary)",
};

export function XFeedInputs({
  accounts,
  onAccountsChange,
  topics,
  onTopicsChange,
  hoursBack,
  onHoursBackChange,
  disabled,
}: XFeedInputsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label
          className="text-xs font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          X Accounts
        </label>
        <input
          type="text"
          value={accounts}
          onChange={(e) => onAccountsChange(e.target.value)}
          placeholder="karpathy, garrytan, elvissun"
          disabled={disabled}
          className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none transition-colors disabled:opacity-50"
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          className="text-xs font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          Topics (optional)
        </label>
        <input
          type="text"
          value={topics}
          onChange={(e) => onTopicsChange(e.target.value)}
          placeholder="AI, tech"
          disabled={disabled}
          className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none transition-colors disabled:opacity-50"
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          className="text-xs font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          Time Range
        </label>
        <select
          value={hoursBack}
          onChange={(e) => onHoursBackChange(Number(e.target.value))}
          disabled={disabled}
          className="w-full cursor-pointer rounded-lg border px-3 py-2 text-[13px] outline-none transition-colors disabled:opacity-50"
          style={inputStyle}
        >
          {timeRangeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
