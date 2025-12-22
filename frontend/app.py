import streamlit as st
from utils.api_client import predict

# -------------------------------
# Page config
# -------------------------------
st.set_page_config(
    page_title="Smart Agriculture AI",
    page_icon="🌱",
    layout="wide"
)

# -------------------------------
# Title
# -------------------------------
st.title("🌱 Smart Agriculture AI – Soil Intelligence Dashboard")
st.write("Enter soil parameters to get crop and fertilizer recommendations.")

# -------------------------------
# Input layout
# -------------------------------
col1, col2 = st.columns(2)

with col1:
    nitrogen = st.number_input("Nitrogen (N)", min_value=0.0, step=1.0, value=12.0)
    phosphorus = st.number_input("Phosphorus (P)", min_value=0.0, step=1.0, value=8.0)
    potassium = st.number_input("Potassium (K)", min_value=0.0, step=1.0, value=6.0)

with col2:
    pH = st.number_input("pH Level", min_value=0.0, max_value=14.0, step=0.1, value=6.0)
    moisture = st.number_input("Moisture (%)", min_value=0.0, step=1.0, value=3.0)
    temperature = st.number_input("Temperature (°C)", min_value=0.0, step=1.0, value=4.0)

# -------------------------------
# Prediction button
# -------------------------------
if st.button("Predict"):
    try:
        # IMPORTANT: order must match ML training
        features = [
            nitrogen,
            phosphorus,
            potassium,
            pH,
            moisture,
            temperature
        ]

        result = predict(features)

        st.success(f"✅ Recommended Crop: **{result['crop']}**")
        st.info(f"🌾 Recommended Fertilizer: **{result['fertilizer']}**")

        st.subheader("📊 Crop Probabilities")
        st.json(result["probabilities"])

        if "explanation" in result:
            st.subheader("🧠 Model Explanation")
            st.write(result["explanation"])

    except Exception as e:
        st.error(f"❌ Error: {e}")

# -------------------------------
# Chatbot (SAFE PLACEHOLDER)
# -------------------------------
st.divider()
st.subheader("🤖 Soil Intelligence Chatbot")

st.write(
    "This chatbot will explain recommendations in simple language "
    "(AI integration will be added next)."
)

user_question = st.text_input("Ask a question about your soil or recommendation:")

if st.button("Ask AI"):
    if user_question.strip() == "":
        st.warning("Please enter a question.")
    else:
        # TEMPORARY SAFE RESPONSE (no OpenAI dependency)
        st.write(
            f"🧠 **AI Response:**\n\n"
            f"The recommendation is based on your soil nutrients, pH, moisture, "
            f"and temperature. Crops like pulses perform well in moderate nitrogen "
            f"levels and help improve soil fertility naturally."
        )
