interface EmptyStateProps {
  label: string;
}

export function EmptyState({ label }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed"
        style={{ borderColor: "var(--text-ghost)" }}
      >
        <div
          className="h-5 w-5 rounded"
          style={{ background: "var(--bg-tertiary)" }}
        />
      </div>
      <p className="text-center text-sm" style={{ color: "var(--text-ghost)" }}>
        {label}
      </p>
    </div>
  );
}
