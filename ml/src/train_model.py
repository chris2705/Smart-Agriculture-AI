# ml/src/train_model.py
"""
Train XGBoost models for:
 - crop recommendation (multi-class)
 - fertilizer recommendation (multi-class)

Assumes preprocess.py has been run and saved:
 - ml/models/train_test.joblib
 - ml/models/scaler.joblib
 - ml/models/label_encoder_crop.joblib
 - ml/models/label_encoder_fert.joblib

Saves:
 - ml/models/crop_recommendation.joblib
 - ml/models/fertilizer_model.joblib
 - ml/models/training_meta.joblib
"""

import os
import joblib
import numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import traceback
import json

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODEL_DIR = os.path.join(ROOT, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

def load_preprocessed():
    path = os.path.join(MODEL_DIR, "train_test.joblib")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Preprocessed data not found: {path}. Run preprocess.py first.")
    data = joblib.load(path)
    # Expecting tuple: (X_train_s, X_test_s, y_crop_train, y_crop_test, y_fert_train, y_fert_test)
    return data

def load_label_encoders():
    crop_le_path = os.path.join(MODEL_DIR, "label_encoder_crop.joblib")
    fert_le_path = os.path.join(MODEL_DIR, "label_encoder_fert.joblib")
    if not os.path.exists(crop_le_path) or not os.path.exists(fert_le_path):
        raise FileNotFoundError("LabelEncoder files missing in ml/models/. Run preprocess.py to generate them.")
    crop_le = joblib.load(crop_le_path)
    fert_le = joblib.load(fert_le_path)
    return crop_le, fert_le

def simple_grid_search_xgb(X, y, small_grid=True, cv=3):
    base = XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', n_jobs=-1)
    if small_grid:
        param_grid = {
            "n_estimators": [50, 100],
            "max_depth": [3, 5],
            "learning_rate": [0.1, 0.01]
        }
    else:
        param_grid = {
            "n_estimators": [50, 100, 200],
            "max_depth": [3, 5, 7],
            "learning_rate": [0.2, 0.1, 0.01]
        }
    gs = GridSearchCV(base, param_grid, cv=cv, scoring='accuracy', verbose=1, n_jobs=-1)
    gs.fit(X, y)
    return gs.best_estimator_, gs

def save_model(obj, filename):
    out = os.path.join(MODEL_DIR, filename)
    joblib.dump(obj, out)
    print(f"[train] Saved: {out}")

def decode_labels(y_enc, label_encoder):
    """Return list of decoded label names corresponding to integer labels (for report ordering)."""
    # label_encoder.classes_ maps index->class string
    return label_encoder.classes_.tolist()

def main():
    try:
        print("[train] Loading preprocessed data...")
        X_train_s, X_test_s, y_crop_train, y_crop_test, y_fert_train, y_fert_test = load_preprocessed()
        crop_le, fert_le = load_label_encoders()
    except Exception as e:
        print("[train] ERROR loading preprocessed artifacts:", str(e))
        traceback.print_exc()
        return

    # Train crop model
    try:
        print("[train] Training crop recommendation model (this may take a few minutes)...")
        crop_model, crop_gs = simple_grid_search_xgb(X_train_s, y_crop_train, small_grid=True, cv=3)
        y_crop_pred = crop_model.predict(X_test_s)
        crop_acc = accuracy_score(y_crop_test, y_crop_pred)
        print(f"[train] Crop model accuracy: {crop_acc:.4f}")

        # classification_report with target names
        target_names = decode_labels(y_crop_test, crop_le)  # careful: this returns all class names
        # To ensure correct order of target_names mapping to labels 0..n-1:
        target_names = crop_le.classes_.tolist()
        print("[train] Crop classification report (labels decoded):")
        print(classification_report(y_crop_test, y_crop_pred, target_names=target_names))

        save_model(crop_model, "crop_recommendation.joblib")
    except Exception as e:
        print("[train] ERROR during crop model training:", str(e))
        traceback.print_exc()
        return

    # Train fertilizer model
    try:
        print("[train] Training fertilizer recommendation model...")
        fert_model, fert_gs = simple_grid_search_xgb(X_train_s, y_fert_train, small_grid=True, cv=3)
        y_fert_pred = fert_model.predict(X_test_s)
        fert_acc = accuracy_score(y_fert_test, y_fert_pred)
        print(f"[train] Fertilizer model accuracy: {fert_acc:.4f}")

        target_names_fert = fert_le.classes_.tolist()
        print("[train] Fertilizer classification report (labels decoded):")
        print(classification_report(y_fert_test, y_fert_pred, target_names=target_names_fert))

        save_model(fert_model, "fertilizer_model.joblib")
    except Exception as e:
        print("[train] ERROR during fertilizer model training:", str(e))
        traceback.print_exc()
        return

    # Save training metadata
    try:
        meta = {
            "crop_best_params": crop_gs.best_params_,
            "fert_best_params": fert_gs.best_params_,
            "crop_accuracy": float(crop_acc),
            "fert_accuracy": float(fert_acc),
            "crop_classes": crop_le.classes_.tolist(),
            "fert_classes": fert_le.classes_.tolist()
        }
        meta_path = os.path.join(MODEL_DIR, "training_meta.json")
        with open(meta_path, "w") as f:
            json.dump(meta, f, indent=2)
        print(f"[train] Saved training metadata to {meta_path}")
    except Exception as e:
        print("[train] WARNING: could not save training metadata:", str(e))
        traceback.print_exc()

    print("[train] Training pipeline complete. Models and metadata are in ml/models/")

if __name__ == "__main__":
    main()
