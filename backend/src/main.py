# backend/src/main.py
import os
import joblib
import numpy as np
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles

# Config via env
USE_FIREBASE = os.getenv("MODEL_STORAGE", "local") == "firebase"
FIREBASE_BUCKET = os.getenv("FIREBASE_BUCKET", "")
MODEL_REMOTE_PREFIX = os.getenv("MODEL_REMOTE_PREFIX", "models/")

# Paths (local destination)
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MODEL_DIR = os.path.join(ROOT, "ml", "models")
EXPL_DIR = os.path.join(ROOT, "ml", "explanations")
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(EXPL_DIR, exist_ok=True)

# filenames expected in bucket or local
CROP_MODEL_FILE = "crop_recommendation.joblib"
FERT_MODEL_FILE = "fertilizer_model.joblib"
SCALER_FILE = "scaler.joblib"
CROP_LE_FILE = "label_encoder_crop.joblib"
FERT_LE_FILE = "label_encoder_fert.joblib"

# full local paths
CROP_MODEL_PATH = os.path.join(MODEL_DIR, CROP_MODEL_FILE)
FERT_MODEL_PATH = os.path.join(MODEL_DIR, FERT_MODEL_FILE)
SCALER_PATH = os.path.join(MODEL_DIR, SCALER_FILE)
CROP_LE_PATH = os.path.join(MODEL_DIR, CROP_LE_FILE)
FERT_LE_PATH = os.path.join(MODEL_DIR, FERT_LE_FILE)
SHAP_SUMMARY_PATH = os.path.join(EXPL_DIR, "shap_summary.png")
LIME_JSON_PATH = os.path.join(EXPL_DIR, "lime_examples.json")

app = FastAPI(title="Smart Agriculture Backend API")

# serve explanations statically so frontend can fetch: /explanations/...
app.mount("/explanations", StaticFiles(directory=EXPL_DIR), name="explanations")

class Features(BaseModel):
    features: list  # [nitrogen, phosphorus, potassium, pH, moisture, temperature, NPK_total]

def download_models_from_firebase():
    # downloads files from Google Cloud Storage to MODEL_DIR
    try:
        from google.cloud import storage
    except Exception as e:
        raise RuntimeError("google-cloud-storage not installed or failed import") from e

    if not FIREBASE_BUCKET:
        raise RuntimeError("FIREBASE_BUCKET not set")

    client = storage.Client()
    bucket = client.bucket(FIREBASE_BUCKET)

    files = [CROP_MODEL_FILE, FERT_MODEL_FILE, SCALER_FILE, CROP_LE_FILE, FERT_LE_FILE]
    for f in files:
        remote = f"{MODEL_REMOTE_PREFIX}{f}"
        dest = os.path.join(MODEL_DIR, f)
        blob = bucket.blob(remote)
        if not blob.exists():
            raise FileNotFoundError(f"Model not found in bucket: {remote}")
        print(f"[backend] Downloading {remote} -> {dest}")
        blob.download_to_filename(dest)

    # optionally download explanations (if uploaded)
    try:
        shap_remote = f"{MODEL_REMOTE_PREFIX}../explanations/shap_summary.png"
        blob = bucket.blob(shap_remote)
        if blob.exists():
            blob.download_to_filename(SHAP_SUMMARY_PATH)
    except Exception:
        pass

def load_models_local():
    # Load required models from local MODEL_DIR
    try:
        crop_model = joblib.load(CROP_MODEL_PATH)
        fert_model = joblib.load(FERT_MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        crop_le = joblib.load(CROP_LE_PATH)
        fert_le = joblib.load(FERT_LE_PATH)
    except Exception as e:
        raise RuntimeError(f"Error loading model(s): {e}")
    return crop_model, fert_model, scaler, crop_le, fert_le

@app.on_event("startup")
def startup_event():
    global CROP_MODEL, FERT_MODEL, SCALER, CROP_LE, FERT_LE
    if USE_FIREBASE:
        print("[backend] MODE = firebase -> downloading models from bucket")
        download_models_from_firebase()
    else:
        print("[backend] MODE = local -> expecting models present in ml/models/")

    CROP_MODEL, FERT_MODEL, SCALER, CROP_LE, FERT_LE = load_models_local()
    print("[backend] Models loaded. Ready.")

@app.post("/predict")
def predict(payload: Features):
    feats = payload.features
    if not isinstance(feats, list) or len(feats) != 7:
        raise HTTPException(status_code=400, detail="features must be list length 7: [N,P,K,pH,moisture,temperature,NPK_total]")

    arr = np.array(feats).reshape(1, -1)
    try:
        arr_s = SCALER.transform(arr)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scaler error: {e}")

    # crop prediction
    crop_idx = int(CROP_MODEL.predict(arr_s)[0])
    crop_prob = CROP_MODEL.predict_proba(arr_s)[0].tolist()
    crop_label = CROP_LE.inverse_transform([crop_idx])[0]

    # fertilizer prediction
    fert_idx = int(FERT_MODEL.predict(arr_s)[0])
    fert_label = FERT_LE.inverse_transform([fert_idx])[0]

    explanation = {
        "fertilizer_recommendation": str(fert_label),
        "crop_probabilities": {str(cls): float(p) for cls, p in zip(CROP_LE.classes_.tolist(), crop_prob)}
    }

    shap_url = None
    if os.path.exists(SHAP_SUMMARY_PATH):
        shap_url = f"/explanations/{os.path.basename(SHAP_SUMMARY_PATH)}"

    lime_examples = None
    if os.path.exists(LIME_JSON_PATH):
        try:
            with open(LIME_JSON_PATH, "r") as f:
                lime_examples = json.load(f)
        except Exception:
            lime_examples = None

    return {
        "prediction": str(crop_label),
        "probabilities": crop_prob,
        "explanation": explanation,
        "shap_summary_url": shap_url,
        "lime_examples": lime_examples
    }

@app.get("/health")
def health():
    return {"status": "ok"}
