"""Logging setup for backend service."""

import logging
import sys

from backend.app.config.settings import settings


def setup_logging():
    """Configure structured console logging."""
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)
    
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )
