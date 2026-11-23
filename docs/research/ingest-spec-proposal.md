# Ingest + clip pipeline proposal (from founder, 2026-11-22)

Source: founder-pasted spec (outside AI). Claims about Ssemble's internal method are unverified.

## Pipeline
1. Ingest: YouTube URL -> yt-dlp download on server.
2. Transcribe: Whisper / whisper.cpp, word-level timestamps.
3. Select: LLM picks the most engaging 30s segment; returns {start, end, title, reason}.
4. Render: FFmpeg cut, 9:16 crop with MediaPipe face tracking, burned-in karaoke captions, 1080x1920 MP4.
5. Output: MP4 URL + metadata.

## Guardrails
- Public, non-membership, non-age-restricted videos only. Reject anything needing login, payment, or special access.
- ToS: user is solely responsible for rights to submitted content.
- Creator authorization program (creators opt in and license content for clipping).
- Don't market as "download any YouTube video".
- One video at a time (queue). Delete full source after render; store only the clip.
- Log which creator authorized each video. Honor takedowns within 24 hours.

## Proposed stack
Python, FastAPI, yt-dlp, FFmpeg, Whisper, MediaPipe, OpenAI API.

## Review notes (agent)
- Adopt: public-only checks (yt-dlp exposes availability and age_limit), rights checkbox + ToS, 24h takedowns, no "download anything" marketing.
- Conflicts with product vision: returns 1 clip; vision is several top moments with scores. Source deleted right after render; KivloWorkspace needs the source to re-trim. 30s fixed; clips vary.
- Conflicts with PLAN.md stack: Python/FastAPI/OpenAI vs Next.js/Claude. Python fits the video workers (Whisper, MediaPipe); web app can stay Next.js.
- Creator program is a creator-facing product; random public videos will have no authorizing creator, so the log is empty for most imports.
- Ops risk: YouTube often blocks yt-dlp from cloud server IPs ("confirm you're not a bot"). May need proxies (cost) or fail often.
- "Low profile" is not legal protection; guardrails reduce risk, they don't remove the YouTube ToS conflict.
- Covers YouTube only; Twitch and Kick need their own ingest.
