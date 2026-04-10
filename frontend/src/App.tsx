import { useCallback, useState } from 'react';
import { AnalysisResult } from './components/AnalysisResult';
import { CostEstimate } from './components/CostEstimate';
import { EmptyState } from './components/EmptyState';
import { Header } from './components/Header';
import { ImageResult } from './components/ImageResult';
import { KeyInput } from './components/KeyInput';
import { LoadingSteps } from './components/LoadingSteps';
import { PoweredBy } from './components/PoweredBy';
import { SectionHeader } from './components/SectionHeader';
import { UrlInput } from './components/UrlInput';
import { usePipeline } from './hooks/usePipeline';

export function App() {
  const [anthropicKey, setAnthropicKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [supadataKey, setSupadataKey] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [generateImage, setGenerateImage] = useState(true);
  const pipeline = usePipeline();

  const isRunning =
    pipeline.state === 'analyzing' || pipeline.state === 'generating-image';

  const handleSubmit = useCallback(() => {
    if (
      !anthropicKey ||
      !supadataKey ||
      !youtubeUrl.trim() ||
      (generateImage && !geminiKey)
    )
      return;
    pipeline.run(
      youtubeUrl.trim(),
      anthropicKey,
      geminiKey,
      supadataKey,
      generateImage,
    );
  }, [
    anthropicKey,
    geminiKey,
    supadataKey,
    youtubeUrl,
    generateImage,
    pipeline,
  ]);

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: 'var(--bg-primary)' }}
    >
      <Header />
      <div className="main-grid flex-1">
        <aside className="sidebar flex flex-col gap-5 p-5">
          <div className="flex flex-col gap-2">
            <SectionHeader title="Transcript" />
            <KeyInput
              label="Supadata API Key"
              storageKey="supadata_api_key"
              value={supadataKey}
              onChange={useCallback((v: string) => setSupadataKey(v), [])}
              placeholder="sd_..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <SectionHeader title="Analysis" />
            <KeyInput
              label="Anthropic API Key"
              storageKey="anthropic_api_key"
              value={anthropicKey}
              onChange={useCallback((v: string) => setAnthropicKey(v), [])}
              placeholder="sk-ant-..."
            />
            <p
              className="text-[11px]"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-ghost)',
              }}
            >
              Claude claude-sonnet-4-20250514
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <SectionHeader
              title="Infographic"
              enabled={generateImage}
              onToggle={setGenerateImage}
              disabled={isRunning}
            />
            <div style={{ display: generateImage ? 'block' : 'none' }}>
              <KeyInput
                label="Google AI Studio API Key"
                storageKey="gemini_api_key"
                value={geminiKey}
                onChange={useCallback((v: string) => setGeminiKey(v), [])}
                placeholder="AI..."
              />
              <p
                className="mt-1 text-[11px]"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-ghost)',
                }}
              >
                gemini-3.1-flash-image-preview
              </p>
            </div>
          </div>

          <UrlInput
            value={youtubeUrl}
            onChange={setYoutubeUrl}
            onSubmit={handleSubmit}
            disabled={
              isRunning ||
              !anthropicKey ||
              !supadataKey ||
              (generateImage && !geminiKey)
            }
          />

          <LoadingSteps state={pipeline.state} generateImage={generateImage} />

          {pipeline.analysis && (
            <CostEstimate
              transcriptLength={pipeline.analysis.transcript_length}
              generatedImage={!!pipeline.image}
            />
          )}

          {pipeline.state === 'error' && pipeline.error && (
            <div
              className="rounded-lg border px-3 py-2.5 text-xs"
              style={{
                borderColor: 'rgba(127, 29, 29, 0.5)',
                background: 'rgba(127, 29, 29, 0.15)',
                color: '#f87171',
              }}
            >
              {pipeline.error}
            </div>
          )}

          {pipeline.state === 'complete' && (
            <button
              onClick={() => {
                pipeline.reset();
                setYoutubeUrl('');
              }}
              className="w-full cursor-pointer rounded-lg border py-2 text-sm transition-colors"
              style={{
                borderColor: 'var(--border-hover)',
                color: 'var(--text-muted)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.color = 'var(--accent-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-hover)';
                e.currentTarget.style.color = 'var(--text-muted)';
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
