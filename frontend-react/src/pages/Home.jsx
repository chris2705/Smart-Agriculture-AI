import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SoilForm } from '../components/SoilForm';
import { PredictionResult } from '../components/PredictionResult';
import { predict } from '../api/client';
import { Sprout, MessageCircle, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// Animated background particles
const Particle = ({ i }) => {
    const emojis = ['🌱', '🌿', '🍃', '🌾', '🌻', '🌽'];
    const size = 16 + (i % 4) * 6;
    return (
        <motion.div
            className="fixed pointer-events-none select-none"
            style={{ fontSize: size, left: `${5 + i * 13}%`, top: `${10 + (i % 5) * 18}%` }}
            animate={{ y: [0, -30, 0], rotate: [0, 15, -10, 0], opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 5 + i * 0.8, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
        >
            {emojis[i % emojis.length]}
        </motion.div>
    );
};

const stats = [
    { emoji: '🌿', label: 'Soil Health', desc: 'Real-time NPK & pH monitoring' },
    { emoji: '🤖', label: 'AI Powered', desc: 'ML-based crop recommendations' },
    { emoji: '💧', label: 'Water Smart', desc: 'Moisture optimization' },
    { emoji: '📊', label: 'XAI Insights', desc: 'Explainable model decisions' },
];

export const Home = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleSubmit = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const NPK_total = data.nitrogen + data.phosphorus + data.potassium;
            const features = [data.nitrogen, data.phosphorus, data.potassium, data.pH, data.moisture, data.temperature, NPK_total];
            const response = await predict(features);
            setResult(response);
            setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const goToChat = () => navigate('/chat', { state: { result } });

    return (
        <div className="min-h-screen relative overflow-x-hidden">
            {/* Fixed deep green background */}
            <div className="fixed inset-0 -z-20"
                style={{ background: 'linear-gradient(160deg, #071a0a 0%, #0f2a0f 50%, #081810 100%)' }} />

            {/* Background farm image with subtle overlay */}
            <div className="fixed inset-0 -z-10 opacity-10"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2070&auto=format&fit=crop')`,
                    backgroundSize: 'cover', backgroundPosition: 'center'
                }} />

            {/* Floating particles */}
            {[...Array(7)].map((_, i) => <Particle key={i} i={i} />)}

            {/* Radial glow */}
            <div className="fixed inset-0 -z-10 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(52,168,83,0.12) 0%, transparent 70%)' }} />

            {/* ─── HERO SECTION ─── */}
            <section className="relative min-h-screen flex flex-col">
                {/* Nav bar */}
                <nav className="flex justify-between items-center px-6 md:px-12 pt-6 z-40 relative">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2"
                    >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(52,168,83,0.2)', border: '1px solid rgba(52,168,83,0.4)' }}>
                            <Sprout className="w-5 h-5 text-green-400" />
                        </div>
                        <span className="text-green-300 font-bold text-lg tracking-wide">SmartAgri AI</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {user ? (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                                    style={{ background: 'linear-gradient(135deg, #2d6a4f, #52b788)' }}>
                                    {user.full_name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <span className="text-white/80 text-sm font-medium hidden sm:block">{user.full_name}</span>
                                <div className="flex gap-1 ml-2">
                                    <button onClick={() => navigate('/dashboard')}
                                        className="p-1.5 rounded-lg hover:bg-white/10 text-green-400 transition-colors" title="Dashboard">
                                        <LayoutDashboard className="w-4 h-4" />
                                    </button>
                                    <button onClick={logout}
                                        className="p-1.5 rounded-lg hover:bg-white/10 text-red-400 transition-colors" title="Sign Out">
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => navigate('/')}
                                className="px-5 py-2.5 rounded-2xl text-white font-semibold text-sm transition-all"
                                style={{ background: 'rgba(52,168,83,0.2)', border: '1px solid rgba(52,168,83,0.4)' }}
                            >
                                Log In
                            </motion.button>
                        )}
                    </motion.div>
                </nav>

                {/* Hero content */}
                <div className="flex-1 flex flex-col items-center justify-center px-4 text-center pb-20 pt-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', duration: 0.8 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-semibold"
                        style={{
                            background: 'rgba(52,168,83,0.15)',
                            border: '1px solid rgba(82,183,136,0.4)',
                            color: '#95d5b2'
                        }}
                    >
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        AI-Powered Precision Agriculture
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-none tracking-tight mb-6"
                    >
                        <span className="text-white">Cultivating the</span>
                        <br />
                        <span style={{
                            background: 'linear-gradient(135deg, #95d5b2 0%, #52b788 35%, #f4a261 80%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 30px rgba(82,183,136,0.4))'
                        }}>
                            Future of Farming
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                        className="text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
                        style={{ color: 'rgba(200,240,210,0.65)' }}
                    >
                        Advanced machine learning for precision soil diagnostics, optimal crop yield predictions,
                        and AI-driven fertilizer recommendations.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="flex gap-3 flex-wrap justify-center"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(52,168,83,0.5)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => document.getElementById('analyze')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 rounded-2xl font-bold text-white text-lg"
                            style={{ background: 'linear-gradient(135deg, #2d6a4f, #52b788)', boxShadow: '0 4px 20px rgba(52,168,83,0.35)' }}
                        >
                            🌱 Analyze My Soil
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={goToChat}
                            className="px-8 py-4 rounded-2xl font-bold text-green-300 text-lg"
                            style={{ background: 'rgba(52,168,83,0.12)', border: '1px solid rgba(82,183,136,0.35)' }}
                        >
                            🤖 Ask AI
                        </motion.button>
                    </motion.div>

                    {/* Scroll cue */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2"
                    >
                        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                            <ChevronDown className="w-6 h-6 text-green-400/50" />
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ─── FEATURE CARDS ─── */}
            <section className="py-16 px-4 max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20"
                >
                    {stats.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.04, y: -4 }}
                            className="agri-card p-5 text-center"
                        >
                            <div className="text-3xl mb-3">{s.emoji}</div>
                            <div className="text-green-300 font-bold text-sm mb-1">{s.label}</div>
                            <div className="text-white/40 text-xs">{s.desc}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ─── SOIL FORM SECTION ─── */}
                <div id="analyze">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="agri-card p-6 md:p-12 mb-8 relative"
                    >
                        {/* Top accent bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
                            style={{ background: 'linear-gradient(90deg, #2d6a4f, #52b788, #95d5b2, #f4a261)' }} />

                        {/* Decorative farm image strip */}
                        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-48 rounded-r-3xl overflow-hidden opacity-20">
                            <div className="h-full bg-cover bg-center"
                                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=400&auto=format&fit=crop')` }} />
                        </div>

                        <div className="relative z-10">
                            <div className="mb-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">🔬</span>
                                    <h2 className="text-2xl font-bold text-white">Soil Analysis Parameters</h2>
                                </div>
                                <p style={{ color: 'rgba(200,240,210,0.5)' }}>
                                    Enter your soil metrics to generate a precision crop recommendation report
                                </p>
                            </div>
                            <SoilForm onSubmit={handleSubmit} isLoading={loading} />
                        </div>
                    </motion.div>
                </div>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 p-5 rounded-2xl"
                            style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.25)' }}
                        >
                            <div className="flex items-center gap-3 text-red-300 font-medium">
                                <span className="text-2xl">⚠️</span>
                                {error}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results */}
                <div id="results">
                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                            >
                                <PredictionResult result={result} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Footer */}
            <footer className="text-center py-12 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(200,240,210,0.3)' }}>
                <div className="flex justify-center gap-2 mb-2 text-lg">
                    {['🌾', '🌱', '🌿', '🌻', '🌾'].map((e, i) => (
                        <motion.span key={i} animate={{ y: [0, -4, 0] }}
                            transition={{ delay: i * 0.3, duration: 2.5, repeat: Infinity }}>
                            {e}
                        </motion.span>
                    ))}
                </div>
                <p className="text-sm font-medium">© 2025 Smart Agriculture AI • Precision Farming Technology</p>
            </footer>

            {/* Floating Chat Button */}
            <motion.div
                className="fixed bottom-8 right-8 z-50"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.5, type: 'spring', stiffness: 150 }}
            >
                <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={goToChat}
                    className="flex items-center gap-3 pl-6 pr-5 py-4 rounded-full font-semibold text-white relative"
                    style={{
                        background: 'linear-gradient(135deg, #1b4332, #2d6a4f)',
                        boxShadow: '0 8px 32px rgba(45,106,79,0.5), 0 0 0 1px rgba(82,183,136,0.3)'
                    }}
                >
                    <span className="text-base">Ask AI Assistant</span>
                    <div className="p-2 rounded-full" style={{ background: 'rgba(82,183,136,0.25)' }}>
                        <MessageCircle className="w-5 h-5" />
                    </div>
                    {result && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500" />
                        </span>
                    )}
                </motion.button>
            </motion.div>
        </div>
    );
};
