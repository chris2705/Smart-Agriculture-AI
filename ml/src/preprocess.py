# ml/src/preprocess.py

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import os

ROOT = os.path.join(os.path.dirname(__file__), "..")
DATA_PATH = os.path.join(ROOT, "data", "soil_dataset.csv")
OUT_PATH = os.path.join(ROOT, "models")

os.makedirs(OUT_PATH, exist_ok=True)

def load_data(path=DATA_PATH):
    print("Loading dataset from:", path)
    df = pd.read_csv(path)
    print("Dataset shape:", df.shape)
    return df

def clean_and_feature_engineer(df):
    """
    Adjust this according to your dataset column names.
    These are the REQUIRED features based on project spec:
    N, P, K, pH, moisture, temperature
    """
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

    # Validate dataset columns
    for col in expected:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")

    df = df[expected].copy()

    # Simple missing value handling
    df = df.dropna()

    # Feature engineering
    df['NPK_total'] = df['nitrogen'] + df['phosphorus'] + df['potassium']

    return df

def split_and_scale(df, test_size=0.2, random_state=42):
    X = df.drop(columns=['crop_label', 'fertilizer_label'])
    y_crop = df['crop_label']
    y_fert = df['fertilizer_label']

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
    joblib.dump(scaler, os.path.join(OUT_PATH, "scaler.joblib"))
    joblib.dump(
        (X_train_s, X_test_s, y_crop_train, y_crop_test, y_fert_train, y_fert_test),
        os.path.join(OUT_PATH, "train_test.joblib")
    )

    print("Saved scaler and processed train/test splits.")

def main():
    df = load_data()
    df = clean_and_feature_engineer(df)
    split_and_scale(df)
    print("Preprocessing complete!")

if __name__ == "__main__":
    main()
