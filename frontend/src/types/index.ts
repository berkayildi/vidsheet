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

export interface XNotablePost {
  author_username: string;
  text: string;
  url: string;
  why_notable: string;
}

export interface XDigestResult {
  title: string;
  date_analysed: string;
  accounts: string[];
  topics: string[];
  key_takeaways: string[];
  tldr: string;
  twitter_hook: string;
  notable_posts: XNotablePost[];
  post_count: number;
  source: string;
}

export type SourceMode = "youtube" | "x-feed";
