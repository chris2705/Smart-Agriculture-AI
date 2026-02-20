import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const FloatingChatButton = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Hide on the chat page itself
    if (location.pathname === '/chat') return null;

    return (
        <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1, type: 'spring', stiffness: 200, damping: 15 }}
            whileHover={{ scale: 1.12, boxShadow: '0 0 30px rgba(52,168,83,0.6)' }}
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate('/chat')}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white transition-all"
            style={{
                background: 'linear-gradient(135deg, #1b4332, #2d6a4f)',
                boxShadow: '0 6px 24px rgba(45,106,79,0.5), 0 0 0 1px rgba(82,183,136,0.3)'
            }}
            title="Open AI Assistant"
        >
            <MessageCircle className="w-6 h-6" />
            {/* Pulsing ring */}
            <span className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{ background: 'rgba(82,183,136,0.4)', animationDuration: '2s' }} />
            {/* Live dot */}
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2"
                style={{ borderColor: '#071a0a' }}>
                <span className="absolute inset-0 rounded-full bg-green-300 animate-ping opacity-75" />
            </span>
        </motion.button>
    );
};
