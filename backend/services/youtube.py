import re

import httpx
from youtube_transcript_api import YouTubeTranscriptApi

VIDEO_ID_PATTERNS = [
    re.compile(
        r"(?:youtube\.com/watch\?.*v=|youtu\.be/|youtube\.com/embed/|youtube\.com/shorts/)([a-zA-Z0-9_-]{11})"
    ),
]


def extract_video_id(url: str) -> str:
    for pattern in VIDEO_ID_PATTERNS:
        match = pattern.search(url)
        if match:
            return match.group(1)
    raise ValueError(f"Could not extract video ID from URL: {url}")


async def get_video_title(url: str) -> str:
    oembed_url = f"https://www.youtube.com/oembed?url={url}&format=json"
    async with httpx.AsyncClient() as client:
        response = await client.get(oembed_url)
        response.raise_for_status()
        return response.json()["title"]


def fetch_transcript(video_id: str) -> str:
    ytt_api = YouTubeTranscriptApi()
    transcript = ytt_api.fetch(video_id)
    return " ".join(snippet.text for snippet in transcript.snippets)
