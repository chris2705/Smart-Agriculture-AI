import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))

# frontend/app.py

import streamlit as st
from utils.api_client import predict
import requests

st.set_page_config(page_title="Smart Agriculture AI", layout="wide")

st.title("🌱 Smart Agriculture AI – Soil Intelligence Dashboard")
st.write("Enter soil parameters to get crop + fertilizer recommendations.")

# --- Input fields ---
col1, col2 = st.columns(2)

with col1:
    nitrogen = st.number_input("Nitrogen (N)", min_value=0.0, step=1.0)
    phosphorus = st.number_input("Phosphorus (P)", min_value=0.0, step=1.0)
    potassium = st.number_input("Potassium (K)", min_value=0.0, step=1.0)

with col2:
    ph = st.number_input("pH Level", min_value=0.0, max_value=14.0, step=0.1)
    moisture = st.number_input("Moisture (%)", min_value=0.0, step=1.0)
    temperature = st.number_input("Temperature (°C)", min_value=0.0, step=1.0)

# Derived feature
npk_total = nitrogen + phosphorus + potassium

if st.button("Predict"):
    with st.spinner("Predicting..."):
        try:
            features = [nitrogen, phosphorus, potassium, ph, moisture, temperature, npk_total]
            result = predict(features)

            st.success(f"Recommended Crop: **{result.get('prediction','-')}**")
            if result.get("explanation") and result["explanation"].get("fertilizer_recommendation"):
                st.info(f"Recommended Fertilizer: **{result['explanation']['fertilizer_recommendation']}**")

            # Probabilities
            st.subheader("Crop Probabilities")
            if result.get("explanation") and result["explanation"].get("crop_probabilities"):
                st.json(result["explanation"]["crop_probabilities"])
            else:
                st.write("No crop probabilities returned by backend.")

            # SHAP
            if result.get("shap_summary_url"):
                shap_url = result["shap_summary_url"]
                # If server returns a relative path starting with '/', prefix backend base
                if shap_url.startswith("/"):
                    shap_url = "http://127.0.0.1:8000" + shap_url
                st.subheader("SHAP Explanation")
                st.image(shap_url)
            else:
                st.warning("No SHAP image available.")

            # LIME
            if result.get("lime_examples"):
                st.subheader("LIME Explanation")
                st.json(result["lime_examples"])
            else:
                st.warning("No LIME examples available.")

        except Exception as e:
            st.error(f"Error: {e}")
