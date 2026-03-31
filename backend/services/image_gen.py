import base64

from google import genai
from google.genai import types

from backend.config import Models
from backend.models import AnalysisResult, GenerateImageResponse


def build_prompt(analysis: AnalysisResult) -> str:
    takeaway_lines = "\n".join(
        f"- {t.title}: {t.description}" for t in analysis.key_takeaways[:5]
    )
    return (
        f"Create a comic-book style infographic poster with bold black outlines, "
        f"vibrant pop-art colors, and halftone dot patterns. "
        f'Title at the top in large bold letters: "{analysis.video_title}". '
        f"Include visual representations of these key points:\n"
        f"{takeaway_lines}\n\n"
        f"Style: retro comic book, speech bubbles, dynamic layout, "
        f"bright saturated colors, bold typography. "
        f"Make it visually engaging and shareable on social media."
    )


async def generate_infographic(
    analysis: AnalysisResult,
    api_key: str,
) -> GenerateImageResponse:
    client = genai.Client(api_key=api_key)
    prompt = build_prompt(analysis)

    response = client.models.generate_content(
        model=Models.GEMINI_IMAGE,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE"],
        ),
    )

    if not response.candidates:
        raise RuntimeError(
            "Gemini returned no candidates. "
            "The prompt may have been blocked by safety filters."
        )

    candidate = response.candidates[0]
    if not candidate.content or not candidate.content.parts:
        finish_reason = getattr(candidate, "finish_reason", "unknown")
        raise RuntimeError(
            f"Gemini returned no image data. Finish reason: {finish_reason}. "
            "Try a different video or simplify the prompt."
        )

    for part in candidate.content.parts:
        if part.inline_data is not None:
            image_bytes = part.inline_data.data
            mime_type = part.inline_data.mime_type
            image_base64 = base64.b64encode(image_bytes).decode("utf-8")
            return GenerateImageResponse(
                image_base64=image_base64,
                mime_type=mime_type,
            )

    raise RuntimeError("No image data returned from Gemini")
