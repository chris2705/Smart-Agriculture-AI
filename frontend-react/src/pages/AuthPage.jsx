import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Mail, Lock, User, ArrowRight, Loader2, Leaf, Sun, Droplets } from 'lucide-react';
import { cn } from '../lib/utils';

// Floating agri particles
const FloatingLeaf = ({ delay, size, left, top }) => (
    <motion.div
        className="absolute pointer-events-none select-none"
        style={{ left: `${left}%`, top: `${top}%`, fontSize: size }}
        initial={{ opacity: 0, y: 0, rotate: 0 }}
        animate={{ opacity: [0, 0.6, 0.6, 0], y: [-20, -120], rotate: [0, 45, 90] }}
        transition={{ duration: 8, delay, repeat: Infinity, repeatDelay: Math.random() * 5 }}
    >
        🌿
    </motion.div>
);

const features = [
    { icon: '🌾', label: 'Precision Analysis', val: '98%' },
    { icon: '👨‍🌾', label: 'Active Farmers', val: '10k+' },
    { icon: '🌱', label: 'Crops Monitored', val: '500+' },
    { icon: '💧', label: 'Water Saved', val: '40%' },
];

export const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
    const [error, setError] = useState('');

    const { login, register, user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) navigate('/dashboard');
    }, [user, loading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const res = isLogin
            ? await login(formData.email, formData.password)
            : await register(formData.fullName, formData.email, formData.password);
        if (res.success) navigate('/dashboard');
        else setError(res.message);
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Deep green background */}
            <div className="fixed inset-0 -z-10"
                style={{
                    background: 'linear-gradient(135deg, #071a0a 0%, #0f2a0f 40%, #0d1f1a 100%)'
                }} />

            {/* Floating leaves */}
            {[...Array(8)].map((_, i) => (
                <FloatingLeaf key={i} delay={i * 1.2} size={`${14 + i * 2}px`}
                    left={10 + i * 12} top={20 + (i % 3) * 20} />
            ))}

            {/* Left side — hero image + info */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden">
                {/* Agricultural background photo */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1625246333195-584050799335?q=80&w=2070&auto=format&fit=crop')`
                    }}
                />
                {/* Dark green overlay */}
                <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(160deg, rgba(7,26,10,0.75) 0%, rgba(7,26,10,0.92) 100%)' }} />

                {/* Animated light rays */}
                <div className="absolute top-0 left-1/3 w-1 h-full opacity-10"
                    style={{ background: 'linear-gradient(180deg, #95d5b2, transparent)' }} />

                <div className="relative z-10 text-white max-w-lg">
                    {/* Logo badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center gap-3 mb-10"
                    >
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-green-400/30"
                            style={{ background: 'rgba(52,168,83,0.2)', backdropFilter: 'blur(10px)' }}>
                            <Sprout className="w-7 h-7 text-green-300" />
                        </div>
                        <span className="text-green-300 font-semibold text-lg tracking-wider uppercase">SmartAgri AI</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.7 }}
                        className="text-5xl font-bold mb-6 leading-tight"
                    >
                        Cultivate Success with{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #95d5b2, #52b788, #f4a261)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Intelligent Insights
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.7 }}
                        className="text-green-100/70 text-lg leading-relaxed mb-10"
                    >
                        AI-powered soil analysis and precision crop recommendations for the modern farmer.
                    </motion.p>

                    {/* Stats grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.7 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.04 }}
                                className="p-4 rounded-2xl border border-white/10 flex items-center gap-3"
                                style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}
                            >
                                <span className="text-2xl">{f.icon}</span>
                                <div>
                                    <div className="text-xl font-bold text-white">{f.val}</div>
                                    <div className="text-xs text-white/50">{f.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Crop strip at bottom */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-10 flex items-center gap-2 text-green-400/60 text-sm"
                    >
                        <div className="flex gap-1">
                            {['🌾', '🌽', '🍅', '🌿', '🥕', '🫘'].map((e, i) => (
                                <motion.span key={i} animate={{ y: [0, -5, 0] }}
                                    transition={{ delay: i * 0.2, duration: 2, repeat: Infinity }}>
                                    {e}
                                </motion.span>
                            ))}
                        </div>
                        <span>Trusted by farmers worldwide</span>
                    </motion.div>
                </div>
            </div>

            {/* Right side — form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
                {/* Subtle green gradient bg */}
                <div className="absolute inset-0 opacity-30"
                    style={{ background: 'radial-gradient(circle at 50% 50%, rgba(52,168,83,0.15), transparent 70%)' }} />

                <div className="w-full max-w-md space-y-8 relative z-10">
                    {/* Mobile logo */}
                    <div className="text-center lg:hidden">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: 'rgba(52,168,83,0.2)', border: '1px solid rgba(52,168,83,0.4)' }}>
                                <Sprout className="w-5 h-5 text-green-400" />
                            </div>
                            <span className="text-green-300 font-bold text-xl">SmartAgri AI</span>
                        </div>
                    </div>

                    {/* Header */}
                    <div>
                        <motion.h2
                            key={isLogin ? 'login' : 'register'}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-3xl font-bold text-white tracking-tight"
                        >
                            {isLogin ? 'Welcome back 👋' : 'Join the farm 🌱'}
                        </motion.h2>
                        <p className="mt-2 text-green-300/60">
                            {isLogin ? 'Sign in to your dashboard' : 'Start your journey to smarter farming'}
                        </p>
                    </div>

                    {/* Form card */}
                    <div className="rounded-3xl p-8"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)'
                        }}>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <AnimatePresence mode="popLayout">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, y: -10 }}
                                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -10 }}
                                        className="space-y-2 overflow-hidden"
                                    >
                                        <label className="text-sm font-medium text-green-300/80 ml-1">Full Name</label>
                                        <div className="relative">
                                            <input
                                                type="text" required={!isLogin}
                                                className="w-full pl-11 pr-4 py-3 rounded-xl text-white glass-input text-sm"
                                                placeholder="John Doe"
                                                value={formData.fullName}
                                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                            />
                                            <User className="w-5 h-5 text-green-400/60 absolute left-3.5 top-3.5" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-green-300/80 ml-1">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email" required
                                        className="w-full pl-11 pr-4 py-3 rounded-xl text-white glass-input text-sm"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <Mail className="w-5 h-5 text-green-400/60 absolute left-3.5 top-3.5" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-sm font-medium text-green-300/80 ml-1">Password</label>
                                    {isLogin && (
                                        <a href="#" className="text-sm text-green-400 hover:text-green-300 font-medium transition-colors">
                                            Forgot password?
                                        </a>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        type="password" required
                                        className="w-full pl-11 pr-4 py-3 rounded-xl text-white glass-input text-sm"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <Lock className="w-5 h-5 text-green-400/60 absolute left-3.5 top-3.5" />
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-3 rounded-xl text-red-300 text-sm flex items-center gap-2"
                                        style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.2)' }}
                                    >
                                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                className={cn(
                                    "w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all",
                                    isLoading ? "opacity-70 cursor-wait" : ""
                                )}
                                style={{
                                    background: 'linear-gradient(135deg, #2d6a4f 0%, #52b788 60%, #40916c 100%)',
                                    boxShadow: '0 4px 20px rgba(52,168,83,0.35)'
                                }}
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </div>

                    <p className="text-center text-green-300/50 text-sm">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            className="text-green-400 font-semibold hover:text-green-300 transition-colors ml-1"
                        >
                            {isLogin ? 'Sign up free →' : 'Log in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
