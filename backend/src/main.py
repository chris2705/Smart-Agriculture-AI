# backend/src/main.py
import os
import joblib
import json
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google.cloud import storage  # uses GOOGLE_APPLICATION_CREDENTIALS env var
from typing import Optional
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Smart-Agriculture Backend API")

# Config (will read from env)
USE_FIREBASE = os.getenv("MODEL_STORAGE", "local") == "firebase"
BUCKET_NAME = os.getenv("FIREBASE_BUCKET", "")
MODEL_REMOTE_PREFIX = os.getenv("MODEL_REMOTE_PREFIX", "models/")  # ends with slash

# Local model folder (inside backend)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MODEL_DIR = os.path.join(BASE_DIR, "backend_models")         # where models will be stored
EXPL_DIR = os.path.join(BASE_DIR, "backend_explanations")   # where explanations will be stored
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(EXPL_DIR, exist_ok=True)

# Filenames expected in the bucket under MODEL_REMOTE_PREFIX
FILES = {
    "crop_model": "crop_recommendation.joblib",
    "fert_model": "fertilizer_model.joblib",
    "scaler": "scaler.joblib",
    "crop_le": "label_encoder_crop.joblib",
    "fert_le": "label_encoder_fert.joblib",
    "shap": "../explanations/shap_summary.png",       # relative to models/ in bucket
    "lime": "../explanations/lime_examples.json"
}

class Features(BaseModel):
    features: list  # [nitrogen, phosphorus, potassium, pH, moisture, temperature, NPK_total]

def download_blob_to(path_local: str, blob_path: str, bucket):
    blob = bucket.blob(blob_path)
    if not blob.exists():
        raise FileNotFoundError(f"Remote file not found in bucket: {blob_path}")
    os.makedirs(os.path.dirname(path_local), exist_ok=True)
    blob.download_to_filename(path_local)
    print(f"[backend] Downloaded {blob_path} -> {path_local}")

def download_models_from_firebase():
    if not BUCKET_NAME:
        raise RuntimeError("FIREBASE_BUCKET not set. Cannot download models.")
    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)
    # download model files into MODEL_DIR / EXPL_DIR
    for key, filename in FILES.items():
        # Build remote path (handle "../" for explanations)
        remote_path = f"{MODEL_REMOTE_PREFIX}{filename}" if not filename.startswith("../") else f"{MODEL_REMOTE_PREFIX}{filename}"
        remote_path = os.path.normpath(remote_path).replace(os.path.sep, "/")
        if filename.startswith("../"):
            # explanation files: move up from models/ -> explanations/
            # remote_path like "models/../explanations/shap_summary.png" -> normalized -> "explanations/shap_summary.png"
            remote_path = remote_path.replace("models/../", "")
            local_target = os.path.join(EXPL_DIR, os.path.basename(filename))
        else:
            local_target = os.path.join(MODEL_DIR, os.path.basename(filename))
        try:
            download_blob_to(local_target, remote_path, bucket)
        except Exception as e:
            print(f"[backend] Warning: could not download {remote_path}: {e}")

def load_models_local():
    try:
        crop_model = joblib.load(os.path.join(MODEL_DIR, FILES["crop_model"]))
        fert_model = joblib.load(os.path.join(MODEL_DIR, FILES["fert_model"]))
        scaler = joblib.load(os.path.join(MODEL_DIR, FILES["scaler"]))
        crop_le = joblib.load(os.path.join(MODEL_DIR, FILES["crop_le"]))
        fert_le = joblib.load(os.path.join(MODEL_DIR, FILES["fert_le"]))
        return crop_model, fert_model, scaler, crop_le, fert_le
    except Exception as e:
        raise RuntimeError(f"Error loading local models: {e}")

@app.on_event("startup")
def startup_event():
    global CROP_MODEL, FERT_MODEL, SCALER, CROP_LE, FERT_LE
    if USE_FIREBASE:
        print("[backend] Downloading models from Firebase Storage...")
        download_models_from_firebase()
    print("[backend] Loading models from disk...")
    CROP_MODEL, FERT_MODEL, SCALER, CROP_LE, FERT_LE = load_models_local()
    print("[backend] Models loaded successfully.")

# Serve explanations as static files so frontend can fetch them
app.mount("/static_explanations", StaticFiles(directory=EXPL_DIR), name="explanations")

@app.post("/predict")
def predict(payload: Features):
    feats = payload.features
    if len(feats) != 7:
        raise HTTPException(status_code=400, detail="features must be length 7: [nitrogen, phosphorus, potassium, pH, moisture, temperature, NPK_total]")
    arr = np.array(feats).reshape(1, -1)
    try:
        arr_s = SCALER.transform(arr)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scaler error: {e}")
    pred_idx = int(CROP_MODEL.predict(arr_s)[0])
    proba = CROP_MODEL.predict_proba(arr_s)[0].tolist()
    pred_label = str(CROP_LE.inverse_transform([pred_idx])[0])

    fert_idx = int(FERT_MODEL.predict(arr_s)[0])
    fert_label = str(FERT_LE.inverse_transform([fert_idx])[0])

    # Try to attach shap/lime if downloaded
    shap_path = os.path.join(EXPL_DIR, "shap_summary.png")
    lime_path = os.path.join(EXPL_DIR, "lime_examples.json")
    lime_examples = None
    if os.path.exists(lime_path):
        try:
            with open(lime_path, "r") as f:
                lime_examples = json.load(f)
        except Exception:
            lime_examples = None

    explanation = {
        "fertilizer_recommendation": fert_label,
        "crop_probabilities": {str(cls): float(p) for cls, p in zip(CROP_LE.classes_.tolist(), proba)}
    }

    return {
        "prediction": pred_label,
        "probabilities": proba,
        "explanation": explanation,
        "shap_summary_url": f"/static_explanations/{os.path.basename(shap_path)}" if os.path.exists(shap_path) else None,
        "lime_examples": lime_examples
    }

@app.get("/health")
def health():
    return {"status": "ok"}
