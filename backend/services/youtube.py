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
    headers = {"x-api-key": supadata_api_key.strip()}
    base_params = {"url": youtube_url, "text": "true", "mode": "auto"}

    async with httpx.AsyncClient(timeout=30) as client:
        # Try with lang=en (triggers fallback to any available language)
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

        # If 206 or empty, try to extract availableLangs and retry
        if response.status_code in (200, 206):
            try:
                data = response.json()
                available: list[str] = data.get("availableLangs", [])
                if available:
                    for lang_code in available:
                        retry_response = await client.get(
                            "https://api.supadata.ai/v1/transcript",
                            params={**base_params, "lang": lang_code},
                            headers=headers,
                        )
                        if retry_response.status_code == 200:
                            retry_data = retry_response.json()
                            content = retry_data.get("content", "")
                            if content:
                                return content, retry_data.get("lang", lang_code)
            except Exception:
                logger.debug("Failed to parse availableLangs from response")

        # Last resort: try common language codes directly
        for lang_code in ["tr", "es", "pt", "fr", "de", "ja", "ko", "zh", "ar", "hi"]:
            try:
                response = await client.get(
                    "https://api.supadata.ai/v1/transcript",
                    params={**base_params, "lang": lang_code},
                    headers=headers,
                )
                if response.status_code == 200:
                    data = response.json()
                    content = data.get("content", "")
                    if content:
                        return content, data.get("lang", lang_code)
            except Exception:
                logger.debug("Transcript fetch failed for lang=%s", lang_code)
                continue

        raise ValueError("No transcript available for this video")
