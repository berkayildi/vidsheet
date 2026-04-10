import { useState } from "react";
import type { XDigestResult as XDigestResultType } from "../types";

interface XDigestResultProps {
  digest: XDigestResultType;
}

export function XDigestResult({ digest }: XDigestResultProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const dateStr = new Date(digest.date_analysed).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className="text-xl font-semibold leading-snug"
            style={{ color: "var(--text-primary)" }}
          >
            {digest.title}
          </h3>
          <p
            className="mt-1 text-xs"
            style={{ color: "var(--text-dim)" }}
          >
            {dateStr}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {digest.accounts.map((account) => (
              <span
                key={account}
                className="rounded-full px-2 py-0.5 text-[11px]"
                style={{
                  background: "var(--accent-bg)",
                  color: "var(--accent-light)",
                }}
              >
                @{account}
              </span>
            ))}
          </div>
        </div>
        <span
          className="shrink-0 rounded px-2 py-0.5 text-[11px]"
          style={{
            fontFamily: "var(--font-mono)",
            background: "var(--bg-card)",
            color: "var(--text-dim)",
          }}
        >
          {digest.post_count} posts
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
          className="text-base leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {digest.tldr}
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
          {digest.key_takeaways.map((takeaway, i) => (
            <div
              key={i}
              className="rounded-lg border p-3"
              style={{
                borderColor: "var(--border)",
                background: "var(--bg-tertiary)",
              }}
            >
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {takeaway}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4
          className="mb-2 text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-dim)" }}
        >
          Notable Posts
        </h4>
        <div className="flex flex-col gap-2">
          {digest.notable_posts.map((post, i) => (
            <div
              key={i}
              className="rounded-lg border p-3"
              style={{
                borderColor: "var(--border)",
                background: "var(--bg-tertiary)",
              }}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--accent-light)" }}
                >
                  @{post.author_username}
                </span>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-xs transition-colors"
                  style={{ color: "var(--text-dim)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--accent-light)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--text-dim)")
                  }
                >
                  Open
                </a>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {post.text}
              </p>
              <p
                className="mt-1.5 text-xs italic"
                style={{ color: "var(--text-muted)" }}
              >
                {post.why_notable}
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
            onClick={() => copyText(digest.twitter_hook, "hook")}
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
          {digest.twitter_hook}
        </p>
      </div>
    </div>
  );
}
