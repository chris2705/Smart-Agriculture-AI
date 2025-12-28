import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Chatbot } from '../components/Chatbot';
import { ArrowLeft, Sprout } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export const ChatPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const result = location.state?.result;

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col relative overflow-hidden">
            {/* Background decoration matching Home */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-nature-100/50 to-transparent -z-10" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-nature-200/30 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-earth-50 to-transparent -z-10" />

            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/80 backdrop-blur-xl border-b border-white/50 p-4 shadow-sm sticky top-0 z-20 flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-zinc-100 rounded-full transition-colors group"
                    >
                        <ArrowLeft className="w-6 h-6 text-zinc-600 group-hover:text-zinc-900" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                            <Sprout className="w-5 h-5 text-nature-600" />
                            Farming Assistant
                        </h1>
                        <p className="text-xs text-zinc-500">AI-powered crop & soil expert</p>
                    </div>
                </div>
            </motion.div>

            {/* Main Chat Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 p-0 md:p-6 max-w-5xl mx-auto w-full h-[calc(100vh-73px)]"
            >
                <div className={cn(
                    "h-full w-full md:rounded-3xl overflow-hidden shadow-2xl",
                    "bg-white/90 backdrop-blur-sm border border-white/60",
                    "flex flex-col"
                )}>
                    <Chatbot context={result} fullScreen={true} />
                </div>
            </motion.div>
        </div>
    );
};
