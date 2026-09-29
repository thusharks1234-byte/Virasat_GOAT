"""Serve the FastAPI backend for /api/* requests on Vercel."""

import sys
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))
sys.path.insert(0, str(root_dir / "Virasat"))

from Virasat.backend.main import app

__all__ = ["app"]
