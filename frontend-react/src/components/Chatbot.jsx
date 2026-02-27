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
                style={{ background: '#16a34a' }}
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
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0 bg-white/80 shadow-sm border-b border-green-200"
                style={{
                    backdropFilter: 'blur(10px)'
                }}>
                <div className="flex items-center gap-3">
                    {/* Bot avatar */}
                    <div className="relative w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-green-100 border border-green-300">
                        <Bot className="w-5 h-5 text-green-700" />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white">
                            <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-60" />
                        </span>
                    </div>
                    <div>
                        <h3 className="text-green-950 font-extrabold text-sm leading-tight">Farming Assistant</h3>
                        <p className="text-xs flex items-center gap-1 font-semibold text-green-700">
                            <Sparkles className="w-3 h-3 text-yellow-500" />
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
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-green-50 border border-green-200 text-green-800"
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
                        className={`p-2 rounded-xl transition-all border ${isSpeakingEnabled ? 'bg-green-100 border-green-300 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                        title={isSpeakingEnabled ? "Disable TTS" : "Enable TTS"}
                    >
                        {isSpeakingEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </motion.button>
                </div>
            </div>

            {/* ── MESSAGES ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-green-50/50"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#86efac transparent'
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
                            <div className={`w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-green-600 text-white' : 'bg-white border border-green-200 text-green-700'}`}>
                                {msg.sender === 'user'
                                    ? <User className="w-4 h-4" />
                                    : <Leaf className="w-4 h-4 text-green-600" />
                                }
                            </div>

                            {/* Bubble */}
                            <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user' ? 'rounded-tr-sm bg-green-600 text-white' : 'rounded-tl-sm bg-white border border-green-100 text-green-900 font-medium'}`}
                            >
                                <ReactMarkdown
                                    className={`prose prose-sm max-w-none ${msg.sender === 'user' ? 'prose-invert' : ''}`}
                                    components={{
                                        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                                        strong: ({ children }) => <strong className={msg.sender === 'user' ? 'text-white' : 'text-green-800'}>{children}</strong>,
                                        ul: ({ children }) => <ul className="list-disc ml-4 space-y-1">{children}</ul>,
                                        li: ({ children }) => <li>{children}</li>,
                                        code: ({ children }) => (
                                            <code className="px-1.5 py-0.5 rounded text-xs font-mono bg-green-100 text-green-800">
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
                            <div className="w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white border border-green-200">
                                <Leaf className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-green-100 shadow-sm">
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
                            <p className="text-xs mb-3 ml-11 font-bold text-green-700">
                                💡 Try asking:
                            </p>
                            <div className="flex flex-wrap gap-2 ml-11">
                                {SUGGESTIONS.map((s, i) => (
                                    <motion.button
                                        key={i}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => handleSend(null, s)}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-white border border-green-300 text-green-800 shadow-sm hover:bg-green-50"
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
                className="flex-shrink-0 px-4 py-4 bg-white/90 border-t border-green-200"
                style={{
                    backdropFilter: 'blur(16px)'
                }}
            >
                <div className="flex gap-2 items-center">
                    {/* Mic button */}
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={toggleListening}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all border ${isListening ? 'bg-red-50 border-red-300 text-red-500' : 'bg-green-50 border-green-200 text-green-600'}`}
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
                            className={`w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all font-medium ${isListening ? 'bg-green-50 border-green-300 text-green-900 border' : 'bg-gray-50 border-gray-200 border text-gray-900 focus:bg-white focus:border-green-400 focus:ring-2 focus:ring-green-100'}`}
                        />
                    </div>

                    {/* Send button */}
                    <motion.button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        whileHover={input.trim() && !isTyping ? { scale: 1.08 } : {}}
                        whileTap={input.trim() && !isTyping ? { scale: 0.92 } : {}}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${input.trim() && !isTyping ? 'bg-green-600 text-white shadow-md hover:bg-green-500 hover:shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                        <Send className="w-4 h-4" />
                    </motion.button>
                </div>
            </form>
        </div>
    );
};
