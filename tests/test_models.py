from backend.models import AnalysisResult, AnalyzeRequest, Takeaway


class TestAnalyzeRequest:
    def test_valid_request(self) -> None:
        req = AnalyzeRequest(
            youtube_url="https://youtube.com/watch?v=abc123_-def",
            anthropic_api_key="sk-ant-test-key",
            supadata_api_key="sd_test_key",
        )
        assert req.youtube_url == "https://youtube.com/watch?v=abc123_-def"
        assert req.anthropic_api_key == "sk-ant-test-key"
        assert req.supadata_api_key == "sd_test_key"


class TestAnalysisResult:
    def test_serialization(self) -> None:
        result = AnalysisResult(
            video_title="Test Video",
            video_url="https://youtube.com/watch?v=test123",
            tldr="This is a test summary.",
            key_takeaways=[
                Takeaway(title="Point 1", description="Description 1"),
                Takeaway(title="Point 2", description="Description 2"),
            ],
            social_hook="Check out this video!",
            transcript_length=5000,
        )
        data = result.model_dump()
        assert data["video_title"] == "Test Video"
        assert len(data["key_takeaways"]) == 2
        assert data["key_takeaways"][0]["title"] == "Point 1"
        assert data["transcript_length"] == 5000

    def test_roundtrip(self) -> None:
        result = AnalysisResult(
            video_title="Test",
            video_url="https://youtube.com/watch?v=abc",
            tldr="Summary",
            key_takeaways=[Takeaway(title="T", description="D")],
            social_hook="Hook",
            transcript_length=100,
        )
        json_str = result.model_dump_json()
        restored = AnalysisResult.model_validate_json(json_str)
        assert restored == result
