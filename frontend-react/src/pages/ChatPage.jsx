import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Chatbot } from '../components/Chatbot';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const ChatPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const result = location.state?.result;

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col">
            <div className="bg-white border-b border-zinc-200 p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-zinc-600" />
                </button>
                <h1 className="text-lg font-semibold text-zinc-800">Farming Assistant</h1>
            </div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 p-0 md:p-4 max-w-2xl mx-auto w-full"
            >
                <div className="h-full md:h-[calc(100vh-100px)]">
                    <Chatbot context={result} fullScreen={true} />
                </div>
            </motion.div>
        </div>
    );
};
