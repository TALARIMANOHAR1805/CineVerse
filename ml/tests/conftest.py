"""
CineVerse ML — conftest.py

Shared pytest fixtures and configuration for the test suite.

Author: Koushik-31368
"""

import sys
import os
import pytest

# Ensure the ml/ directory is on PYTHONPATH so `from app.xxx import yyy` works
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture(scope="session")
def sample_rgb():
    """A sample RGB tuple for testing colour utilities."""
    return (124, 111, 255)


@pytest.fixture(scope="session")
def sample_hex():
    """The expected hex string for the sample RGB tuple."""
    return "#7c6fff"


@pytest.fixture(scope="session")
def long_text():
    """A long text string for truncation tests."""
    return "A" * 500
