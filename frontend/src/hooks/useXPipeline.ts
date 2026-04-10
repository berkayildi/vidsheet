import { useCallback, useState } from "react";
import {
  analyzeXFeed,
  generateImageFromDigest,
} from "../lib/api";
import type {
  GenerateImageResponse,
  PipelineState,
  XDigestResult,
} from "../types";

interface UseXPipelineReturn {
  state: PipelineState;
  digest: XDigestResult | null;
  image: GenerateImageResponse | null;
  error: string | null;
  run: (
    xBearerToken: string,
    anthropicApiKey: string,
    geminiApiKey: string,
    usernames: string[],
    topics: string[],
    hoursBack: number,
    shouldGenerateImage: boolean
  ) => Promise<void>;
  reset: () => void;
}

export function useXPipeline(): UseXPipelineReturn {
  const [state, setState] = useState<PipelineState>("idle");
  const [digest, setDigest] = useState<XDigestResult | null>(null);
  const [image, setImage] = useState<GenerateImageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setState("idle");
    setDigest(null);
    setImage(null);
    setError(null);
  }, []);

  const run = useCallback(
    async (
      xBearerToken: string,
      anthropicApiKey: string,
      geminiApiKey: string,
      usernames: string[],
      topics: string[],
      hoursBack: number,
      shouldGenerateImage: boolean
    ) => {
      reset();

      try {
        setState("analyzing");
        const digestResult = await analyzeXFeed(
          xBearerToken,
          anthropicApiKey,
          usernames,
          topics,
          hoursBack,
        );
        setDigest(digestResult);

        if (shouldGenerateImage) {
          setState("generating-image");
          const imageResult = await generateImageFromDigest(
            digestResult,
            geminiApiKey,
          );
          setImage(imageResult);
        }

        setState("complete");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setState("error");
      }
    },
    [reset]
  );

  return { state, digest, image, error, run, reset };
}
