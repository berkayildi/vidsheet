from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    youtube_url: str = Field(..., min_length=10, max_length=500)
    anthropic_api_key: str = Field(
        ..., min_length=1, max_length=200
    )  # never stored, per-request only
    supadata_api_key: str = Field(
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


# --- X Feed models ---


class XFeedRequest(BaseModel):
    x_bearer_token: str = Field(..., min_length=1, max_length=500)
    anthropic_api_key: str = Field(..., min_length=1, max_length=200)
    usernames: list[str] = Field(..., min_length=1)
    topics: list[str] = Field(default=["AI", "tech"])
    hours_back: int = Field(default=24, ge=1, le=168)


class XPost(BaseModel):
    id: str
    text: str
    author_username: str
    author_name: str
    created_at: str
    url: str
    retweet_count: int = 0
    like_count: int = 0
    is_retweet: bool = False
    is_reply: bool = False


class XFeedFailure(BaseModel):
    username: str
    error: str


class XFeedFetchResult(BaseModel):
    accounts: list[str]
    posts: list[XPost] = Field(default_factory=list)
    failures: list[XFeedFailure] = Field(default_factory=list)


class XNotablePost(BaseModel):
    author_username: str
    text: str
    url: str
    why_notable: str


class XDigestResult(BaseModel):
    title: str
    date_analysed: str
    accounts: list[str]
    topics: list[str]
    key_takeaways: list[str]
    tldr: str
    twitter_hook: str
    notable_posts: list[XNotablePost]
    post_count: int
    source: str = "x_feed"


class GenerateImageFromDigestRequest(BaseModel):
    digest: XDigestResult
    gemini_api_key: str = Field(..., min_length=1, max_length=200)
