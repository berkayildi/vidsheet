export function Header() {
  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-3"
      style={{
        borderColor: 'var(--border)',
        background: 'rgba(12, 12, 15, 0.8)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="24"
          height="24"
        >
          <defs>
            <linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
          </defs>
          <rect
            x="6"
            y="2"
            width="18"
            height="24"
            rx="2"
            fill="none"
            stroke="url(#hg)"
            strokeWidth="2"
          />
          <line
            x1="10"
            y1="8"
            x2="20"
            y2="8"
            stroke="url(#hg)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="10"
            y1="12"
            x2="18"
            y2="12"
            stroke="url(#hg)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <polygon points="11,19 11,29 22,24" fill="url(#hg)" />
        </svg>
        <span
          className="text-lg font-semibold"
          style={{
            fontFamily: 'var(--font-sans)',
            color: 'var(--text-primary)',
          }}
        >
          FeedShot
        </span>
        <span
          className="rounded px-1.5 py-0.5 text-[10px]"
          style={{
            fontFamily: 'var(--font-mono)',
            background: 'var(--bg-card)',
            color: 'var(--text-dim)',
          }}
        >
          v0.5.0 {/* TODO: fetch from /api/health at runtime */}
        </span>
      </div>
      <a
        href="https://github.com/berkayildi/feedshot"
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer text-sm transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = 'var(--accent-light)')
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = 'var(--text-muted)')
        }
      >
        GitHub
      </a>
    </header>
  );
}
