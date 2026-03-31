import asyncio
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from backend.config import APP_VERSION
from backend.models import (
    AnalysisResult,
    AnalyzeRequest,
    GenerateImageRequest,
    GenerateImageResponse,
    HealthResponse,
)
from backend.services.analysis import analyze_transcript
from backend.services.image_gen import generate_infographic
from backend.services.youtube import (
    extract_video_id,
    fetch_transcript,
    get_video_title,
)

logger = logging.getLogger(__name__)

app = FastAPI(title="VidSheet API", version=APP_VERSION)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: object) -> Response:
        response = await call_next(request)  # type: ignore[operator]
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response  # type: ignore[return-value]


app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.get("/api/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(version=app.version)


@app.post("/api/analyze", response_model=AnalysisResult)
async def analyze(request: AnalyzeRequest) -> AnalysisResult:
    try:
        video_id = extract_video_id(request.youtube_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        title, transcript = await asyncio.gather(
            get_video_title(video_id),
            asyncio.to_thread(fetch_transcript, video_id),
        )
    except Exception:
        logger.exception("Failed to fetch video data")
        raise HTTPException(
            status_code=422,
            detail=("Failed to fetch video data. Check the URL and try again."),
        )

    try:
        result = await analyze_transcript(
            transcript=transcript,
            video_title=title,
            video_url=request.youtube_url,
            api_key=request.anthropic_api_key,
        )
    except Exception:
        logger.exception("Analysis failed")
        raise HTTPException(
            status_code=502,
            detail=("Analysis failed. Check your Anthropic API key and try again."),
        )

    return result


@app.post("/api/generate-image", response_model=GenerateImageResponse)
async def generate_image(
    request: GenerateImageRequest,
) -> GenerateImageResponse:
    try:
        result = await generate_infographic(
            analysis=request.analysis,
            api_key=request.gemini_api_key,
        )
    except Exception:
        logger.exception("Image generation failed")
        raise HTTPException(
            status_code=502,
            detail=(
                "Image generation failed. Check your Gemini API key and try again."
            ),
        )

    return result
