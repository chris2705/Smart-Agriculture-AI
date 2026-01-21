import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Mic, MicOff, Volume2, VolumeX, Languages } from 'lucide-react';
import { chat } from '../api/client';
import { cn } from '../lib/utils';

export const Chatbot = ({ context, fullScreen = false }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your farming assistant. Once you get a recommendation, I can explain it further.", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const hasShownWelcome = useRef(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Voice State
    const [isListening, setIsListening] = useState(false);
    const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(false);
    const [language, setLanguage] = useState('en-US'); // 'en-US' or 'ml-IN'

    const recognitionRef = useRef(null);
    const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

    useEffect(() => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(prev => (prev ? prev + ' ' : '') + transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        return () => {
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.lang = language; // Set language dynamically
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const speak = (text) => {
        if (!isSpeakingEnabled || !synthRef.current) return;

        synthRef.current.cancel();
        // Simple cleanup for better speech
        const cleanText = text.replace(/[*_#`]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);

        // Try to set language
        utterance.lang = language;

        // Optional: Try to find a specific voice for the language
        const voices = synthRef.current.getVoices();
        const voice = voices.find(v => v.lang === language);
        if (voice) {
            utterance.voice = voice;
        }

        synthRef.current.speak(utterance);
    };

    useEffect(() => {
        if (context?.prediction && !hasShownWelcome.current) {
            hasShownWelcome.current = true;
            setMessages(prev => [
                ...prev,
                { id: Date.now(), text: `I see you got a recommendation for **${context.prediction}**. Feel free to ask me why, or about fertilizer usage!`, sender: 'bot' }
            ]);
        }
    }, [context]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Pass language context if not English
        const contextWithLang = { ...context, language: language };
        const response = await chat(input, contextWithLang);

        setIsTyping(false);
        const botMsg = { id: Date.now() + 1, text: response.response, sender: 'bot' };
        setMessages(prev => [...prev, botMsg]);
        speak(response.response);
    };

    return (
        <div className={cn(
            "flex flex-col bg-white overflow-hidden",
            fullScreen ? "h-full md:rounded-3xl md:shadow-xl md:border md:border-zinc-100" : "h-[600px] rounded-3xl shadow-xl border border-zinc-100 sticky top-8"
        )}>
            {/* Header */}
            <div className="bg-nature-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                        <Bot className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">Farming Assistant</h3>
                        <p className="text-nature-100 text-xs flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> AI Powered
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setLanguage(l => l === 'en-US' ? 'ml-IN' : 'en-US')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 text-white text-xs font-medium transition-colors border border-white/10"
                        title="Switch Language"
                    >
                        <Languages className="w-3.5 h-3.5" />
                        <span>{language === 'en-US' ? 'EN' : 'MAL'}</span>
                    </button>
                    <button
                        onClick={() => setIsSpeakingEnabled(!isSpeakingEnabled)}
                        className={cn(
                            "p-2 rounded-lg transition-all text-white",
                            isSpeakingEnabled ? "bg-white/20 shadow-inner ring-1 ring-white/30" : "hover:bg-white/10"
                        )}
                        title={isSpeakingEnabled ? "Disable Text-to-Speech" : "Enable Text-to-Speech"}
                    >
                        {isSpeakingEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 opacity-70" />}
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "flex gap-3 max-w-[85%]",
                            msg.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                            msg.sender === 'user' ? "bg-zinc-200" : "bg-nature-100"
                        )}>
                            {msg.sender === 'user' ? <User className="w-5 h-5 text-zinc-600" /> : <Bot className="w-5 h-5 text-nature-600" />}
                        </div>

                        <div className={cn(
                            "p-3 rounded-2xl text-sm leading-relaxed",
                            msg.sender === 'user'
                                ? "bg-zinc-800 text-white rounded-tr-none"
                                : "bg-white border border-zinc-200 text-zinc-700 rounded-tl-none shadow-sm"
                        )}>
                            <ReactMarkdown className="prose prose-sm max-w-none dark:prose-invert">
                                {msg.text}
                            </ReactMarkdown>
                        </div>
                    </motion.div>
                ))}
                {isTyping && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-nature-100 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-nature-600" />
                        </div>
                        <div className="bg-white border border-zinc-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-100" />
                                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-zinc-100">
                <div className="relative flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isListening ? "Listening..." : "Ask about crops, fertilizers..."}
                            className={cn(
                                "w-full pl-4 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-nature-500/20 focus:border-nature-500 outline-none transition-all",
                                isListening && "ring-2 ring-nature-500/20 border-nature-500 bg-nature-50/50"
                            )}
                        />
                        <button
                            type="button"
                            onClick={toggleListening}
                            className={cn(
                                "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors",
                                isListening
                                    ? "bg-red-500 text-white hover:bg-red-600 animate-pulse"
                                    : "text-zinc-500 hover:bg-zinc-100"
                            )}
                            title="Toggle Voice Input"
                        >
                            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="p-3 bg-nature-600 text-white rounded-xl hover:bg-nature-700 disabled:opacity-50 disabled:hover:bg-nature-600 transition-colors shrink-0"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};
