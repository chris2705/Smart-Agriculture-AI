import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
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

        const response = await chat(input, context);

        setIsTyping(false);
        const botMsg = { id: Date.now() + 1, text: response.response, sender: 'bot' };
        setMessages(prev => [...prev, botMsg]);
    };

    return (
        <div className={cn(
            "flex flex-col bg-white overflow-hidden",
            fullScreen ? "h-full md:rounded-3xl md:shadow-xl md:border md:border-zinc-100" : "h-[600px] rounded-3xl shadow-xl border border-zinc-100 sticky top-8"
        )}>
            {/* Header */}
            <div className="bg-nature-600 p-4 flex items-center gap-3">
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
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about crops, fertilizers..."
                        className="w-full pl-4 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-nature-500/20 focus:border-nature-500 outline-none transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-nature-600 text-white rounded-lg hover:bg-nature-700 disabled:opacity-50 disabled:hover:bg-nature-600 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
};
