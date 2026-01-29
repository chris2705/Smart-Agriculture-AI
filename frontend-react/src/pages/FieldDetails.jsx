import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sprout, MapPin, Ruler, Droplets } from 'lucide-react';
import { PlantBackground } from '../components/PlantBackground';
import { SoilForm } from '../components/SoilForm';
import { PredictionResult } from '../components/PredictionResult';
import { predict } from '../api/client';
import axios from 'axios';

export const FieldDetails = () => {
    const { id } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();

    // We expect field data passed in state, but in a real app we'd fetch it by ID if missing
    // For this demo, if no state, we mock or redirect
    const [fieldData, setFieldData] = useState(state?.field || null);

    useEffect(() => {
        if (!fieldData && id) {
            // Fetch if direct link or reload
            const fetchField = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const BACKEND_URL = `http://${window.location.hostname}:8000`;
                    // Fetch all fields and find the one (or we could make a specific get endpoint)
                    // Currently we only have GET /fields/ which returns all user fields
                    const res = await axios.get(`${BACKEND_URL}/fields/`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const found = res.data.find(f => f.id === parseInt(id));
                    if (found) setFieldData(found);
                    else navigate('/dashboard'); // Redirect if not found
                } catch (e) {
                    console.error("Error fetching field", e);
                    navigate('/dashboard');
                }
            };
            fetchField();
        }
    }, [id, fieldData, navigate]);

    if (!fieldData) return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nature-600"></div>
        </div>
    );

    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAnalysisSubmit = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const NPK_total = data.nitrogen + data.phosphorus + data.potassium;
            const features = [
                data.nitrogen,
                data.phosphorus,
                data.potassium,
                data.pH,
                data.moisture,
                data.temperature,
                NPK_total
            ];

            const response = await predict(features, (fieldData.crop_type && fieldData.crop_type !== "None") ? fieldData.crop_type : null);
            setAnalysisResult(response);

            // Save to sessionStorage so chatbot can access it
            sessionStorage.setItem('latestAnalysis', JSON.stringify(response));

            // Scroll to results
            setTimeout(() => {
                document.getElementById('analysis-results')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-zinc-50">
            <PlantBackground opacity={0.15} />

            <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10 pt-24">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-zinc-500 hover:text-nature-600 font-medium mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                {/* Field Header Card */}
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-zinc-100 shadow-sm mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-nature-100 p-2 rounded-lg">
                                    <Sprout className="w-6 h-6 text-nature-600" />
                                </div>
                                <h1 className="text-3xl font-bold text-zinc-900">{fieldData.name}</h1>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-zinc-600">
                                <span className="flex items-center gap-1 bg-zinc-100 px-3 py-1 rounded-full">
                                    <MapPin className="w-4 h-4" /> {fieldData.location}
                                </span>
                                <span className="flex items-center gap-1 bg-zinc-100 px-3 py-1 rounded-full">
                                    <Ruler className="w-4 h-4" /> {fieldData.size} Acres
                                </span>
                                <span className="flex items-center gap-1 bg-nature-50 px-3 py-1 rounded-full text-nature-700 font-medium border border-nature-100">
                                    {fieldData.crop_type && fieldData.crop_type !== "None" ? `Crop: ${fieldData.crop_type}` : 'No Crop Planted'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analysis Section */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Droplets className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-900">Generate Soil Analysis</h2>
                    </div>

                    <div className="glass-panel p-8 rounded-[2rem] border border-white/60 shadow-xl">
                        <p className="text-zinc-600 mb-8 max-w-2xl">
                            Enter the latest soil metrics for <strong>{fieldData.name}</strong> to get real-time recommendations for fertilizers and crop suitability.
                        </p>
                        <SoilForm onSubmit={handleAnalysisSubmit} isLoading={loading} />
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-2"
                            >
                                <span className="w-2 h-2 bg-red-500 rounded-full" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {analysisResult && (
                        <div id="analysis-results" className="pt-8">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="h-px bg-zinc-200 flex-1" />
                                <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Analysis Report</span>
                                <div className="h-px bg-zinc-200 flex-1" />
                            </div>
                            <PredictionResult result={analysisResult} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
