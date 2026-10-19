import importlib
import logging
import os
import sys

import pytest

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.utils.functional import empty


def reload_settings():
    """Force Django to re-read backend/settings.py with the current env."""
    mod_name = os.environ["DJANGO_SETTINGS_MODULE"]
    if mod_name in sys.modules:
        importlib.reload(sys.modules[mod_name])
    settings._wrapped = empty  # the correct "unconfigured" sentinel


@pytest.fixture(autouse=True)
def restore_settings():
    yield
    # Undo test env changes (monkeypatch has already reverted env vars by now)
    # so later tests don't see leaked settings.
    reload_settings()


def test_environment_variables_loaded_correctly(monkeypatch):
    monkeypatch.setenv("DJANGO_SECRET_KEY", "super-secret-test-key-123")
    monkeypatch.setenv("DJANGO_DEBUG", "true")
    monkeypatch.setenv("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1,example.com")

    reload_settings()

    assert settings.SECRET_KEY == "super-secret-test-key-123"
    assert settings.DEBUG is True
    assert settings.ALLOWED_HOSTS == ["localhost", "127.0.0.1", "example.com"]


def test_empty_allowed_hosts_logs_critical(monkeypatch, caplog):
    monkeypatch.setenv("DJANGO_SECRET_KEY", "super-secret-test-key-123")
    monkeypatch.setenv("DJANGO_DEBUG", "false")
    monkeypatch.setenv("DJANGO_ALLOWED_HOSTS", "")

    # The log fires when settings.py executes, so reload INSIDE the capture
    with caplog.at_level(logging.CRITICAL):
        reload_settings()
        _ = settings.ALLOWED_HOSTS

    assert "ALLOWED HOST came out as None" in caplog.text
