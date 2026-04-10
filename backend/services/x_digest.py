"""Claude analysis client for X feed digests."""

from __future__ import annotations

import json
import re
from datetime import datetime

import anthropic

from backend.config import Models
from backend.models import XDigestResult, XFeedFetchResult

SYSTEM_PROMPT = (
    "You are a content analyst and social media strategist. "
    "Given a collection of posts from X (Twitter), produce EXACTLY "
    "this JSON structure:\n"
    "{\n"
    '  "title": "descriptive digest title",\n'
    '  "accounts": ["username1", "username2"],\n'
    '  "topics": ["topic1", "topic2"],\n'
    '  "key_takeaways": ["takeaway 1", "takeaway 2", ...],\n'
    '  "tldr": "2-3 sentence summary a busy person can read '
    'in 15 seconds",\n'
    '  "twitter_hook": "social hook -- see rules below",\n'
    '  "notable_posts": [\n'
    "    {\n"
    '      "author_username": "username",\n'
    '      "text": "post text",\n'
    '      "url": "post url",\n'
    '      "why_notable": "reason this post stands out"\n'
    "    }\n"
    "  ],\n"
    '  "post_count": 42\n'
    "}\n\n"
    "ANALYSIS RULES:\n"
    "- Synthesise across ALL accounts -- find common themes "
    "and disagreements\n"
    "- Focus on the provided topics -- ignore off-topic posts\n"
    "- key_takeaways: 4-8 items that capture the most important "
    "insights\n"
    "- notable_posts: 3-5 posts that are particularly noteworthy, "
    "with why_notable explaining the reason\n"
    "- post_count: total number of posts analysed\n\n"
    "SOCIAL HOOK RULES (strictly under 280 characters "
    "including hashtags):\n"
    "- Lead with a bold claim, surprising stat, or contrarian take "
    "from the posts -- NOT a summary\n"
    "- Use a pattern like: \"[Surprising insight] -- here's why it "
    'matters:" or "Most people think [X]. Actually, [Y]."\n'
    "- Write in a punchy, conversational tone -- as if you're "
    "telling a friend the one thing they NEED to know\n"
    "- End with 2-3 relevant hashtags (count towards 280 chars)\n"
    '- Do NOT start with "Just read..." or "Today on X..." '
    "-- go straight to the insight\n"
    "- The hook must make someone stop scrolling and want to "
    "learn more\n\n"
    "IMPORTANT: All output must be in English.\n\n"
    "Respond ONLY with valid JSON -- no markdown fences, "
    "no preamble."
)


def build_user_prompt(feed_result: XFeedFetchResult, topics: list[str]) -> str:
    """Build the user prompt for Claude from feed data."""
    parts = [
        f"Accounts: {', '.join(feed_result.accounts)}",
        f"Topics: {', '.join(topics)}",
        f"Total posts: {len(feed_result.posts)}",
        "",
        "POSTS:",
        "",
    ]

    for post in feed_result.posts:
        parts.append(
            f"@{post.author_username} ({post.created_at}) "
            f"[likes:{post.like_count} rt:{post.retweet_count}]"
        )
        parts.append(post.text)
        parts.append(f"URL: {post.url}")
        parts.append("")

    return "\n".join(parts)


def parse_digest_response(
    raw: str, feed_result: XFeedFetchResult, topics: list[str]
) -> XDigestResult:
    """Parse Claude's response into an XDigestResult."""
    cleaned = raw.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    cleaned = cleaned.strip()

    data = json.loads(cleaned)

    data["date_analysed"] = datetime.now().isoformat()
    data["source"] = "x_feed"
    data.setdefault("accounts", feed_result.accounts)
    data.setdefault("topics", topics)
    data.setdefault("post_count", len(feed_result.posts))

    return XDigestResult.model_validate(data)


async def analyse_x_digest(
    feed_result: XFeedFetchResult,
    topics: list[str],
    api_key: str,
) -> XDigestResult:
    """Send X feed data to Claude for digest analysis."""
    client = anthropic.AsyncAnthropic(api_key=api_key.strip())

    user_prompt = build_user_prompt(feed_result, topics)

    message = await client.messages.create(
        model=Models.ANTHROPIC_ANALYSIS,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )

    raw_text = message.content[0].text
    return parse_digest_response(raw_text, feed_result, topics)
