import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const FloatingChatButton = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Don't show on the chat page itself
    if (location.pathname === '/chat') {
        return null;
    }

    return (
        <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/chat')}
            className="fixed bottom-6 right-6 z-50 bg-nature-600 text-white p-4 rounded-full shadow-2xl hover:bg-nature-700 transition-colors group"
            title="Open AI Assistant"
        >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        </motion.button>
    );
};
