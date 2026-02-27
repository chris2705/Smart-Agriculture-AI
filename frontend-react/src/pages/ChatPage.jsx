import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Chatbot } from '../components/Chatbot';
import { ArrowLeft, Sprout, Wheat, Droplets, Thermometer } from 'lucide-react';
import { motion } from 'framer-motion';

export const ChatPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [result, setResult] = useState(location.state?.result || null);

    useEffect(() => {
        if (!result) {
            const stored = sessionStorage.getItem('latestAnalysis');
            if (stored) {
                try { setResult(JSON.parse(stored)); } catch (e) { }
            }
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 -z-20"
                style={{ background: 'linear-gradient(160deg, #071a0a 0%, #0f2a0f 50%, #081810 100%)' }} />
            {/* Subtle farm image */}
            <div className="fixed inset-0 -z-10 opacity-[0.07]"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=2070&auto=format&fit=crop')`,
                    backgroundSize: 'cover', backgroundPosition: 'center'
                }} />
            {/* Green radial glow at top */}
            <div className="fixed top-0 inset-x-0 h-64 -z-10 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(52,168,83,0.12) 0%, transparent 100%)' }} />

            {/* ── HEADER ── */}
            <motion.header
                initial={{ y: -70, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex-shrink-0 px-4 sm:px-8 py-4 flex items-center gap-4 z-30"
                style={{
                    background: 'rgba(7,26,10,0.88)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(82,183,136,0.1)'
                }}
            >
                {/* Back */}
                <motion.button
                    whileHover={{ scale: 1.08, x: -3 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => navigate(-1)}
                    className="p-2.5 rounded-2xl transition-all flex-shrink-0"
                    style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    <ArrowLeft className="w-5 h-5 text-green-300" />
                </motion.button>

                {/* Title */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center relative flex-shrink-0"
                        style={{
                            background: 'linear-gradient(135deg, rgba(45,106,79,0.5), rgba(82,183,136,0.25))',
                            border: '1px solid rgba(82,183,136,0.35)'
                        }}>
                        <Sprout className="w-5 h-5 text-green-300" />
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2"
                            style={{ borderColor: '#071a0a' }}>
                            <span className="absolute inset-0 rounded-full bg-green-300 animate-ping opacity-60" />
                        </span>
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-base font-bold text-white leading-tight truncate">Farming Assistant</h1>
                        <p className="text-xs truncate" style={{ color: 'rgba(149,213,178,0.6)' }}>
                            AI-powered crop & soil expert
                        </p>
                    </div>
                </div>
            </motion.header>

            {/* ── MAIN CHAT LAYOUT ── */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: decorative agri panel (desktop only) */}
                <motion.aside
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="hidden xl:flex w-72 flex-shrink-0 flex-col gap-4 p-6"
                    style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}
                >
                    {/* Mini farm image */}
                    <div className="rounded-3xl overflow-hidden h-44 relative">
                        <div className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1625246333195-584050799335?q=80&w=600&auto=format&fit=crop')` }} />
                        <div className="absolute inset-0"
                            style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(7,26,10,0.95) 100%)' }} />
                        <div className="absolute bottom-0 p-4">
                            <p className="text-white font-bold text-sm">Your Smart Farm</p>
                            <p className="text-xs" style={{ color: 'rgba(149,213,178,0.7)' }}>AI-powered insights</p>
                        </div>
                    </div>


                    {/* Tips */}
                    <div className="rounded-3xl p-4"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(149,213,178,0.5)' }}>
                            🌿 Tips
                        </p>
                        <div className="space-y-2 text-xs" style={{ color: 'rgba(200,240,210,0.55)' }}>
                            <p>• Ask about fertilizer schedules</p>
                            <p>• Ask about pest control for your crop</p>
                            <p>• Ask about soil improvement tips</p>
                            <p>• Ask to explain the AI recommendation</p>
                        </div>
                    </div>
                </motion.aside>

                {/* Chat panel */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="flex-1 flex flex-col p-0 sm:p-4 lg:p-6 overflow-hidden"
                >
                    <div className="h-full w-full rounded-none sm:rounded-3xl overflow-hidden flex flex-col relative"
                        style={{
                            background: 'rgba(10,30,14,0.7)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(82,183,136,0.1)',
                            boxShadow: '0 8px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
                        }}
                    >
                        {/* Subtle top glow inside panel */}
                        <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none rounded-t-3xl"
                            style={{ background: 'linear-gradient(180deg, rgba(52,168,83,0.06) 0%, transparent 100%)' }} />
                        <Chatbot context={result} fullScreen={true} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
