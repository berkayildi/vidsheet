import asyncio

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

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
from backend.services.youtube import extract_video_id, fetch_transcript, get_video_title

app = FastAPI(title="VidSheet API", version=APP_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
            get_video_title(request.youtube_url),
            asyncio.to_thread(fetch_transcript, video_id),
        )
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to fetch video data: {e}",
        )

    try:
        result = await analyze_transcript(
            transcript=transcript,
            video_title=title,
            video_url=request.youtube_url,
            api_key=request.anthropic_api_key,
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Analysis failed: {e}",
        )

    return result


@app.post("/api/generate-image", response_model=GenerateImageResponse)
async def generate_image(request: GenerateImageRequest) -> GenerateImageResponse:
    try:
        result = await generate_infographic(
            analysis=request.analysis,
            api_key=request.gemini_api_key,
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Image generation failed: {e}",
        )

    return result
