# backend/src/main.py
import os
import joblib
import json
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv(override=True)
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

from fastapi.middleware.cors import CORSMiddleware
from . import auth, models, database, fields

# Create tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Smart-Agriculture Backend API")

app.include_router(auth.router)
app.include_router(fields.router)

# Allow CORS for local React development
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Config (will read from env)
USE_FIREBASE = os.getenv("MODEL_STORAGE", "local") == "firebase"
BUCKET_NAME = os.getenv("FIREBASE_STORAGE_BUCKET", "")
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
    current_crop: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None

@app.post("/chat")
async def chat(request: ChatRequest):
    msg = request.message
    context = request.context or {}
    
    # Extract context variables
    crop = context.get("prediction", "Unknown")
    explanation = context.get("explanation", {})
    fert_rec = explanation.get("fertilizer_recommendation", "Unknown")
    
    language = context.get("language", "en-US")
    is_malayalam = language == "ml-IN"

    system_instruction = f"""You are a helpful and knowledgeable agricultural assistant. 
    You are helping a farmer who has just received a recommendation from an ML model.

    Context:
    - Predicted suitable crop: {crop}
    - Recommended fertilizer: {fert_rec}
    - User Language: {"Malayalam" if is_malayalam else "English"}

    Answer the user's question based on the context provided. If the user asks "why", explain based on general agricultural knowledge for that crop and the fact that the soil conditions (NPK, pH, etc.) were found suitable by the model. 

    IMPORTANT:
    - If User Language is Malayalam, you MUST reply entirely in Malayalam script.
    - Keep the answer concise, encouraging, and easy to understand for a farmer."""

    try:
        model = genai.GenerativeModel('gemini-2.5-flash', system_instruction=system_instruction)
        response = await model.generate_content_async(msg)
        return {"response": response.text}
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Gemini Error Detailed: {e}")
        # Fallback to simple rule-based if Gemini fails
        if "why" in msg.lower() and crop != "Unknown":
            return {"response": f"{crop} is recommended because your soil's NPK levels and pH are optimal for its growth."}
        return {"response": f"I'm having trouble connecting to my brain right now. Error: {str(e)}"}

def download_blob_to(path_local: str, blob_path: str, bucket):
    blob = bucket.blob(blob_path)
    if not blob.exists():
        raise FileNotFoundError(f"Remote file not found in bucket: {blob_path}")
    os.makedirs(os.path.dirname(path_local), exist_ok=True)
    blob.download_to_filename(path_local)
    print(f"[backend] Downloaded {blob_path} -> {path_local}")

def download_models_from_firebase():
    if not BUCKET_NAME:
        raise RuntimeError(
            "FIREBASE_STORAGE_BUCKET is not set. "
            "Did you export the env variable?"
        )

    from google.cloud import storage

    # Resolve credentials path relative to the backend directory if it's a relative path
    creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
    if creds_path and not os.path.isabs(creds_path):
        backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        creds_path = os.path.join(backend_dir, creds_path)
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = creds_path

    client = storage.Client()  # uses GOOGLE_APPLICATION_CREDENTIALS
    bucket = client.bucket(BUCKET_NAME)

    for key, filename in FILES.items():
        remote_path = f"{MODEL_REMOTE_PREFIX}{filename}"
        remote_path = os.path.normpath(remote_path).replace(os.path.sep, "/")

        if filename.startswith("../"):
            remote_path = remote_path.replace("models/../", "")
            local_target = os.path.join(EXPL_DIR, os.path.basename(filename))
        else:
            local_target = os.path.join(MODEL_DIR, os.path.basename(filename))

        if os.path.exists(local_target):
            continue

        download_blob_to(local_target, remote_path, bucket)


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

    if not all([CROP_MODEL, FERT_MODEL, SCALER, CROP_LE, FERT_LE]):
        raise RuntimeError("One or more ML models failed to load")

    print("[backend] Models loaded successfully.")


# ✅ ADD THIS
app.mount(
    "/explanations",
    StaticFiles(directory=EXPL_DIR),
    name="explanations"
)



@app.post("/predict")
async def predict(payload: Features):
    feats = payload.features
    current_crop = payload.current_crop

    if len(feats) != 7:
        raise HTTPException(status_code=400, detail="features must be length 7: [nitrogen, phosphorus, potassium, pH, moisture, temperature, NPK_total]")
    arr = np.array(feats).reshape(1, -1)
    
    try:
        arr_s = SCALER.transform(arr)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scaler error: {e}")

    # Always predict fertilizer
    fert_idx = int(FERT_MODEL.predict(arr_s)[0])
    fert_label = str(FERT_LE.inverse_transform([fert_idx])[0])

    pred_label = "N/A"
    proba = []
    lime_examples = None
    shap_path = os.path.join(EXPL_DIR, "shap_summary.png")
    
    if not current_crop or current_crop == "None":
        # Normal prediction flow
        pred_idx = int(CROP_MODEL.predict(arr_s)[0])
        proba = CROP_MODEL.predict_proba(arr_s)[0].tolist()
        pred_label = str(CROP_LE.inverse_transform([pred_idx])[0])

        # Load LIME only if standard prediction
        lime_path = os.path.join(EXPL_DIR, "lime_examples.json")
        if os.path.exists(lime_path):
            try:
                with open(lime_path, "r") as f:
                    lime_examples = json.load(f)
            except Exception:
                lime_examples = None
    
    explanation = {
        "fertilizer_recommendation": fert_label,
        "crop_probabilities": {str(cls): float(p) for cls, p in zip(CROP_LE.classes_.tolist(), proba)} if proba else {}
    }

    # If existing crop, use Gemini for analysis
    existing_crop_analysis = None
    if current_crop and current_crop != "None":
        pred_label = current_crop # Set for frontend consistency
        try:
            prompt = f"""
            You are an expert agronomist. A farmer is currently growing '{current_crop}'.
            Soil parameters: N={feats[0]}, P={feats[1]}, K={feats[2]}, pH={feats[3]}, Moisture={feats[4]}%, Temp={feats[5]}°C.
            Recommended fertilizer: {fert_label}.

            Provide a VERY CONCISE analysis in bullet points:
            *   State which key nutrient (N, P, or K) is low based on the fertilizer recommendation.
            *   Mention if pH or moisture is within optimal range for {current_crop}.
            *   One quick action tip.
            
            Do not include headers. Just the bullets.
            """
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = await model.generate_content_async(prompt)
            existing_crop_analysis = response.text
        except Exception as e:
            print(f"Gemini analysis failed: {e}")
            
            # Fallback logic based on fertilizer
            fert_insights = {
                "Urea": [
                    "Nitrogen levels are likely low.",
                    "Urea is recommended to boost leafy growth.",
                    "Ensure adequate watering after application."
                ],
                "DAP": [
                    "Phosphorus levels appear low.",
                    "DAP will help with root development.",
                    "Nitrogen is also supplied for general health."
                ],
                "14-35-14": [
                    "High Phosphorus needed likely due to root system requirements.",
                    "Standard NPK balance required.",
                    "Apply near the root zone."
                ],
                "28-28": [
                    "Both Nitrogen and Phosphorus are needed.",
                    "Balanced growth and root support required.",
                    "Monitor soil moisture."
                ],
                "17-17-17": [
                    "Balanced nutrient deficiency detected.",
                    "Equal parts N-P-K needed for general maintenance.",
                    "Good for overall plant health."
                ],
                "20-20": [
                    "Nitrogen and Phosphorus replenishment needed.",
                    "Boosts vegetative and root growth.",
                    "Apply evenly."
                ],
                "10-26-26": [
                    "High need for Phosphorus and Potassium.",
                    "Vital for flowering and fruit setting stages.",
                    "Nitrogen requirement is lower."
                ]
            }
            
            fallback_bullets = fert_insights.get(fert_label, [
                "Nutrient imbalance detected.",
                f"The model specifically recommends {fert_label}.",
                "Check NPK ratio manually if possible."
            ])
            
            # Format as markdown bullets
            existing_crop_analysis = "\n".join([f"* {line}" for line in fallback_bullets])

    return {
        "prediction": pred_label,
        "probabilities": proba,
        "explanation": explanation,
        "shap_summary_url": f"/explanations/{os.path.basename(shap_path)}" if os.path.exists(shap_path) else None,
        "lime_examples": lime_examples,
        "existing_crop_analysis": existing_crop_analysis
    }

@app.get("/supported-crops")
def get_supported_crops():
    try:
        if CROP_LE is None:
             # Fallback if model not loaded yet (though startup event should handle it)
             return {"crops": []}
        return {"crops": CROP_LE.classes_.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok"}
