"""Health check routes."""

import time

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "ok", "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")}
    return {"status": "ok", "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")}
