export function PoweredBy() {
  return (
    <div className="mt-auto pt-6">
      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-dim)" }}>
        <span>Powered by</span>
        <span
          className="rounded px-1.5 py-0.5"
          style={{ background: "rgba(251, 191, 146, 0.1)", color: "#fbbf94" }}
        >
          Claude
        </span>
        <span
          className="rounded px-1.5 py-0.5"
          style={{ background: "rgba(147, 197, 253, 0.1)", color: "#93c5fd" }}
        >
          Gemini
        </span>
      </div>
      <a
        href="https://github.com/berkayildi/mcp-content-pipeline"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block cursor-pointer text-xs transition-colors"
        style={{ color: "var(--text-ghost)" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "var(--accent-light)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "var(--text-ghost)")
        }
      >
        Built with mcp-content-pipeline
      </a>
    </div>
  );
}
