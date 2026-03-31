export interface Takeaway {
  title: string;
  description: string;
}

export interface AnalysisResult {
  video_title: string;
  video_url: string;
  tldr: string;
  key_takeaways: Takeaway[];
  social_hook: string;
  transcript_length: number;
}

export interface GenerateImageResponse {
  image_base64: string;
  mime_type: string;
}

export type PipelineState =
  | "idle"
  | "analyzing"
  | "generating-image"
  | "complete"
  | "error";
