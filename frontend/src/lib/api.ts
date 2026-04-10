import type {
  AnalysisResult,
  GenerateImageResponse,
  XDigestResult,
} from "../types";

const BASE_URL = "";

interface ApiError {
  detail: string;
}

async function request<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: `Request failed with status ${response.status}`,
    }));
    throw new Error(error.detail);
  }

  return response.json() as Promise<T>;
}

export function analyzeVideo(
  youtubeUrl: string,
  anthropicApiKey: string,
  supadataApiKey: string
): Promise<AnalysisResult> {
  return request<AnalysisResult>("/api/analyze", {
    youtube_url: youtubeUrl,
    anthropic_api_key: anthropicApiKey,
    supadata_api_key: supadataApiKey,
  });
}

export function generateImage(
  analysis: AnalysisResult,
  geminiApiKey: string
): Promise<GenerateImageResponse> {
  return request<GenerateImageResponse>("/api/generate-image", {
    analysis,
    gemini_api_key: geminiApiKey,
  });
}

export function analyzeXFeed(
  xBearerToken: string,
  anthropicApiKey: string,
  usernames: string[],
  topics: string[],
  hoursBack: number
): Promise<XDigestResult> {
  return request<XDigestResult>("/api/analyze-x-feed", {
    x_bearer_token: xBearerToken,
    anthropic_api_key: anthropicApiKey,
    usernames,
    topics,
    hours_back: hoursBack,
  });
}

export function generateImageFromDigest(
  digest: XDigestResult,
  geminiApiKey: string
): Promise<GenerateImageResponse> {
  return request<GenerateImageResponse>("/api/generate-image-from-digest", {
    digest,
    gemini_api_key: geminiApiKey,
  });
}
