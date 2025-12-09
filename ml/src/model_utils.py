# ml/src/model_utils.py
import os
import joblib
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), "..")
MODEL_DIR = os.path.join(ROOT, "..", "models") if os.path.basename(ROOT) == "src" else os.path.join(ROOT, "models")
MODEL_DIR = os.path.abspath(MODEL_DIR)

def load_train_test():
    path = os.path.join(MODEL_DIR, "train_test.joblib")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Expected {path} to exist. Run preprocess.py first.")
    return joblib.load(path)  # returns (X_train_s, X_test_s, y_crop_train, y_crop_test, y_fert_train, y_fert_test)

def save_model(model, name):
    os.makedirs(MODEL_DIR, exist_ok=True)
    out = os.path.join(MODEL_DIR, name)
    joblib.dump(model, out)
    print(f"Saved model to {out}")

def load_scaler():
    path = os.path.join(MODEL_DIR, "scaler.joblib")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Scaler not found at {path}. Run preprocess.py first.")
    return joblib.load(path)
