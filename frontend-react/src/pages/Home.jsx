import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SoilForm } from '../components/SoilForm';
import { PredictionResult } from '../components/PredictionResult';
import { predict } from '../api/client';
import { Sprout, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Home = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (data) => {
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

            const response = await predict(features);
            setResult(response);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const goToChat = () => {
        navigate('/chat', { state: { result } });
    };

    return (
        <div className="min-h-screen bg-earth-50 relative overflow-x-hidden font-sans pb-24">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-nature-100/50 to-transparent -z-10" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-nature-200/30 rounded-full blur-3xl -z-10" />
            <div className="absolute top-48 -left-24 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl -z-10" />

            <main className="container mx-auto px-4 py-8 lg:py-12 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-sm mb-6 border border-nature-100">
                        <Sprout className="w-8 h-8 text-nature-600 mr-3" />
                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-nature-700 to-nature-500">
                            Soil Intelligence AI
                        </h1>
                    </div>
                    <p className="text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed hidden md:block">
                        Advanced machine learning for precision agriculture.
                    </p>
                </motion.div>

                <div className="space-y-8">
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-zinc-200/50 border border-white/50 relative overflow-hidden">
                        <div className="relative z-10">
                            <SoilForm onSubmit={handleSubmit} isLoading={loading} />
                        </div>
                    </div>

                    <AnimatePresence mode='wait'>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center"
                            >
                                ⚠️ {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div id="results">
                        <PredictionResult result={result} />
                    </div>
                </div>

                {/* Floating Chat Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToChat}
                    className="fixed bottom-6 right-6 p-4 bg-nature-600 text-white rounded-full shadow-2xl shadow-nature-600/40 z-50 flex items-center justify-center"
                >
                    <MessageCircle className="w-8 h-8" />
                    {/* Optional Notification Dot if result exists */}
                    {result && (
                        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
                    )}
                </motion.button>
            </main>

            <footer className="text-center py-8 text-zinc-400 text-sm">
                © 2025 Smart Agriculture AI
            </footer>
        </div>
    );
};
