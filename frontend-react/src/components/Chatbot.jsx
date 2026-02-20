import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Mic, MicOff, Volume2, VolumeX, Languages, Leaf } from 'lucide-react';
import { chat } from '../api/client';

const SUGGESTIONS = [
    "Why was this crop recommended?",
    "How should I apply the fertilizer?",
    "What's the best watering schedule?",
    "How can I improve soil pH?",
];

const TypingDots = () => (
    <div className="flex items-center gap-1.5 px-1 py-1">
        {[0, 1, 2].map(i => (
            <motion.span
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: '#52b788' }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
        ))}
    </div>
);

export const Chatbot = ({ context, fullScreen = false }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! 🌱 I'm your AI farming assistant. Get a soil analysis first, then ask me anything about your crops, fertilizers, or soil health!", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const hasShownWelcome = useRef(false);
    const inputRef = useRef(null);

    const [isListening, setIsListening] = useState(false);
    const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(false);
    const [language, setLanguage] = useState('en-US');

    const recognitionRef = useRef(null);
    const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.onresult = (e) => {
                setInput(prev => (prev ? prev + ' ' : '') + e.results[0][0].transcript);
                setIsListening(false);
            };
            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        }
        return () => synthRef.current?.cancel();
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) return alert("Speech recognition not supported.");
        if (isListening) { recognitionRef.current.stop(); }
        else { recognitionRef.current.lang = language; recognitionRef.current.start(); setIsListening(true); }
    };

    const speak = (text) => {
        if (!isSpeakingEnabled || !synthRef.current) return;
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text.replace(/[*_#`]/g, ''));
        utterance.lang = language;
        const voices = synthRef.current.getVoices();
        const voice = voices.find(v => v.lang === language) || voices.find(v => v.lang.startsWith(language.split('-')[0]));
        if (voice) utterance.voice = voice;
        synthRef.current.speak(utterance);
    };

    useEffect(() => {
        if (context?.prediction && !hasShownWelcome.current) {
            hasShownWelcome.current = true;
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: `🌾 I can see your analysis recommends **${context.prediction}**. Ask me why, about fertilizer usage, watering schedules, or anything else!`,
                sender: 'bot'
            }]);
        }
    }, [context]);

    const handleSend = async (e, overrideText) => {
        e?.preventDefault();
        const text = overrideText || input;
        if (!text.trim() || isTyping) return;

        const userMsg = { id: Date.now(), text, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await chat(text, { ...context, language });
            const botMsg = { id: Date.now() + 1, text: response.response, sender: 'bot' };
            setMessages(prev => [...prev, botMsg]);
            speak(response.response);
        } catch (err) {
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, I couldn't reach the server. Please try again.", sender: 'bot' }]);
        } finally {
            setIsTyping(false);
        }
        inputRef.current?.focus();
    };

    const showSuggestions = messages.length <= 2;

    return (
        <div className="flex flex-col h-full overflow-hidden" style={{ background: 'transparent' }}>
            {/* ── HEADER ── */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                style={{
                    background: 'linear-gradient(135deg, rgba(29,74,41,0.95), rgba(45,106,79,0.9))',
                    borderBottom: '1px solid rgba(82,183,136,0.2)',
                    backdropFilter: 'blur(10px)'
                }}>
                <div className="flex items-center gap-3">
                    {/* Bot avatar */}
                    <div className="relative w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, rgba(82,183,136,0.3), rgba(52,168,83,0.2))', border: '1px solid rgba(82,183,136,0.4)' }}>
                        <Bot className="w-5 h-5 text-green-300" />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2"
                            style={{ borderColor: '#1d4a29' }}>
                            <span className="absolute inset-0 rounded-full bg-green-300 animate-ping opacity-60" />
                        </span>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm leading-tight">Farming Assistant</h3>
                        <p className="text-xs flex items-center gap-1" style={{ color: 'rgba(149,213,178,0.8)' }}>
                            <Sparkles className="w-3 h-3" />
                            Powered by Gemini AI
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    {/* Language toggle */}
                    <motion.button
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setLanguage(l => l === 'en-US' ? 'ml-IN' : 'en-US')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: 'rgba(200,240,210,0.9)'
                        }}
                        title="Switch Language"
                    >
                        <Languages className="w-3.5 h-3.5" />
                        {language === 'en-US' ? 'EN' : 'MAL'}
                    </motion.button>

                    {/* TTS toggle */}
                    <motion.button
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setIsSpeakingEnabled(!isSpeakingEnabled)}
                        className="p-2 rounded-xl transition-all"
                        style={{
                            background: isSpeakingEnabled ? 'rgba(82,183,136,0.3)' : 'rgba(255,255,255,0.08)',
                            border: `1px solid ${isSpeakingEnabled ? 'rgba(82,183,136,0.5)' : 'rgba(255,255,255,0.12)'}`,
                            color: isSpeakingEnabled ? '#95d5b2' : 'rgba(200,240,210,0.5)'
                        }}
                        title={isSpeakingEnabled ? "Disable TTS" : "Enable TTS"}
                    >
                        {isSpeakingEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </motion.button>
                </div>
            </div>

            {/* ── MESSAGES ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
                style={{
                    background: 'linear-gradient(180deg, rgba(7,26,10,0.6) 0%, rgba(10,32,14,0.5) 100%)',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#2d6a4f transparent'
                }}>

                <AnimatePresence initial={false}>
                    {messages.map(msg => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 16, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? '' : ''}`}
                                style={msg.sender === 'user'
                                    ? { background: 'linear-gradient(135deg, #1b4332, #2d6a4f)', border: '1px solid rgba(82,183,136,0.3)' }
                                    : { background: 'rgba(52,168,83,0.15)', border: '1px solid rgba(82,183,136,0.25)' }
                                }>
                                {msg.sender === 'user'
                                    ? <User className="w-4 h-4 text-green-300" />
                                    : <Leaf className="w-4 h-4 text-green-400" />
                                }
                            </div>

                            {/* Bubble */}
                            <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                                style={msg.sender === 'user'
                                    ? {
                                        background: 'linear-gradient(135deg, #1b4332, #2d6a4f)',
                                        color: 'rgba(220,255,230,0.95)',
                                        border: '1px solid rgba(82,183,136,0.25)',
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.25)'
                                    }
                                    : {
                                        background: 'rgba(255,255,255,0.06)',
                                        color: 'rgba(200,240,215,0.9)',
                                        border: '1px solid rgba(255,255,255,0.09)',
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                                    }
                                }
                            >
                                <ReactMarkdown
                                    className="prose prose-sm max-w-none"
                                    components={{
                                        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                                        strong: ({ children }) => <strong style={{ color: '#95d5b2', fontWeight: 700 }}>{children}</strong>,
                                        ul: ({ children }) => <ul className="list-disc ml-4 space-y-1">{children}</ul>,
                                        li: ({ children }) => <li style={{ color: 'rgba(200,240,215,0.85)' }}>{children}</li>,
                                        code: ({ children }) => (
                                            <code className="px-1.5 py-0.5 rounded text-xs font-mono"
                                                style={{ background: 'rgba(82,183,136,0.15)', color: '#95d5b2' }}>
                                                {children}
                                            </code>
                                        ),
                                    }}
                                >
                                    {msg.text}
                                </ReactMarkdown>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing indicator */}
                <AnimatePresence>
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex gap-3"
                        >
                            <div className="w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0"
                                style={{ background: 'rgba(52,168,83,0.15)', border: '1px solid rgba(82,183,136,0.25)' }}>
                                <Leaf className="w-4 h-4 text-green-400" />
                            </div>
                            <div className="px-4 py-3 rounded-2xl rounded-tl-sm"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
                                <TypingDots />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Quick suggestions */}
                <AnimatePresence>
                    {showSuggestions && !isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="pt-2"
                        >
                            <p className="text-xs mb-3 ml-11" style={{ color: 'rgba(149,213,178,0.5)' }}>
                                💡 Try asking:
                            </p>
                            <div className="flex flex-wrap gap-2 ml-11">
                                {SUGGESTIONS.map((s, i) => (
                                    <motion.button
                                        key={i}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => handleSend(null, s)}
                                        className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                                        style={{
                                            background: 'rgba(52,168,83,0.1)',
                                            border: '1px solid rgba(82,183,136,0.25)',
                                            color: '#95d5b2'
                                        }}
                                    >
                                        {s}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
            </div>

            {/* ── INPUT BAR ── */}
            <form
                onSubmit={handleSend}
                className="flex-shrink-0 px-4 py-4"
                style={{
                    background: 'rgba(7,26,10,0.9)',
                    backdropFilter: 'blur(16px)',
                    borderTop: '1px solid rgba(82,183,136,0.12)'
                }}
            >
                <div className="flex gap-2 items-center">
                    {/* Mic button */}
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={toggleListening}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all"
                        style={isListening
                            ? { background: 'rgba(255,80,80,0.2)', border: '1px solid rgba(255,80,80,0.4)', color: '#fca5a5' }
                            : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(200,240,210,0.5)' }
                        }
                        title="Voice Input"
                    >
                        {isListening
                            ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                                <MicOff className="w-4 h-4" />
                            </motion.div>
                            : <Mic className="w-4 h-4" />
                        }
                    </motion.button>

                    {/* Text input */}
                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={isListening ? "🎙 Listening..." : "Ask about crops, fertilizers, soil..."}
                            className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
                            style={{
                                background: isListening ? 'rgba(52,168,83,0.1)' : 'rgba(255,255,255,0.06)',
                                border: `1px solid ${isListening ? 'rgba(82,183,136,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                color: 'rgba(220,255,230,0.9)',
                                caretColor: '#52b788'
                            }}
                        />
                    </div>

                    {/* Send button */}
                    <motion.button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        whileHover={input.trim() && !isTyping ? { scale: 1.08 } : {}}
                        whileTap={input.trim() && !isTyping ? { scale: 0.92 } : {}}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                            background: input.trim() && !isTyping
                                ? 'linear-gradient(135deg, #2d6a4f, #52b788)'
                                : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${input.trim() && !isTyping ? 'rgba(82,183,136,0.4)' : 'rgba(255,255,255,0.08)'}`,
                            color: input.trim() && !isTyping ? 'white' : 'rgba(200,240,210,0.25)',
                            boxShadow: input.trim() && !isTyping ? '0 4px 16px rgba(45,106,79,0.35)' : 'none',
                            cursor: !input.trim() || isTyping ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <Send className="w-4 h-4" />
                    </motion.button>
                </div>
            </form>
        </div>
    );
};
