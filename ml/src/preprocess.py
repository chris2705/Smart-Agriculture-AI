# ml/src/preprocess.py
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_PATH = os.path.join(ROOT, "data", "soil_dataset.csv")
MODEL_DIR = os.path.join(ROOT, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

def load_data(path=DATA_PATH):
    print(f"[preprocess] Loading dataset from: {path}")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Dataset not found at {path}. Please place your CSV at ml/data/soil_dataset.csv")
    df = pd.read_csv(path)
    print(f"[preprocess] Dataset shape: {df.shape}")
    return df

def clean_and_feature_engineer(df):
    expected = [
        'nitrogen',
        'phosphorus',
        'potassium',
        'pH',
        'moisture',
        'temperature',
        'crop_label',
        'fertilizer_label'
    ]
    missing = [c for c in expected if c not in df.columns]
    if missing:
        raise ValueError(f"[preprocess] Missing required columns: {missing}. Found columns: {list(df.columns)}")

    df = df[expected].copy()
    # Drop rows with any NaN (you can change to impute if preferred)
    before = df.shape[0]
    df = df.dropna()
    after = df.shape[0]
    print(f"[preprocess] Dropped {before-after} rows with missing values. Remaining: {after}")

    # Feature engineering
    df['NPK_total'] = df['nitrogen'] + df['phosphorus'] + df['potassium']

    return df

def encode_labels(df):
    # Encode crop_label and fertilizer_label to numeric and save encoders
    crop_le = LabelEncoder()
    fert_le = LabelEncoder()

    df = df.copy()
    df['crop_label_enc'] = crop_le.fit_transform(df['crop_label'])
    df['fertilizer_label_enc'] = fert_le.fit_transform(df['fertilizer_label'])

    # Save encoders so backend/frontend can decode predictions
    joblib.dump(crop_le, os.path.join(MODEL_DIR, "label_encoder_crop.joblib"))
    joblib.dump(fert_le, os.path.join(MODEL_DIR, "label_encoder_fert.joblib"))
    print(f"[preprocess] Saved LabelEncoders to {MODEL_DIR}")

    return df, crop_le, fert_le

def split_and_scale(df, test_size=0.2, random_state=42):
    # Use encoded labels for y
    X = df[['nitrogen','phosphorus','potassium','pH','moisture','temperature','NPK_total']].copy()
    y_crop = df['crop_label_enc']
    y_fert = df['fertilizer_label_enc']

    X_train, X_test, y_crop_train, y_crop_test, y_fert_train, y_fert_test = train_test_split(
        X, y_crop, y_fert,
        test_size=test_size,
        random_state=random_state,
        stratify=y_crop
    )

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)

    # Save scaler + processed data
    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.joblib"))
    joblib.dump(
        (X_train_s, X_test_s, y_crop_train.reset_index(drop=True), y_crop_test.reset_index(drop=True),
         y_fert_train.reset_index(drop=True), y_fert_test.reset_index(drop=True)),
        os.path.join(MODEL_DIR, "train_test.joblib")
    )
    print(f"[preprocess] Saved scaler.joblib and train_test.joblib to {MODEL_DIR}")

def main():
    try:
        df = load_data()
        df = clean_and_feature_engineer(df)
        df, crop_le, fert_le = encode_labels(df)
        split_and_scale(df)
        print("[preprocess] Preprocessing complete.")
        print("[preprocess] Files you should now see in ml/models/:")
        print("  - scaler.joblib")
        print("  - train_test.joblib")
        print("  - label_encoder_crop.joblib")
        print("  - label_encoder_fert.joblib")
    except Exception as e:
        print("[preprocess] ERROR:", str(e))
        sys.exit(1)

if __name__ == "__main__":
    main()
