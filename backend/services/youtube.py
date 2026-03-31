import re

import httpx
from youtube_transcript_api import YouTubeTranscriptApi

VIDEO_ID_PATTERN = re.compile(
    r"(?:youtube\.com/watch\?.*v=|youtu\.be/"
    r"|youtube\.com/embed/|youtube\.com/shorts/)"
    r"([a-zA-Z0-9_-]{11})"
)


def extract_video_id(url: str) -> str:
    match = VIDEO_ID_PATTERN.search(url)
    if match:
        return match.group(1)
    raise ValueError(f"Could not extract video ID from URL: {url}")


async def get_video_title(video_id: str) -> str:
    safe_url = f"https://www.youtube.com/watch?v={video_id}"
    oembed_url = f"https://www.youtube.com/oembed?url={safe_url}&format=json"
    async with httpx.AsyncClient() as client:
        response = await client.get(oembed_url, timeout=10)
        response.raise_for_status()
        return response.json()["title"]


def fetch_transcript(video_id: str) -> str:
    ytt_api = YouTubeTranscriptApi()
    try:
        transcript = ytt_api.fetch(video_id)
    except Exception:
        # English not available, try to find any transcript and translate
        transcript_list = ytt_api.list(video_id)
        available = list(transcript_list)
        if not available:
            raise ValueError("No transcripts available for this video")
        # Prefer translatable transcripts
        for t in available:
            if t.is_translatable:
                transcript = t.translate("en").fetch()
                break
        else:
            # Fall back to first available without translation
            transcript = available[0].fetch()
    return " ".join(snippet.text for snippet in transcript.snippets)
