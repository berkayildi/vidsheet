import logging
import re

import httpx

logger = logging.getLogger(__name__)

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
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(oembed_url)
        response.raise_for_status()
        return response.json()["title"]


async def fetch_transcript(youtube_url: str, supadata_api_key: str) -> tuple[str, str]:
    """Fetch transcript via Supadata API.

    Returns tuple of (transcript_text, language_code).
    """
    headers = {"x-api-key": supadata_api_key}
    base_params = {"url": youtube_url, "text": "true", "mode": "auto"}

    async with httpx.AsyncClient(timeout=30) as client:
        # Try English first
        response = await client.get(
            "https://api.supadata.ai/v1/transcript",
            params={**base_params, "lang": "en"},
            headers=headers,
        )

        if response.status_code == 200:
            data = response.json()
            content = data.get("content", "")
            if content:
                return content, data.get("lang", "en")

        # Try without lang preference to get any available
        response = await client.get(
            "https://api.supadata.ai/v1/transcript",
            params=base_params,
            headers=headers,
        )

        if response.status_code == 200:
            data = response.json()
            content = data.get("content", "")
            if content:
                return content, data.get("lang", "unknown")

        # Check for availableLangs in the error response
        try:
            error_data = response.json()
            available: list[str] = error_data.get("availableLangs", [])
            if available:
                response = await client.get(
                    "https://api.supadata.ai/v1/transcript",
                    params={**base_params, "lang": available[0]},
                    headers=headers,
                )
                if response.status_code == 200:
                    data = response.json()
                    content = data.get("content", "")
                    if content:
                        return content, data.get("lang", available[0])
        except Exception:
            pass

        raise ValueError("No transcript available for this video")
