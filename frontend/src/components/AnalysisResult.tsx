import { useState } from "react";
import type { AnalysisResult as AnalysisResultType } from "../types";

interface AnalysisResultProps {
  analysis: AnalysisResultType;
}

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className="text-lg font-semibold leading-snug"
            style={{ color: "var(--text-primary)" }}
          >
            {analysis.video_title}
          </h3>
          <a
            href={analysis.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block cursor-pointer truncate text-xs transition-colors"
            style={{ color: "var(--text-dim)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--accent-light)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-dim)")
            }
          >
            {analysis.video_url}
          </a>
        </div>
        <span
          className="shrink-0 rounded px-2 py-0.5 text-[11px]"
          style={{
            fontFamily: "var(--font-mono)",
            background: "var(--bg-card)",
            color: "var(--text-dim)",
          }}
        >
          {analysis.transcript_length.toLocaleString()} chars
        </span>
      </div>

      <div
        className="rounded-lg border-l-[3px] p-3"
        style={{
          borderColor: "var(--accent)",
          background: "var(--bg-tertiary)",
        }}
      >
        <h4
          className="mb-1 text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-dim)" }}
        >
          TL;DR
        </h4>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {analysis.tldr}
        </p>
      </div>

      <div>
        <h4
          className="mb-2 text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-dim)" }}
        >
          Key Takeaways
        </h4>
        <div className="flex flex-col gap-2">
          {analysis.key_takeaways.map((takeaway, i) => (
            <div
              key={i}
              className="rounded-lg border p-3"
              style={{
                borderColor: "var(--border)",
                background: "var(--bg-tertiary)",
              }}
            >
              <h5
                className="mb-0.5 text-[13px] font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {takeaway.title}
              </h5>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {takeaway.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <h4
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-dim)" }}
          >
            Social Hook
          </h4>
          <button
            onClick={() => copyText(analysis.social_hook, "hook")}
            className="cursor-pointer rounded px-2 py-0.5 text-xs transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--accent-light)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-muted)")
            }
          >
            {copied === "hook" ? "Copied!" : "Copy"}
          </button>
        </div>
        <p
          className="rounded-lg p-3 text-sm italic"
          style={{
            background: "var(--accent-bg)",
            color: "var(--accent-light)",
          }}
        >
          {analysis.social_hook}
        </p>
      </div>
    </div>
  );
}
