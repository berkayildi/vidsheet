"""Single source of truth for model and app configuration."""


class Models:
    ANTHROPIC_ANALYSIS = "claude-sonnet-4-20250514"
    GEMINI_IMAGE = "gemini-3.1-flash-image-preview"


class Limits:
    MAX_TRANSCRIPT_CHARS = 50000
    ANTHROPIC_MAX_TOKENS = 2048


APP_VERSION = "0.3.0"
