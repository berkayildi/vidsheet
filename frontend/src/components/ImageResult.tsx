import type { GenerateImageResponse } from "../types";

interface ImageResultProps {
  image: GenerateImageResponse;
}

export function ImageResult({ image }: ImageResultProps) {
  const dataUrl = `data:${image.mime_type};base64,${image.image_base64}`;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "infographic.png";
    link.click();
  };

  return (
    <div className="flex flex-col gap-3">
      <img
        src={dataUrl}
        alt="Generated infographic"
        className="w-full rounded-lg border"
        style={{ borderColor: "var(--border)" }}
      />
      <button
        onClick={handleDownload}
        className="flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-sm transition-colors"
        style={{
          borderColor: "var(--border-hover)",
          color: "var(--text-secondary)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.color = "var(--accent-light)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-hover)";
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download PNG
      </button>
      <p
        className="text-center text-[11px]"
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--text-dim)",
        }}
      >
        gemini-3.1-flash-image-preview / comic-book style
      </p>
    </div>
  );
}
