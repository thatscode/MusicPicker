import logging
import os
import tempfile
from urllib.parse import urlparse

import requests
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from analysis import analyze_audio
from recommendation import get_recommendations

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI()

# ---------------------------------------------------------------------------
# CORS — restrict to the frontend origin.
# Override via ALLOWED_ORIGINS env var (comma-separated) for production.
# ---------------------------------------------------------------------------
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Limits
# ---------------------------------------------------------------------------
MAX_UPLOAD_BYTES = 100 * 1024 * 1024  # 100 MB
ALLOWED_URL_SCHEMES = {"http", "https"}
DOWNLOAD_TIMEOUT_SECONDS = 30


class UrlRequest(BaseModel):
    url: str


def _validate_url(url: str) -> None:
    """Raise HTTPException if the URL is not safe to fetch."""
    try:
        parsed = urlparse(url)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid URL format.")

    if parsed.scheme not in ALLOWED_URL_SCHEMES:
        raise HTTPException(
            status_code=400,
            detail=f"URL scheme '{parsed.scheme}' is not allowed. Use http or https.",
        )

    hostname = parsed.hostname or ""
    if not hostname:
        raise HTTPException(status_code=400, detail="URL must include a valid hostname.")

    # Block requests to loopback / private / link-local addresses (basic SSRF guard)
    blocked_prefixes = ("127.", "10.", "192.168.", "169.254.", "0.")
    if hostname == "localhost" or any(hostname.startswith(p) for p in blocked_prefixes):
        raise HTTPException(status_code=400, detail="URL points to a disallowed address.")


@app.get("/")
async def root():
    return {"message": "Music Picker API is running"}


@app.post("/analyze")
async def analyze_file(file: UploadFile = File(...)):
    # Guard against oversized uploads
    contents = await file.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum allowed size is {MAX_UPLOAD_BYTES // (1024*1024)} MB.",
        )

    suffix = os.path.splitext(file.filename or "audio")[1] or ".tmp"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(contents)
        temp_path = tmp.name

    try:
        result = analyze_audio(temp_path)
        if result is None:
            raise HTTPException(status_code=500, detail="Audio analysis failed.")
        result["filename"] = file.filename or result["filename"]
        return result
    finally:
        try:
            os.unlink(temp_path)
        except OSError as e:
            logger.warning("Could not delete temp file %s: %s", temp_path, e)


@app.post("/analyze-url")
async def analyze_url(request: UrlRequest):
    url = request.url
    _validate_url(url)

    logger.info("Downloading audio from URL: %s", url)

    try:
        response = requests.get(url, stream=True, timeout=DOWNLOAD_TIMEOUT_SECONDS)
        response.raise_for_status()
    except requests.RequestException as e:
        logger.warning("Download failed for %s: %s", url, e)
        raise HTTPException(status_code=400, detail=f"Failed to download file: {e}")

    suffix = os.path.splitext(url.split("/")[-1])[1] or ".tmp"
    suffix = "".join(c for c in suffix if c.isalnum() or c in "._-")[:10]

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        size = 0
        for chunk in response.iter_content(chunk_size=8192):
            size += len(chunk)
            if size > MAX_UPLOAD_BYTES:
                tmp.close()
                os.unlink(tmp.name)
                raise HTTPException(
                    status_code=400,
                    detail=f"Remote file exceeds size limit of {MAX_UPLOAD_BYTES // (1024*1024)} MB.",
                )
            tmp.write(chunk)
        temp_path = tmp.name

    logger.info("Download complete (%d bytes): %s", size, temp_path)

    try:
        result = analyze_audio(temp_path)
        if result is None:
            raise HTTPException(status_code=500, detail="Analysis failed — file may not be valid audio.")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unexpected error processing URL %s: %s", url, e)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            os.unlink(temp_path)
        except OSError as e:
            logger.warning("Could not delete temp file %s: %s", temp_path, e)


@app.get("/recommend")
async def recommend_endpoint(genre: str = None):
    return get_recommendations(genre)
