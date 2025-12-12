# frontend/app.py
# Streamlit demo to check backend /health and send sample soil data to /send-data

import streamlit as st
import requests

st.set_page_config(page_title="SmartAgri Demo", layout="centered")

st.title("SmartAgri — Demo Dashboard")

BACKEND_URL = st.text_input("Backend base URL (example http://127.0.0.1:8000)", "http://127.0.0.1:8000")

st.markdown("### Health check")
if st.button("Check Backend Health"):
    try:
        r = requests.get(BACKEND_URL + "/health", timeout=3)
        st.success("Backend responded:")
        st.json(r.json())
    except Exception as e:
        st.error("Failed to reach backend: " + str(e))

st.markdown("---")
st.markdown("### Send a test soil row to backend")

col1, col2, col3 = st.columns(3)
with col1:
    moisture = st.number_input("moisture", value=30.0)
    pH = st.number_input("pH", value=6.5)
with col2:
    N = st.number_input("N", value=10.0)
    P = st.number_input("P", value=15.0)
with col3:
    K = st.number_input("K", value=200.0)
    temperature = st.number_input("temperature", value=25.0)

sensor_id = st.text_input("sensor_id (optional)", "demo_sensor")

if st.button("Send data to backend"):
    payload = {
        "moisture": float(moisture),
        "pH": float(pH),
        "N": float(N),
        "P": float(P),
        "K": float(K),
        "temperature": float(temperature),
        "sensor_id": sensor_id,
    }
    try:
        r = requests.post(BACKEND_URL + "/send-data", json=payload, timeout=5)
        if r.status_code == 200:
            st.success("Server response:")
            st.json(r.json())
        else:
            st.error(f"Server returned status {r.status_code}")
            st.text(r.text)
    except Exception as e:
        st.error("Error sending data: " + str(e))
