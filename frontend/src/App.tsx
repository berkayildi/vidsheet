import { useCallback, useState } from "react";
import { AnalysisResult } from "./components/AnalysisResult";
import { EmptyState } from "./components/EmptyState";
import { Header } from "./components/Header";
import { ImageResult } from "./components/ImageResult";
import { KeyInput } from "./components/KeyInput";
import { LoadingSteps } from "./components/LoadingSteps";
import { PoweredBy } from "./components/PoweredBy";
import { UrlInput } from "./components/UrlInput";
import { usePipeline } from "./hooks/usePipeline";

export function App() {
  const [anthropicKey, setAnthropicKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const pipeline = usePipeline();

  const isRunning =
    pipeline.state === "analyzing" || pipeline.state === "generating-image";

  const handleSubmit = useCallback(() => {
    if (!anthropicKey || !geminiKey || !youtubeUrl.trim()) return;
    pipeline.run(youtubeUrl.trim(), anthropicKey, geminiKey);
  }, [anthropicKey, geminiKey, youtubeUrl, pipeline]);

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg-primary)" }}>
      <Header />
      <div className="main-grid flex-1">
        <aside className="sidebar flex flex-col gap-4 p-5">
          <KeyInput
            label="Anthropic API Key"
            storageKey="anthropic_api_key"
            value={anthropicKey}
            onChange={useCallback((v: string) => setAnthropicKey(v), [])}
            placeholder="sk-ant-..."
          />
          <KeyInput
            label="Gemini API Key"
            storageKey="gemini_api_key"
            value={geminiKey}
            onChange={useCallback((v: string) => setGeminiKey(v), [])}
            placeholder="AI..."
          />
          <UrlInput
            value={youtubeUrl}
            onChange={setYoutubeUrl}
            onSubmit={handleSubmit}
            disabled={isRunning || !anthropicKey || !geminiKey}
          />

          <LoadingSteps state={pipeline.state} />

          {pipeline.state === "error" && pipeline.error && (
            <div
              className="rounded-lg border px-3 py-2.5 text-xs"
              style={{
                borderColor: "rgba(127, 29, 29, 0.5)",
                background: "rgba(127, 29, 29, 0.15)",
                color: "#f87171",
              }}
            >
              {pipeline.error}
            </div>
          )}

          {pipeline.state === "complete" && (
            <button
              onClick={() => {
                pipeline.reset();
                setYoutubeUrl("");
              }}
              className="w-full cursor-pointer rounded-lg border py-2 text-sm transition-colors"
              style={{
                borderColor: "var(--border-hover)",
                color: "var(--text-muted)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.color = "var(--accent-light)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-hover)";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              Analyze another video
            </button>
          )}

          <PoweredBy />
        </aside>

        <main className="col-analysis flex flex-col p-5">
          {pipeline.analysis ? (
            <AnalysisResult analysis={pipeline.analysis} />
          ) : (
            <EmptyState label="Analysis will appear here" />
          )}
        </main>

        <section className="col-image flex flex-col p-5">
          {pipeline.image ? (
            <ImageResult image={pipeline.image} />
          ) : (
            <EmptyState label="Infographic will appear here" />
          )}
        </section>
      </div>
    </div>
  );
}
