# backend/src/main.py


import os
import joblib
import numpy as np
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import gdown


from . import auth, models, database, fields

# ===============================
# ENVIRONMENT
# ===============================
load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = "meta-llama/llama-3.3-70b-instruct:free"
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

SYSTEM_PROMPT = (
    "You are a helpful smart-farming AI assistant. "
    "Give short, practical answers (3-5 sentences max) focused on agriculture, "
    "crops, soil health, fertilizers, and pest control. "
    "Avoid lengthy introductions or filler text."
)

if not OPENROUTER_API_KEY:
    print("⚠ OPENROUTER_API_KEY not set. Chat disabled.")

# ===============================
# DATABASE
# ===============================
models.Base.metadata.create_all(bind=database.engine)

# ===============================
# FASTAPI INIT
# ===============================
app = FastAPI(title="Smart-Agriculture Backend API")

# ===============================
# CORS — must be added BEFORE routers so it wraps all responses
# (including 4xx/5xx errors and OPTIONS preflight requests)
# ===============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://smart-agriculture-ai.vercel.app",
        "https://smartagri.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(fields.router)

# ===============================
# MODEL DIRECTORY (Railway Safe)
# ===============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

# ===============================
# GOOGLE DRIVE DIRECT LINKS
# (REPLACE WITH YOUR LINKS)
# ===============================
CROP_MODEL_ID = "1ujgYFRPIHpi1E2Zg-oePAddC7-4PYpDN"
FERT_MODEL_ID = "1APYnk3VrMPwGEHz5jKftAUwJgutqhQ0J"
CROP_LE_ID = "11JyTimrKC2cddYzp6FpwoQrcgcw_nS0t"
FERT_LE_ID = "1OkPayypZxxDQmq1fe4c-jGX7qRUywvKA"
CROP_TYPE_LE_ID = "1w_i_BnCTOO3hYaw3uC0AKjpZr4bGKrwZ"
SOIL_TYPE_LE_ID = "1dKf0B9wE-KXZdzTVnNGosqptZ0e1Ly5W"

# ===============================
# DOWNLOAD HELPER
# ===============================
def download_file_from_google_drive(file_id, destination):
    url = f"https://drive.google.com/uc?id={file_id}"
    gdown.download(url, destination, quiet=False)

# ===============================
# REQUEST MODELS
# ===============================
class CropFeatures(BaseModel):
    n: float
    p: float
    k: float
    temperature: float
    ph: float

class FertilizerFeatures(BaseModel):
    n: float
    p: float
    k: float
    temperature: float
    moisture: float
    crop_type: str
    soil_type: str

class ChatMessage(BaseModel):
    role: str          # "user" or "model"
    text: str

class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None
    history: Optional[list[ChatMessage]] = []

# ===============================
# MODEL LOADING
# ===============================
def load_models():
    crop_model = joblib.load(os.path.join(MODEL_DIR, "crop_recommendation.joblib"))
    fert_model = joblib.load(os.path.join(MODEL_DIR, "fertilizer_model.joblib"))
    crop_le = joblib.load(os.path.join(MODEL_DIR, "label_encoder_crop.joblib"))
    fert_le = joblib.load(os.path.join(MODEL_DIR, "label_encoder_fert.joblib"))
    crop_type_le = joblib.load(os.path.join(MODEL_DIR, "label_encoder_crop_type.joblib"))
    soil_type_le = joblib.load(os.path.join(MODEL_DIR, "label_encoder_soil_type.joblib"))

    return crop_model, fert_model, crop_le, fert_le, crop_type_le, soil_type_le

@app.on_event("startup")
def startup_event():
    global CROP_MODEL, FERT_MODEL
    global CROP_LE, FERT_LE
    global CROP_TYPE_LE, SOIL_TYPE_LE

    print("Checking ML model files...")

    files = [
        ("crop_recommendation.joblib", CROP_MODEL_ID),
        ("fertilizer_model.joblib", FERT_MODEL_ID),
        ("label_encoder_crop.joblib", CROP_LE_ID),
        ("label_encoder_fert.joblib", FERT_LE_ID),
        ("label_encoder_crop_type.joblib", CROP_TYPE_LE_ID),
        ("label_encoder_soil_type.joblib", SOIL_TYPE_LE_ID),
    ]

    for filename, file_id in files:
        file_path = os.path.join(MODEL_DIR, filename)
        if not os.path.exists(file_path):
            print(f"Downloading {filename}...")
            download_file_from_google_drive(file_id, file_path)

    print("Loading models...")

    CROP_MODEL = joblib.load(os.path.join(MODEL_DIR, "crop_recommendation.joblib"))
    FERT_MODEL = joblib.load(os.path.join(MODEL_DIR, "fertilizer_model.joblib"))
    CROP_LE = joblib.load(os.path.join(MODEL_DIR, "label_encoder_crop.joblib"))
    FERT_LE = joblib.load(os.path.join(MODEL_DIR, "label_encoder_fert.joblib"))
    CROP_TYPE_LE = joblib.load(os.path.join(MODEL_DIR, "label_encoder_crop_type.joblib"))
    SOIL_TYPE_LE = joblib.load(os.path.join(MODEL_DIR, "label_encoder_soil_type.joblib"))

    print("Models loaded successfully.")
# ===============================
# 🌱 CROP PREDICTION
# ===============================
@app.post("/predict/crop")
def predict_crop(data: CropFeatures):
    try:
        features = [data.n, data.p, data.k, data.temperature, data.ph]
        pred_idx = int(CROP_MODEL.predict([features])[0])
        crop_name = str(CROP_LE.inverse_transform([pred_idx])[0])
        proba = CROP_MODEL.predict_proba([features])[0].tolist()

        return {
            "success": True,
            "prediction": crop_name,
            "probabilities": proba,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===============================
# 🧪 FERTILIZER PREDICTION
# ===============================
@app.post("/predict/fertilizer")
def predict_fertilizer(data: FertilizerFeatures):
    try:
        crop_enc = CROP_TYPE_LE.transform([data.crop_type])[0]
        soil_enc = SOIL_TYPE_LE.transform([data.soil_type])[0]

        features = [
            data.n,
            data.p,
            data.k,
            data.temperature,
            data.moisture,
            crop_enc,
            soil_enc,
        ]

        pred_idx = int(FERT_MODEL.predict([features])[0])
        fert_name = str(FERT_LE.inverse_transform([pred_idx])[0])

        return {"success": True, "prediction": fert_name}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===============================
# 💬 CHAT
# ===============================
@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        if not OPENROUTER_API_KEY:
            return {"response": "AI service unavailable — OPENROUTER_API_KEY not configured."}

        # Build a context-aware system prompt
        ctx = request.context or {}
        ctx_lines = []
        if ctx.get("prediction"):
            ctx_lines.append(f"Recommended crop/fertilizer: {ctx['prediction']}")
        if ctx.get("language") and ctx["language"] != "en-US":
            ctx_lines.append(f"Reply in the user's language: {ctx['language']}")

        system_content = SYSTEM_PROMPT
        if ctx_lines:
            system_content += " Context: " + "; ".join(ctx_lines) + "."

        # Build the messages array (OpenAI-compatible format)
        messages = [{"role": "system", "content": system_content}]

        # Append conversation history
        for msg in (request.history or []):
            # Gemini used "model"; OpenAI uses "assistant"
            role = "assistant" if msg.role == "model" else msg.role
            messages.append({"role": role, "content": msg.text})

        # Append the new user message
        messages.append({"role": "user", "content": request.message})

        resp = requests.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": OPENROUTER_MODEL,
                "messages": messages,
                "max_tokens": 350,
                "temperature": 0.7,
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        reply = data["choices"][0]["message"]["content"]
        return {"response": reply}

    except Exception as e:
        print("Chat error:", str(e))
        return {"response": "AI service temporarily unavailable. Please try again shortly."}
# ===============================
# HEALTH
# ===============================
@app.get("/health")
def health():
    return {"status": "ok"}

# ===============================
# SUPPORT ENDPOINTS FOR DROPDOWNS
# ===============================

@app.get("/supported-crops")
def get_supported_crops():
    return {"crops": CROP_LE.classes_.tolist()}


@app.get("/supported-fert-crops")
def get_supported_fert_crops():
    return {"crops": CROP_TYPE_LE.classes_.tolist()}


@app.get("/supported-soil-types")
def get_supported_soil_types():
    return {"soil_types": SOIL_TYPE_LE.classes_.tolist()}
