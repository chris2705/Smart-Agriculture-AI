import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sprout, MapPin, Ruler, Droplets, FlaskConical } from 'lucide-react';
import { SoilForm } from '../components/SoilForm';
import { PredictionResult } from '../components/PredictionResult';
import { predict } from '../api/client';
import axios from 'axios';

const cropBannerImages = {
    wheat: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=2070&auto=format&fit=crop',
    rice: 'https://images.unsplash.com/photo-1536054395116-10f8b4fd7bde?q=80&w=2070&auto=format&fit=crop',
    corn: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=2070&auto=format&fit=crop',
    default: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2070&auto=format&fit=crop',
};

const getBanner = (cropType) => {
    if (!cropType || cropType === 'None') return cropBannerImages.default;
    const l = cropType.toLowerCase();
    if (l.includes('wheat')) return cropBannerImages.wheat;
    if (l.includes('rice')) return cropBannerImages.rice;
    if (l.includes('corn') || l.includes('maize')) return cropBannerImages.corn;
    return cropBannerImages.default;
};

export const FieldDetails = () => {
    const { id } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const [fieldData, setFieldData] = useState(state?.field || null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!fieldData && id) {
            const fetchField = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const BACKEND_URL = `http://${window.location.hostname}:8000`;
                    const res = await axios.get(`${BACKEND_URL}/fields/`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const found = res.data.find(f => f.id === parseInt(id));
                    if (found) setFieldData(found);
                    else navigate('/dashboard');
                } catch (e) {
                    console.error("Error fetching field", e);
                    navigate('/dashboard');
                }
            };
            fetchField();
        }
    }, [id, fieldData, navigate]);

    const handleAnalysisSubmit = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const NPK_total = data.nitrogen + data.phosphorus + data.potassium;
            const features = [data.nitrogen, data.phosphorus, data.potassium, data.pH, data.moisture, data.temperature, NPK_total];
            const response = await predict(features, (fieldData.crop_type && fieldData.crop_type !== "None") ? fieldData.crop_type : null);
            setAnalysisResult(response);
            sessionStorage.setItem('latestAnalysis', JSON.stringify(response));
            setTimeout(() => document.getElementById('analysis-results')?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!fieldData) return (
        <div className="min-h-screen flex items-center justify-center"
            style={{ background: 'linear-gradient(160deg, #071a0a 0%, #0f2a0f 100%)' }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 rounded-full border-2 border-transparent"
                style={{ borderTopColor: '#52b788', borderRightColor: 'rgba(82,183,136,0.3)' }}
            />
        </div>
    );

    const bannerUrl = getBanner(fieldData.crop_type);

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 -z-20"
                style={{ background: 'linear-gradient(160deg, #071a0a 0%, #0f2a0f 50%, #081810 100%)' }} />

            {/* Hero field banner */}
            <div className="relative h-72 md:h-96 overflow-hidden">
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${bannerUrl}')` }}
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(180deg, rgba(7,26,10,0.4) 0%, rgba(7,26,10,0.95) 100%)' }} />

                {/* Back button on top of banner */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/dashboard')}
                    className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2.5 rounded-2xl font-medium text-sm transition-all"
                    style={{
                        background: 'rgba(7,26,10,0.7)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#95d5b2'
                    }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </motion.button>

                {/* Field title on banner */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.7 }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                style={{ background: 'rgba(52,168,83,0.25)', border: '1px solid rgba(82,183,136,0.4)' }}>
                                <Sprout className="w-6 h-6 text-green-300" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white">{fieldData.name}</h1>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                                style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', color: 'rgba(200,240,210,0.8)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                <MapPin className="w-3.5 h-3.5" /> {fieldData.location || 'Unknown'}
                            </span>
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                                style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', color: 'rgba(200,240,210,0.8)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                <Ruler className="w-3.5 h-3.5" /> {fieldData.size} Acres
                            </span>
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                                style={{ background: 'rgba(52,168,83,0.2)', color: '#95d5b2', border: '1px solid rgba(82,183,136,0.35)' }}>
                                🌱 {fieldData.crop_type && fieldData.crop_type !== 'None' ? fieldData.crop_type : 'No Crop Planted'}
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main content */}
            <div className="container mx-auto px-4 py-10 max-w-5xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="agri-card p-6 md:p-10 mb-8 relative overflow-hidden"
                >
                    {/* Top striped accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
                        style={{ background: 'linear-gradient(90deg, #2d6a4f, #52b788, #95d5b2, #f4a261)' }} />

                    {/* Background photo strip */}
                    <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-56 rounded-r-3xl overflow-hidden opacity-15">
                        <div className="h-full bg-cover bg-center"
                            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=400&auto=format&fit=crop')` }} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <FlaskConical className="w-6 h-6 text-green-400" />
                            <h2 className="text-2xl font-bold text-white">Generate Soil Analysis</h2>
                        </div>
                        <p className="mb-8 text-sm" style={{ color: 'rgba(200,240,210,0.5)' }}>
                            Enter the latest soil metrics for <strong className="text-green-300">{fieldData.name}</strong> to get real-time
                            fertilizer recommendations and crop suitability scores.
                        </p>
                        <SoilForm onSubmit={handleAnalysisSubmit} isLoading={loading} />
                    </div>
                </motion.div>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 p-4 rounded-2xl flex items-center gap-3"
                            style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.25)', color: '#fca5a5' }}
                        >
                            <span className="text-xl">⚠️</span> {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results */}
                <div id="analysis-results">
                    <AnimatePresence>
                        {analysisResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                            >
                                {/* Divider */}
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
                                        style={{ background: 'rgba(52,168,83,0.15)', color: '#95d5b2', border: '1px solid rgba(52,168,83,0.25)' }}>
                                        🔬 Analysis Report
                                    </span>
                                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                                </div>
                                <PredictionResult result={analysisResult} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
