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
import { SourceTabs } from './components/SourceTabs';
import { UrlInput } from './components/UrlInput';
import { XDigestResult } from './components/XDigestResult';
import { XFeedInputs } from './components/XFeedInputs';
import { usePipeline } from './hooks/usePipeline';
import { useXPipeline } from './hooks/useXPipeline';
import type { SourceMode } from './types';

export function App() {
  const [sourceMode, setSourceMode] = useState<SourceMode>('youtube');

  // Shared keys
  const [anthropicKey, setAnthropicKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [generateImage, setGenerateImage] = useState(true);

  // YouTube state
  const [supadataKey, setSupadataKey] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const ytPipeline = usePipeline();

  // X Feed state
  const [xBearerToken, setXBearerToken] = useState('');
  const [xAccounts, setXAccounts] = useState('');
  const [xTopics, setXTopics] = useState('AI, tech');
  const [xHoursBack, setXHoursBack] = useState(24);
  const xPipeline = useXPipeline();

  const activePipeline = sourceMode === 'youtube' ? ytPipeline : xPipeline;
  const isRunning =
    activePipeline.state === 'analyzing' ||
    activePipeline.state === 'generating-image';

  const handleSupadataChange = useCallback((v: string) => setSupadataKey(v), []);
  const handleAnthropicChange = useCallback(
    (v: string) => setAnthropicKey(v),
    [],
  );
  const handleGeminiChange = useCallback((v: string) => setGeminiKey(v), []);
  const handleXBearerChange = useCallback(
    (v: string) => setXBearerToken(v),
    [],
  );

  const handleModeChange = useCallback(
    (mode: SourceMode) => {
      if (mode === sourceMode) return;
      ytPipeline.reset();
      xPipeline.reset();
      setSourceMode(mode);
    },
    [sourceMode, ytPipeline, xPipeline],
  );

  const handleYoutubeSubmit = useCallback(() => {
    if (
      !anthropicKey ||
      !supadataKey ||
      !youtubeUrl.trim() ||
      (generateImage && !geminiKey)
    )
      return;
    ytPipeline.run(
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
    ytPipeline,
  ]);

  const handleXSubmit = useCallback(() => {
    const usernames = xAccounts
      .split(',')
      .map((u) => u.trim().replace(/^@/, ''))
      .filter(Boolean);
    const topics = xTopics
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (
      !xBearerToken ||
      !anthropicKey ||
      usernames.length === 0 ||
      (generateImage && !geminiKey)
    )
      return;

    xPipeline.run(
      xBearerToken,
      anthropicKey,
      geminiKey,
      usernames,
      topics.length > 0 ? topics : ['AI', 'tech'],
      xHoursBack,
      generateImage,
    );
  }, [
    xBearerToken,
    anthropicKey,
    geminiKey,
    xAccounts,
    xTopics,
    xHoursBack,
    generateImage,
    xPipeline,
  ]);

  const handleReset = useCallback(() => {
    activePipeline.reset();
    if (sourceMode === 'youtube') {
      setYoutubeUrl('');
    }
  }, [activePipeline, sourceMode]);

  // Compute cost estimate text length for X mode
  const xPostTextLength = xPipeline.digest
    ? xPipeline.digest.key_takeaways.join(' ').length +
      xPipeline.digest.tldr.length
    : 0;

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: 'var(--bg-primary)' }}
    >
      <Header />
      <div className="main-grid flex-1">
        <aside className="sidebar flex flex-col gap-5 p-5">
          <SourceTabs
            mode={sourceMode}
            onChange={handleModeChange}
            disabled={isRunning}
          />

          {sourceMode === 'youtube' ? (
            <>
              <div className="flex flex-col gap-2">
                <SectionHeader title="Transcript" />
                <KeyInput
                  key="supadata"
                  label="Supadata API Key"
                  storageKey="supadata_api_key"
                  value={supadataKey}
                  onChange={handleSupadataChange}
                  placeholder="sd_..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <SectionHeader title="Analysis" />
                <KeyInput
                  key="anthropic-yt"
                  label="Anthropic API Key"
                  storageKey="anthropic_api_key"
                  value={anthropicKey}
                  onChange={handleAnthropicChange}
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
                    key="gemini-yt"
                    label="Google AI Studio API Key"
                    storageKey="gemini_api_key"
                    value={geminiKey}
                    onChange={handleGeminiChange}
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
                onSubmit={handleYoutubeSubmit}
                disabled={
                  isRunning ||
                  !anthropicKey ||
                  !supadataKey ||
                  (generateImage && !geminiKey)
                }
              />
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <SectionHeader title="X Feed" />
                <KeyInput
                  key="x-bearer"
                  label="X Bearer Token"
                  storageKey="x_bearer_token"
                  value={xBearerToken}
                  onChange={handleXBearerChange}
                  placeholder="AAAA..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <SectionHeader title="Analysis" />
                <KeyInput
                  key="anthropic-x"
                  label="Anthropic API Key"
                  storageKey="anthropic_api_key"
                  value={anthropicKey}
                  onChange={handleAnthropicChange}
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
                    key="gemini-x"
                    label="Google AI Studio API Key"
                    storageKey="gemini_api_key"
                    value={geminiKey}
                    onChange={handleGeminiChange}
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

              <XFeedInputs
                accounts={xAccounts}
                onAccountsChange={setXAccounts}
                topics={xTopics}
                onTopicsChange={setXTopics}
                hoursBack={xHoursBack}
                onHoursBackChange={setXHoursBack}
                disabled={isRunning}
              />

              <button
                onClick={handleXSubmit}
                disabled={
                  isRunning ||
                  !xBearerToken ||
                  !anthropicKey ||
                  !xAccounts.trim() ||
                  (generateImage && !geminiKey)
                }
                className="w-full cursor-pointer rounded-lg py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: 'var(--accent)' }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled)
                    e.currentTarget.style.background = 'var(--accent-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--accent)';
                }}
              >
                Analyze
              </button>
            </>
          )}

          <LoadingSteps
            state={activePipeline.state}
            generateImage={generateImage}
            sourceMode={sourceMode}
          />

          {sourceMode === 'youtube' && ytPipeline.analysis && (
            <CostEstimate
              transcriptLength={ytPipeline.analysis.transcript_length}
              generatedImage={!!ytPipeline.image}
              sourceMode="youtube"
            />
          )}

          {sourceMode === 'x-feed' && xPipeline.digest && (
            <CostEstimate
              transcriptLength={0}
              generatedImage={!!xPipeline.image}
              sourceMode="x-feed"
              postTextLength={xPostTextLength}
            />
          )}

          {activePipeline.state === 'error' && activePipeline.error && (
            <div
              className="rounded-lg border px-3 py-2.5 text-xs"
              style={{
                borderColor: 'rgba(127, 29, 29, 0.5)',
                background: 'rgba(127, 29, 29, 0.15)',
                color: '#f87171',
              }}
            >
              {activePipeline.error}
            </div>
          )}

          {activePipeline.state === 'complete' && (
            <button
              onClick={handleReset}
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
              {sourceMode === 'youtube'
                ? 'Analyze another video'
                : 'Analyze another feed'}
            </button>
          )}

          <PoweredBy />
        </aside>

        <main className="col-analysis flex flex-col p-5">
          {sourceMode === 'youtube' && ytPipeline.analysis ? (
            <AnalysisResult analysis={ytPipeline.analysis} />
          ) : sourceMode === 'x-feed' && xPipeline.digest ? (
            <XDigestResult digest={xPipeline.digest} />
          ) : (
            <EmptyState label="Analysis will appear here" />
          )}
        </main>

        <section className="col-image flex flex-col p-5">
          {(sourceMode === 'youtube' ? ytPipeline.image : xPipeline.image) ? (
            <ImageResult
              image={
                (sourceMode === 'youtube'
                  ? ytPipeline.image
                  : xPipeline.image)!
              }
            />
          ) : (
            <EmptyState label="Infographic will appear here" />
          )}
        </section>
      </div>
    </div>
  );
}
