# frontend/utils/api_client.py

import requests

# Adjust BACKEND_URL if your backend runs elsewhere
BACKEND_URL = "http://127.0.0.1:8000"

def predict(features):
    """
    Send features list to backend /predict and return JSON response.
    """
    url = f"{BACKEND_URL}/predict"
    payload = {"features": features}
    try:
        response = requests.post(url, json=payload, timeout=8)
    except Exception as e:
        raise Exception(f"Request failed: {e}")

    if response.status_code != 200:
        raise Exception(f"Backend error [{response.status_code}]: {response.text}")

    return response.json()
