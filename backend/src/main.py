from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import os
import json

app = FastAPI(title="Smart Agriculture Backend API")

# Path to ML models (these will be downloaded from Firebase)
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(MODEL_DIR, exist_ok=True)

CROP_MODEL_FILE = os.path.join(MODEL_DIR, "crop_recommendation.joblib")
FERT_MODEL_FILE = os.path.join(MODEL_DIR, "fertilizer_model.joblib")
SCALER_FILE = os.path.join(MODEL_DIR, "scaler.joblib")
CROP_LE_FILE = os.path.join(MODEL_DIR, "label_encoder_crop.joblib")
FERT_LE_FILE = os.path.join(MODEL_DIR, "label_encoder_fert.joblib")

class Features(BaseModel):
    features: list  # [N, P, K, pH, moisture, temperature, NPK_total]

def load_models():
    try:
        crop_model = joblib.load(CROP_MODEL_FILE)
        fert_model = joblib.load(FERT_MODEL_FILE)
        scaler = joblib.load(SCALER_FILE)
        crop_le = joblib.load(CROP_LE_FILE)
        fert_le = joblib.load(FERT_LE_FILE)
        return crop_model, fert_model, scaler, crop_le, fert_le
    except Exception as e:
        raise RuntimeError(f"Model loading error: {e}")

@app.on_event("startup")
def startup_event():
    global crop_model, fert_model, scaler, crop_le, fert_le
    crop_model, fert_model, scaler, crop_le, fert_le = load_models()
    print("ML models loaded successfully!")

@app.post("/predict")
def predict(payload: Features):
    if len(payload.features) != 7:
        raise HTTPException(status_code=400, detail="Feature length must be exactly 7")
    
    arr = np.array(payload.features).reshape(1, -1)
    arr_scaled = scaler.transform(arr)

    crop_idx = int(crop_model.predict(arr_scaled)[0])
    fert_idx = int(fert_model.predict(arr_scaled)[0])

    crop_label = crop_le.inverse_transform([crop_idx])[0]
    fert_label = fert_le.inverse_transform([fert_idx])[0]

    crop_prob = crop_model.predict_proba(arr_scaled)[0].tolist()

    return {
        "crop_prediction": crop_label,
        "crop_probabilities": crop_prob,
        "fertilizer_recommendation": fert_label
    }

@app.get("/health")
def health():
    return {"status": "backend running"}
