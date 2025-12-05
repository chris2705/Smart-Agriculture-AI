# ml/example_predict.py
import joblib
import numpy as np
import os

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
model = joblib.load(os.path.join(MODEL_DIR, "crop_recommendation.joblib"))
scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.joblib"))

# IMPORTANT: feature order must match preprocess.py
def predict_crop(features):
    """
    features: list or array in order:
    [nitrogen, phosphorus, potassium, pH, moisture, temperature, NPK_total]
    """
    arr = np.array(features).reshape(1, -1)
    arr_s = scaler.transform(arr)
    pred = model.predict(arr_s)
    proba = model.predict_proba(arr_s)
    return pred[0], proba[0].tolist()

if __name__ == "__main__":
    # example:
    f = [12.0, 8.0, 10.0, 6.5, 23.0, 28.0, 30.0]
    p, pr = predict_crop(f)
    print("Prediction:", p)
    print("Probabilities:", pr)
