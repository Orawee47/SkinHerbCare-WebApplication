# app.py - YOLO FastAPI (HuggingFace + GitHub Release model)
# Ready to deploy on HF Spaces (Docker, port 7860)

import io
import os
import time
import hashlib
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional


import numpy as np
from PIL import Image
from fastapi import (
    FastAPI,
    File,
    UploadFile,
    HTTPException,
    Request,
    Header,
    Depends,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from ultralytics import YOLO
from fastapi.responses import HTMLResponse

# =========================
# ENV CONFIG
# =========================
API_KEY = os.getenv("API_KEY")

GITHUB_RELEASE_MODEL_URL = os.getenv("GITHUB_RELEASE_MODEL_URL", "").strip()
MODEL_DIR = os.getenv("MODEL_DIR", "models")
MODEL_FILENAME = os.getenv("MODEL_FILENAME", "best.pt")
MODEL_SHA256 = os.getenv("MODEL_SHA256", "").strip()
MODEL_DOWNLOAD_TIMEOUT = int(os.getenv("MODEL_DOWNLOAD_TIMEOUT", "300"))

MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "5"))
MAX_IMAGE_SIDE = int(os.getenv("MAX_IMAGE_SIDE", "1280"))

# =========================
# CLASS NAMES (MUST MATCH TRAINING)
# =========================
CLASS_NAMES = [
    "Alovera",
    "cucumber",
    "Galanga",
    "Garlic",
    "horapa",
    "Houttuynia_cordata",
    "Ivy_Gourd",
    "khaproa",
    "Mangosteen_Peel",
    "pluleaf",
    "Snake_Plant",
    "Turmeric",
]

# =========================
# FASTAPI INIT
# =========================
app = FastAPI(title="YOLO SkinHerb API", version="4.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# MODEL DOWNLOAD
# =========================
def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def ensure_model_local() -> str:
    if not GITHUB_RELEASE_MODEL_URL:
        raise RuntimeError("GITHUB_RELEASE_MODEL_URL not set")

    model_dir = Path(MODEL_DIR)
    model_dir.mkdir(parents=True, exist_ok=True)

    local_path = model_dir / MODEL_FILENAME
    tmp_path = model_dir / (MODEL_FILENAME + ".download")

    # Already exists
    if local_path.exists() and local_path.stat().st_size > 0:
        return str(local_path)

    print("Downloading model from GitHub Release...")
    try:
        req = urllib.request.Request(
            GITHUB_RELEASE_MODEL_URL,
            headers={"User-Agent": "Mozilla/5.0"},
        )
        with urllib.request.urlopen(req, timeout=MODEL_DOWNLOAD_TIMEOUT) as r:
            with tmp_path.open("wb") as f:
                while True:
                    chunk = r.read(1024 * 1024)
                    if not chunk:
                        break
                    f.write(chunk)

        if tmp_path.stat().st_size == 0:
            raise RuntimeError("Downloaded model is empty")

        if MODEL_SHA256:
            if sha256_file(tmp_path).lower() != MODEL_SHA256.lower():
                tmp_path.unlink(missing_ok=True)
                raise RuntimeError("Model SHA256 mismatch")

        tmp_path.replace(local_path)
        print("Model download complete")
        return str(local_path)

    except Exception as e:
        tmp_path.unlink(missing_ok=True)
        raise RuntimeError(f"Model download failed: {e}")


# =========================
# LOAD MODEL
# =========================
try:
    LOCAL_MODEL_PATH = ensure_model_local()
    model = YOLO(LOCAL_MODEL_PATH)
    print("Model loaded successfully")
except Exception as e:
    raise RuntimeError(f"Failed to load YOLO model: {e}")


# =========================
# HELPERS
# =========================
def get_class_name(cls_id: int) -> str:
    if 0 <= cls_id < len(CLASS_NAMES):
        return CLASS_NAMES[cls_id]
    return f"unknown_{cls_id}"


def to_label_key(name: str) -> str:
    return name.strip().lower().replace(" ", "_").replace("-", "_")


def require_api_key(x_api_key: str = Header(default="", alias="x-api-key")):
    if not API_KEY:
        raise HTTPException(status_code=500, detail="API_KEY not set")
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")


# =========================
# ROUTES
# =========================
@app.get("/")
def root():
    return {
        "ok": True,
        "model_source": "github_release",
        "model_path": LOCAL_MODEL_PATH,
        "num_classes": len(CLASS_NAMES),
    }


@app.get("/health")
def health():
    return {"ok": True, "status": "healthy"}


@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    _: Any = Depends(require_api_key),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Upload image file")

    img_bytes = await file.read()
    if len(img_bytes) > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large")

    pil = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    orig_w, orig_h = pil.size

    # Resize for speed
    longest = max(orig_w, orig_h)
    if longest > MAX_IMAGE_SIDE:
        scale = MAX_IMAGE_SIDE / longest
        new_w = int(orig_w * scale)
        new_h = int(orig_h * scale)
        pil = pil.resize((new_w, new_h))

    img_np = np.array(pil)

    start = time.time()
    results = model.predict(img_np, verbose=False)
    end = time.time()

    r = results[0]
    detections = []

    if r.boxes is not None and len(r.boxes) > 0:
        boxes = r.boxes.xyxy.cpu().numpy()
        confs = r.boxes.conf.cpu().numpy()
        clss = r.boxes.cls.cpu().numpy()

        for box, conf, cls_id in zip(boxes, confs, clss):
            cls_id = int(cls_id)
            class_name = get_class_name(cls_id)

            detections.append(
                {
                    "class_id": cls_id,
                    "class_name": class_name,
                    "label_key": to_label_key(class_name),
                    "confidence": round(float(conf), 4),
                    "box": {
                        "x1": int(box[0]),
                        "y1": int(box[1]),
                        "x2": int(box[2]),
                        "y2": int(box[3]),
                    },
                }
            )

    return {
        "ok": True,
        "inference_ms": int((end - start) * 1000),
        "detections": detections,
    }

@app.get("/predict", response_class=HTMLResponse)
def predict_page():
    return """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>YOLO Predict Test</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 680px; margin: 40px auto; }
    input, button { margin-top: 10px; width: 100%; }
    button { width: auto; padding: 8px 14px; }
    pre { background: #f4f4f4; padding: 10px; overflow-x: auto; }
    .row { margin-bottom: 12px; }
  </style>
</head>
<body>
  <h2>YOLO /predict – Test Page</h2>
  <p>Upload an image and call POST /predict with x-api-key.</p>

  <div class="row">
    <label>API Key</label><br/>
    <input type="text" id="apiKey" placeholder="Enter API Key" />
  </div>

  <div class="row">
    <label>Select image</label><br/>
    <input type="file" id="fileInput" accept="image/*" />
  </div>

  <button onclick="send()">Predict</button>

  <h3>Response</h3>
  <pre id="output">-</pre>

  <script>
    async function send() {
      const apiKey = document.getElementById("apiKey").value;
      const fileInput = document.getElementById("fileInput");
      const output = document.getElementById("output");

      if (!apiKey) { alert("Please enter API key"); return; }
      if (!fileInput.files.length) { alert("Please select an image"); return; }

      const formData = new FormData();
      formData.append("file", fileInput.files[0]);

      output.textContent = "Sending...";

      try {
        const res = await fetch("/predict", {
          method: "POST",
          headers: { "x-api-key": apiKey },
          body: formData
        });
        const text = await res.text();
        output.textContent = text;
      } catch (err) {
        output.textContent = err.toString();
      }
    }
  </script>
</body>
</html>
"""
@app.get("/env-check")
def env_check():
    return {
        "api_key_set": bool(API_KEY),
        "model_url_set": bool(GITHUB_RELEASE_MODEL_URL),
        "model_filename": MODEL_FILENAME,
        "model_dir": MODEL_DIR,
    }
