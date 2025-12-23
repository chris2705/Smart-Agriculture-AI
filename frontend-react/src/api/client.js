import axios from 'axios';

// Automatically use the same hostname as the frontend (localhost or network IP)
const BACKEND_URL = `http://${window.location.hostname}:8000`;

export const predict = async (features) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/predict`, { features });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(`Backend error [${error.response.status}]: ${error.response.data.detail || error.response.statusText}`);
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
