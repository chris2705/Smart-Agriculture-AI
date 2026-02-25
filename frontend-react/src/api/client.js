import axios from 'axios';

// Automatically use the same hostname as the frontend (localhost or network IP)
const BACKEND_URL = `http://${window.location.hostname}:8000`;

export const predict = async (features, currentCrop = null) => {
    try {
        // Backend currently exposes separate endpoints for crop and fertilizer
        // `/predict/crop` expects { n, p, k, temperature, ph }
        // Older frontend passed an array; support both representations.
        let body = null;
        if (Array.isArray(features)) {
            // Map array -> expected object
            // frontend array shape commonly: [n, p, k, pH, moisture, temperature, NPK_total]
            const n = features[0];
            const p = features[1];
            const k = features[2];
            const pH = features[3];
            const moisture = features[4];
            const temperature = features[5];
            body = { n, p, k, temperature, ph: pH, moisture };
        } else if (features && typeof features === 'object') {
            body = features;
        } else {
            throw new Error('Invalid features payload');
        }

        const response = await axios.post(`${BACKEND_URL}/predict/crop`, body);
        const data = response.data || {};

        // Try to enrich probabilities with crop names from backend
        let cropProbMap = {};
        try {
            const cropsResp = await axios.get(`${BACKEND_URL}/supported-crops`);
            const crops = cropsResp.data?.crops || [];
            const probs = data.probabilities || [];
            probs.forEach((p, i) => {
                const name = crops[i] || `class_${i}`;
                cropProbMap[name] = p;
            });
        } catch (e) {
            // ignore - leave empty map
        }

        return {
            prediction: data.prediction || data.predicted || null,
            explanation: {
                crop_probabilities: cropProbMap,
                fertilizer_recommendation: data.fertilizer || data.recommendation || null,
                input_data: body
            },
            shap_summary_url: data.shap_summary_url || null,
            lime_examples: data.lime_examples || null,
            existing_crop_analysis: data.existing_crop_analysis || null
        };
    } catch (error) {
        if (error.response) {
            throw new Error(`Backend error [${error.response.status}]: ${JSON.stringify(error.response.data) || error.response.statusText}`);
        } else if (error.request) {
            throw new Error("No response from backend. Is it running?");
        } else {
            throw new Error(`Error: ${error.message}`);
        }
    }
};

export const chat = async (message, context) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/chat`, { message, context });
        return response.data;
    } catch (error) {
        console.error("Chat error:", error);
        return { response: "Sorry, I'm having trouble connecting to the server right now." };
    }
};

export const recommendFertilizer = async (payload) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/predict/fertilizer`, payload);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(`Backend error [${error.response.status}]: ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            throw new Error("No response from backend. Is it running?");
        } else {
            throw new Error(`Error: ${error.message}`);
        }
    }
};
