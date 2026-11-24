import json
import subprocess
import pytest

from kivlo_worker.stages import evaluate_probe, probe, credits_for, JobFail, NotImplementedStage
from kivlo_worker.loop import backoff_seconds


def meta(**kw):
    base = {"title": "T", "duration": 3600, "channel": "C", "thumbnail": "x",
            "availability": "public", "age_limit": 0, "is_live": False}
    base.update(kw)
    return base


class TestCredits:
    def test_math(self):
        assert credits_for(1200) == 1
        assert credits_for(1201) == 2
        assert credits_for(3600) == 3
        assert credits_for(0) == 1


class TestBackoff:
    def test_exponential_cap(self):
        assert backoff_seconds(1) == 30
        assert backoff_seconds(2) == 60
        assert backoff_seconds(3) == 120
        assert backoff_seconds(10) == 1800  # capped at 30min


class TestProbeRules:
    def test_public_ok(self):
        r = evaluate_probe(meta())
        assert r.title == "T" and r.credits == 3 and r.duration_sec == 3600

    def test_unlisted_rejected(self):
        with pytest.raises(JobFail, match="public"):
            evaluate_probe(meta(availability="unlisted"))

    def test_subscriber_only_rejected(self):
        with pytest.raises(JobFail):
            evaluate_probe(meta(availability="subscriber_only"))

    def test_age_restricted_rejected(self):
        with pytest.raises(JobFail, match="Age-restricted"):
            evaluate_probe(meta(age_limit=18))

    def test_live_rejected(self):
        with pytest.raises(JobFail, match="Live"):
            evaluate_probe(meta(is_live=True))

    def test_zero_duration_rejected(self):
        with pytest.raises(JobFail):
            evaluate_probe(meta(duration=0))


class TestProbeSubprocess:
    def test_success(self):
        def run(*a, **kw):
            return subprocess.CompletedProcess(a[0], 0, stdout=json.dumps(meta()), stderr="")
        assert probe("http://x", runner=run).credits == 3

    def test_login_required_maps_to_clean_error(self):
        def run(*a, **kw):
            return subprocess.CompletedProcess(a[0], 1, stdout="", stderr="ERROR: Sign in to confirm your age")
        with pytest.raises(JobFail, match="private|login"):
            probe("http://x", runner=run)

    def test_generic_error(self):
        def run(*a, **kw):
            return subprocess.CompletedProcess(a[0], 1, stdout="", stderr="ERROR: some odd failure")
        with pytest.raises(JobFail, match="Couldn't read"):
            probe("http://x", runner=run)

    def test_timeout(self):
        def run(*a, **kw):
            raise subprocess.TimeoutExpired("yt-dlp", 120)
        with pytest.raises(JobFail, match="Timed out"):
            probe("http://x", runner=run)


class TestNotImplemented:
    def test_terminal_message(self):
        e = NotImplementedStage("download")
        assert "pipeline not available yet" in str(e)
        assert isinstance(e, JobFail)  # terminal: no retry
