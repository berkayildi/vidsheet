import type { AnalysisResult, GenerateImageResponse } from "../types";

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
  anthropicApiKey: string
): Promise<AnalysisResult> {
  return request<AnalysisResult>("/api/analyze", {
    youtube_url: youtubeUrl,
    anthropic_api_key: anthropicApiKey,
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
