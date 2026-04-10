interface CostEstimateProps {
  transcriptLength: number;
  generatedImage: boolean;
}

export function CostEstimate({
  transcriptLength,
  generatedImage,
}: CostEstimateProps) {
  // Claude claude-sonnet-4-20250514: $3/1M input tokens, $15/1M output tokens
  // Rough estimate: 4 chars per token
  const inputTokens = Math.ceil(transcriptLength / 4);
  const outputTokens = 500;
  const anthropicCost = (inputTokens * 3 + outputTokens * 15) / 1_000_000;

  // Gemini gemini-3.1-flash-image-preview: ~$0.04 per image
  const geminiCost = generatedImage ? 0.04 : 0;

  const totalCost = anthropicCost + geminiCost;

  return (
    <div>
      <div
        className="rounded-lg border px-3 py-2 text-[11px]"
        style={{
          borderColor: "var(--border)",
          background: "var(--bg-tertiary)",
          fontFamily: "var(--font-mono)",
          color: "var(--text-dim)",
        }}
      >
        <div className="flex justify-between">
          <span>Transcript</span>
          <span>1 credit</span>
        </div>
        <div className="flex justify-between">
          <span>Analysis (~{inputTokens.toLocaleString()} tokens)</span>
          <span>${anthropicCost.toFixed(4)}</span>
        </div>
        {generatedImage && (
          <div className="flex justify-between">
            <span>Infographic</span>
            <span>${geminiCost.toFixed(4)}</span>
          </div>
        )}
        <div
          className="mt-1 flex justify-between border-t pt-1"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          <span>Est. API cost</span>
          <span>${totalCost.toFixed(4)}</span>
        </div>
      </div>
      <p className="mt-1 text-[10px]" style={{ color: "var(--text-ghost)" }}>
        Estimates based on approximate token counts
      </p>
    </div>
  );
}
