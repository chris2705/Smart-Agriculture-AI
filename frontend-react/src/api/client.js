import axios from 'axios';

// ─── Centralized backend URL ───────────────────────────────────────────────
// Uses Vite env variable so the app works locally (.env) and in production (Vercel).
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://smart-agriculture-ai-production.up.railway.app";

// Helper: extract a useful message from Axios errors
const handleApiError = (error) => {
    if (error.response) {
        const detail = error.response.data?.detail || JSON.stringify(error.response.data);
        throw new Error(`Backend error [${error.response.status}]: ${detail}`);
    } else if (error.request) {
        throw new Error('No response from backend. Is it running?');
    } else {
        throw new Error(`Error: ${error.message}`);
    }
};

// ─── Crop Recommendation ───────────────────────────────────────────────────
// POST /predict/crop  →  used when NO crop is currently planted
export const predict = async (features) => {
    try {
        // Support both array and object payloads
        let body;
        if (Array.isArray(features)) {
            // Array order: [n, p, k, pH, moisture, temperature, ...]
            body = {
                n: features[0],
                p: features[1],
                k: features[2],
                ph: features[3],
                moisture: features[4],
                temperature: features[5],
            };
        } else if (features && typeof features === 'object') {
            body = features;
        } else {
            throw new Error('Invalid features payload');
        }

        const response = await axios.post(`${BACKEND_URL}/predict/crop`, body);
        const data = response.data || {};

        // Enrich probabilities with crop names
        let cropProbMap = {};
        try {
            const cropsResp = await axios.get(`${BACKEND_URL}/supported-crops`);
            const crops = cropsResp.data?.crops || [];
            const probs = data.probabilities || [];
            probs.forEach((prob, i) => {
                cropProbMap[crops[i] || `class_${i}`] = prob;
            });
        } catch (_) {
            // non-critical — leave map empty
        }

        return {
            prediction: data.prediction || null,
            explanation: {
                crop_probabilities: cropProbMap,
                fertilizer_recommendation: null,
                input_data: body,
            },
        };
    } catch (error) {
        handleApiError(error);
    }
};

// ─── Fertilizer Recommendation ─────────────────────────────────────────────
// POST /predict/fertilizer  →  used when a crop IS already planted
export const recommendFertilizer = async (payload) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/predict/fertilizer`, payload);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

// ─── Chat ──────────────────────────────────────────────────────────────────
export const chat = async (message, context) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/chat`, { message, context });
        return response.data;
    } catch (error) {
        console.error('Chat error:', error);
        return { response: "Sorry, I'm having trouble connecting to the server right now." };
    }
};

export default BACKEND_URL;
