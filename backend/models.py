from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    youtube_url: str = Field(..., min_length=10, max_length=500)
    anthropic_api_key: str = Field(
        ..., min_length=1, max_length=200
    )  # never stored, per-request only


class Takeaway(BaseModel):
    title: str
    description: str


class AnalysisResult(BaseModel):
    video_title: str
    video_url: str
    tldr: str
    key_takeaways: list[Takeaway]
    social_hook: str
    transcript_length: int


class GenerateImageRequest(BaseModel):
    analysis: AnalysisResult
    gemini_api_key: str = Field(
        ..., min_length=1, max_length=200
    )  # never stored, per-request only


class GenerateImageResponse(BaseModel):
    image_base64: str
    mime_type: str = "image/png"


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str
