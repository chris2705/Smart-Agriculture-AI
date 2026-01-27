import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Chatbot } from '../components/Chatbot';
import { ArrowLeft, Sprout } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { PlantBackground } from '../components/PlantBackground';

export const ChatPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const result = location.state?.result;

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col">
            {/* Full-screen plant background - Clearer/Less Blurred */}
            <PlantBackground opacity={0.3} />

            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/60 backdrop-blur-md border-b border-nature-200/50 p-4 shadow-sm sticky top-0 z-20 flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-nature-100 rounded-full transition-colors group"
                    >
                        <ArrowLeft className="w-6 h-6 text-zinc-600 group-hover:text-nature-700" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                            <div className="bg-nature-100 p-1.5 rounded-full">
                                <Sprout className="w-5 h-5 text-nature-600" />
                            </div>
                            Farming Assistant
                        </h1>
                        <p className="text-xs text-zinc-600 font-medium ml-1">AI-powered crop & soil expert</p>
                    </div>
                </div>
            </motion.div>

            {/* Main Chat Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 p-0 md:p-6 max-w-5xl mx-auto w-full h-[calc(100vh-73px)] relative z-10"
            >
                <div className={cn(
                    "h-full w-full md:rounded-3xl overflow-hidden shadow-2xl shadow-nature-900/10",
                    "bg-white/70 backdrop-blur-md border border-white/40",
                    "flex flex-col relative"
                )}>
                    {/* Inner texture/gradient for chat area specifically */}
                    <div className="absolute inset-0 bg-gradient-to-b from-nature-50/50 to-white/30 pointer-events-none" />

                    <Chatbot context={result} fullScreen={true} />
                </div>
            </motion.div>
        </div>
    );
};
