import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SoilForm } from '../components/SoilForm';
import { PredictionResult } from '../components/PredictionResult';
import { predict } from '../api/client';
import { Sprout, MessageCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

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

            // Smooth scroll to results
            setTimeout(() => {
                const element = document.getElementById('results');
                element?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
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
        <div className="min-h-screen relative overflow-x-hidden pb-32">

            <main className="container mx-auto px-4 py-12 lg:py-20 max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-16 relative"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="inline-flex items-center justify-center p-3 mb-8 rounded-full glass-panel"
                    >
                        <div className="bg-nature-100 p-2 rounded-full mr-3">
                            <Sprout className="w-6 h-6 text-nature-600" />
                        </div>
                        <span className="text-nature-700 font-semibold tracking-wide text-sm uppercase">AI Powered Agriculture</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-display font-extrabold mb-6 tracking-tight text-zinc-900 leading-tight">
                        Cultivating the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-nature-600 via-nature-500 to-emerald-600 animate-gradient-x">
                            Future of Farming
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-zinc-600 max-w-2xl mx-auto leading-relaxed font-light">
                        Advanced machine learning analysis for precision soil diagnostics and optimal crop yields.
                    </p>
                </motion.div>

                <div className="space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="glass-panel rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden ring-1 ring-white/60"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-nature-400 via-nature-500 to-emerald-500" />
                        <div className="relative z-10">
                            <div className="mb-10 text-center">
                                <h2 className="text-2xl font-bold text-zinc-800 mb-2">Soil Analysis Parameters</h2>
                                <p className="text-zinc-500">Enter your soil metrics below to generate a comprehensive report</p>
                            </div>
                            <SoilForm onSubmit={handleSubmit} isLoading={loading} />
                        </div>
                    </motion.div>

                    <AnimatePresence mode='wait'>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="glass-panel border-l-4 border-red-500 p-6 rounded-r-xl"
                            >
                                <div className="flex items-center gap-3 text-red-700 font-medium">
                                    <div className="p-2 bg-red-100 rounded-full">!</div>
                                    {error}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div id="results">
                        <PredictionResult result={result} />
                    </div>
                </div>

                {/* Floating Action Button */}
                <motion.div
                    className="fixed bottom-8 right-8 z-50"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, type: "spring" }}
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={goToChat}
                        className={cn(
                            "group flex items-center gap-3 pl-6 pr-4 py-4 rounded-full shadow-2xl shadow-nature-600/40",
                            "bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
                        )}
                    >
                        <span className="font-semibold text-lg">Ask AI Assistant</span>
                        <div className="p-2 bg-zinc-800 rounded-full group-hover:bg-nature-600 transition-colors duration-300">
                            <MessageCircle className="w-6 h-6" />
                        </div>

                        {result && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                            </span>
                        )}
                    </motion.button>
                </motion.div>
            </main>

            <footer className="text-center py-12 text-zinc-400 text-sm font-medium">
                <p>© 2025 Smart Agriculture AI • Precision Farming Technology</p>
            </footer>
        </div>
    );
};
