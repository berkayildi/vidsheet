import json

import anthropic

from backend.config import Limits, Models
from backend.models import AnalysisResult

SYSTEM_PROMPT = (
    "You are a content analyst. Given a YouTube video transcript, "
    "produce a structured JSON analysis.\n\n"
    "Return ONLY valid JSON with this exact structure:\n"
    "{\n"
    '  "tldr": "A concise 1-2 sentence summary of the video content",\n'
    '  "key_takeaways": [\n'
    '    {"title": "Short title", "description": "Detailed explanation"}\n'
    "  ],\n"
    '  "social_hook": "An engaging social media hook for sharing"\n'
    "}\n\n"
    "Rules:\n"
    "- tldr: 1-2 sentences, clear and informative\n"
    "- key_takeaways: 3-7 items, each with a short title and description\n"
    "- social_hook: engaging, shareable, under 280 characters\n"
    "- Return ONLY the JSON object, no markdown fences or extra text"
)


async def analyze_transcript(
    transcript: str,
    video_title: str,
    video_url: str,
    api_key: str,
) -> AnalysisResult:
    truncated = transcript[: Limits.MAX_TRANSCRIPT_CHARS]

    client = anthropic.AsyncAnthropic(api_key=api_key)
    message = await client.messages.create(
        model=Models.ANTHROPIC_ANALYSIS,
        max_tokens=Limits.ANTHROPIC_MAX_TOKENS,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": (f"Video title: {video_title}\n\nTranscript:\n{truncated}"),
            }
        ],
    )

    response_text = message.content[0].text if message.content else None
    if not response_text:
        raise RuntimeError("Empty response from Anthropic API")

    try:
        data = json.loads(response_text)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Failed to parse analysis response as JSON: {e}")

    return AnalysisResult(
        video_title=video_title,
        video_url=video_url,
        tldr=data["tldr"],
        key_takeaways=data["key_takeaways"],
        social_hook=data["social_hook"],
        transcript_length=len(transcript),
    )
