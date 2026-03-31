import { useCallback, useState } from "react";
import { analyzeVideo, generateImage } from "../lib/api";
import type {
  AnalysisResult,
  GenerateImageResponse,
  PipelineState,
} from "../types";

interface UsePipelineReturn {
  state: PipelineState;
  analysis: AnalysisResult | null;
  image: GenerateImageResponse | null;
  error: string | null;
  run: (
    youtubeUrl: string,
    anthropicApiKey: string,
    geminiApiKey: string
  ) => Promise<void>;
  reset: () => void;
}

export function usePipeline(): UsePipelineReturn {
  const [state, setState] = useState<PipelineState>("idle");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [image, setImage] = useState<GenerateImageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setState("idle");
    setAnalysis(null);
    setImage(null);
    setError(null);
  }, []);

  const run = useCallback(
    async (
      youtubeUrl: string,
      anthropicApiKey: string,
      geminiApiKey: string
    ) => {
      reset();

      try {
        setState("analyzing");
        const analysisResult = await analyzeVideo(youtubeUrl, anthropicApiKey);
        setAnalysis(analysisResult);

        setState("generating-image");
        const imageResult = await generateImage(analysisResult, geminiApiKey);
        setImage(imageResult);

        setState("complete");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setState("error");
      }
    },
    [reset]
  );

  return { state, analysis, image, error, run, reset };
}
