import requests

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


def ask_chatbot(question):
    """
    TEMPORARY SAFE PLACEHOLDER
    (NO OpenAI dependency)
    """
    return (
        "Pulses are recommended because they grow well in moderate nitrogen levels, "
        "help improve soil fertility, and suit your soil pH and moisture conditions."
    )
