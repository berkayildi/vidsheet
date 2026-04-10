import os
import sys

# Ensure repo root is in Python path for Vercel serverless
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

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
    GenerateImageFromDigestRequest,
    GenerateImageRequest,
    GenerateImageResponse,
    HealthResponse,
    Takeaway,
    XDigestResult,
    XFeedRequest,
)
from backend.services.analysis import analyze_transcript
from backend.services.image_gen import generate_infographic
from backend.services.x_client import fetch_x_feed
from backend.services.x_digest import analyse_x_digest
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
        title, transcript_result = await asyncio.gather(
            get_video_title(video_id),
            fetch_transcript(request.youtube_url, request.supadata_api_key),
        )
        transcript, transcript_lang = transcript_result
    except Exception:
        logger.exception("Failed to fetch video data")
        raise HTTPException(
            status_code=422,
            detail=(
                "Failed to fetch video data. "
                "Check the URL and Supadata API key "
                "and try again."
            ),
        )

    try:
        result = await analyze_transcript(
            transcript=transcript,
            video_title=title,
            video_url=request.youtube_url,
            api_key=request.anthropic_api_key,
            transcript_lang=transcript_lang,
        )
    except Exception:
        logger.exception("Analysis failed")
        raise HTTPException(
            status_code=502,
            detail=("Analysis failed. Check your Anthropic API key and try again."),
        )

    return result


@app.post("/api/analyze-x-feed", response_model=XDigestResult)
async def analyze_x_feed(request: XFeedRequest) -> XDigestResult:
    try:
        feed_result = await fetch_x_feed(
            bearer_token=request.x_bearer_token.strip(),
            usernames=request.usernames,
            hours_back=request.hours_back,
        )
    except Exception:
        logger.exception("Failed to fetch X feed")
        raise HTTPException(
            status_code=422,
            detail="Failed to fetch X feed. Check your bearer token and usernames.",
        )

    if not feed_result.posts:
        raise HTTPException(
            status_code=422,
            detail="No posts found for the specified accounts and time range.",
        )

    try:
        result = await analyse_x_digest(
            feed_result=feed_result,
            topics=request.topics,
            api_key=request.anthropic_api_key.strip(),
        )
    except Exception:
        logger.exception("X feed analysis failed")
        raise HTTPException(
            status_code=502,
            detail="Analysis failed. Check your Anthropic API key and try again.",
        )

    return result


@app.post("/api/generate-image-from-digest", response_model=GenerateImageResponse)
async def generate_image_from_digest(
    request: GenerateImageFromDigestRequest,
) -> GenerateImageResponse:
    analysis = AnalysisResult(
        video_title=request.digest.title,
        video_url="",
        tldr=request.digest.tldr,
        key_takeaways=[
            Takeaway(title=t, description="") for t in request.digest.key_takeaways
        ],
        social_hook=request.digest.twitter_hook,
        transcript_length=0,
    )
    try:
        result = await generate_infographic(
            analysis=analysis,
            api_key=request.gemini_api_key,
        )
    except Exception:
        logger.exception("Image generation from digest failed")
        raise HTTPException(
            status_code=502,
            detail="Image generation failed. Check your Gemini API key and try again.",
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
