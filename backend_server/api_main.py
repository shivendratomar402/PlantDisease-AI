"""
==============================================================
  Plant Disease Detection – FastAPI Backend
  File   : backend_server/api_main.py
  Run    : uvicorn backend_server.api_main:app --reload --port 8000
           (from the PlantDisease-AI root)
==============================================================
"""

import io
import json
import pathlib
from pathlib import Path
from typing import Dict

import numpy as np
from PIL import Image
import tensorflow as tf
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ─────────────────────────────────────────────────────────────
# 1.  PATHS & CONSTANTS
# ─────────────────────────────────────────────────────────────
BASE_DIR        = Path(__file__).resolve().parent.parent   # project root
MODEL_PATH_H5   = BASE_DIR / "ai_brain" / "saved_model.h5"
MODEL_PATH_KERAS= BASE_DIR / "ai_brain" / "saved_model.keras"
CLASS_MAP_PATH  = BASE_DIR / "ai_brain" / "class_indices.json"
IMG_SIZE        = (256, 256)

# Exact alphabetical order matching dataset subfolders:
CLASS_NAMES = [
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
]

idx_to_class: Dict[int, str] = {i: name for i, name in enumerate(CLASS_NAMES)}

# If class_indices.json exists, verify / sync with it
if CLASS_MAP_PATH.exists():
    try:
        with open(CLASS_MAP_PATH, "r") as f:
            saved_map: Dict[str, int] = json.load(f)
        idx_to_class = {v: k for k, v in saved_map.items()}
    except Exception as e:
        print(f"Notice: Using default CLASS_NAMES list ({e})")

ALLOWED_TYPES   = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_FILE_MB     = 10

# ─────────────────────────────────────────────────────────────
# 2.  BIOLOGICAL METADATA PER DISEASE CLASS
# ─────────────────────────────────────────────────────────────
DISEASE_INFO: Dict[str, dict] = {
    "Potato___Early_blight": {
        "display_name": "Early Blight",
        "pathogen": "Alternaria solani",
        "severity": "Moderate",
        "treatment": (
            "• Remove heavily affected leaves and manage infected crop residues according to local guidance.\n"
            "• Use healthy, certified seed tubers and rotate crops where practical.\n"
            "• Maintain adequate plant spacing and airflow; avoid prolonged leaf wetness.\n"
            "• Prefer soil-level or drip irrigation over overhead watering.\n"
            "• Maintain balanced crop nutrition and monitor older leaves regularly.\n"
            "• If disease continues to spread, ask a local agricultural extension officer about products registered for potato early blight in your area; follow the label exactly."
        ),
    },
    "Potato___Late_blight": {
        "display_name": "Late Blight",
        "pathogen": "Phytophthora infestans",
        "severity": "High – Epidemic Risk",
        "treatment": (
            "• Treat suspected late blight as urgent and contact a local agricultural extension officer promptly.\n"
            "• Remove and dispose of infected plant material according to local phytosanitary guidance; do not move suspect material between fields.\n"
            "• Reduce leaf wetness: avoid overhead irrigation and improve airflow where practical.\n"
            "• Use certified disease-free seed tubers and locally recommended resistant varieties where available.\n"
            "• Only use products registered for potato late blight in your region; follow label directions, protective equipment and pre-harvest intervals.\n"
            "• Monitor nearby plants frequently because outbreaks can spread rapidly in cool, wet conditions."
        ),
    },
    "Potato___healthy": {
        "display_name": "Healthy",
        "pathogen": "None detected",
        "severity": "None",
        "treatment": (
            "• No disease intervention is indicated by this image screening result.\n"
            "• Continue routine field scouting, especially after wet weather.\n"
            "• Use healthy seed tubers and maintain good field hygiene.\n"
            "• Water consistently and avoid keeping foliage wet for long periods.\n"
            "• Maintain balanced nutrition based on crop needs and soil testing where available.\n"
            "• This result does not rule out early infection or diseases outside the model's three classes."
        ),
    },
}

# ─────────────────────────────────────────────────────────────
# 3.  LOAD MODEL
# ─────────────────────────────────────────────────────────────
model = None

def get_model():
    global model
    if model is not None:
        return model
    for p in [MODEL_PATH_H5, MODEL_PATH_KERAS]:
        if p.exists():
            try:
                print(f"⏳  Loading model from {p} …")
                model = tf.keras.models.load_model(str(p))
                print(f"✅  Model loaded successfully from {p}")
                return model
            except Exception as e:
                print(f"⚠  Failed to load {p}: {e}")
    return None

# Attempt initial load
get_model()

# ─────────────────────────────────────────────────────────────
# 4.  FASTAPI APP
# ─────────────────────────────────────────────────────────────
app = FastAPI(
    title       = "🌿 Plant Disease Detection API",
    description = "AI-powered potato leaf disease classifier (Early Blight / Late Blight / Healthy)",
    version     = "1.0.0",
    docs_url    = "/docs",
    redoc_url   = "/redoc",
)

# Allow calls from Next.js dev server and any production domain
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["*"],
    allow_credentials = False,
    allow_methods     = ["GET", "POST", "OPTIONS"],
    allow_headers     = ["*"],
)

# ─────────────────────────────────────────────────────────────
# 5.  RESPONSE SCHEMA
# ─────────────────────────────────────────────────────────────
class PredictionResponse(BaseModel):
    success       : bool
    cls           : str           # e.g. "Early Blight"
    pathogen      : str           # scientific name
    confidence    : float         # 0–100
    severity      : str
    treatment     : str
    all_scores    : dict          # {class: confidence%} for progress bars

# ─────────────────────────────────────────────────────────────
# 6.  HELPER: IMAGE PREPROCESSING
# ─────────────────────────────────────────────────────────────
def preprocess(image_bytes: bytes) -> np.ndarray:
    """
    1. Load image in RGB format using PIL (not OpenCV BGR).
    2. Resize to exact (256, 256) expected by the CNN model.
    3. Normalize by 255.0 once (matching training ImageDataGenerator rescale=1./255).
    """
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as exc:
        raise ValueError(f"Could not decode image with PIL: {exc}")

    image = image.resize(IMG_SIZE, Image.Resampling.BILINEAR)
    img_arr = np.array(image, dtype="float32") / 255.0
    return np.expand_dims(img_arr, axis=0)   # shape (1, 256, 256, 3)

# ─────────────────────────────────────────────────────────────
# 7.  ROUTES
# ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {"status": "online", "message": "Plant Disease Detection API is running 🌿"}


@app.get("/health", tags=["Health"])
def health():
    active_model = get_model()
    return {"status": "healthy", "model_loaded": active_model is not None}


@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict(file: UploadFile = File(..., description="Leaf image (JPEG / PNG)")):
    active_model = get_model()
    if active_model is None:
        raise HTTPException(
            status_code=503,
            detail="Model is not yet loaded. Please ensure training has completed and saved_model.h5 is generated.",
        )

    # ── File type validation ──────────────────────────────────
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: '{file.content_type}'. Upload JPEG or PNG.",
        )

    contents = await file.read()

    # ── File size check ───────────────────────────────────────
    if len(contents) > MAX_FILE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed size is {MAX_FILE_MB} MB.",
        )

    # ── Inference ─────────────────────────────────────────────
    try:
        img_arr  = preprocess(contents)
        probs    = active_model.predict(img_arr, verbose=0)[0]    # (num_classes,)
        predictions = probs.tolist()

        # Print raw predictions as requested for debugging
        print("Raw predictions:", predictions)

        pred_idx = int(np.argmax(probs))
        confidence = float(probs[pred_idx]) * 100

        pred_class = idx_to_class.get(pred_idx, CLASS_NAMES[pred_idx] if pred_idx < len(CLASS_NAMES) else "Unknown")
        info       = DISEASE_INFO.get(pred_class, {})

        print(f"Predicted class: {pred_class} (Index: {pred_idx}, Confidence: {confidence:.2f}%)")

        # Build all_scores dict for the frontend bar chart
        all_scores = {
            DISEASE_INFO.get(idx_to_class[i], {}).get("display_name", idx_to_class[i]):
            round(float(probs[i]) * 100, 2)
            for i in range(len(probs))
        }

        return PredictionResponse(
            success    = True,
            cls        = info.get("display_name", pred_class),
            pathogen   = info.get("pathogen", "—"),
            confidence = round(confidence, 2),
            severity   = info.get("severity", "Unknown"),
            treatment  = info.get("treatment", "Consult an agronomist."),
            all_scores = all_scores,
        )

    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inference failed: {exc}")
