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
    const [successMsg, setSuccessMsg] = useState('');

    const { login, register, user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) navigate('/welcome');
    }, [user, loading, navigate]);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const getPasswordStrength = (pass) => {
        let score = 0;
        if (!pass) return score;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[a-z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return Math.max(1, Math.min(score, 5));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (!validateEmail(formData.email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (!isLogin && getPasswordStrength(formData.password) < 3) {
            setError("Password is too weak. Please use at least 8 characters, mixing uppercase, lowercase, numbers, or special characters.");
            return;
        }

        setIsLoading(true);
        if (isLogin) {
            const res = await login(formData.email, formData.password);
            if (res.success) navigate('/welcome');
            else setError(res.message);
        } else {
            const res = await register(formData.fullName, formData.email, formData.password);
            if (res.success) {
                setSuccessMsg(res.message || "Account is created successfully! Please log in.");
                setIsLogin(true);
                setFormData({ ...formData, password: '' });
            } else {
                setError(res.message);
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Very light green background */}
            <div className="fixed inset-0 -z-10 bg-green-50"
                style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 40%, #ecfdf5 100%)'
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
                {/* Light green overlay */}
                <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(160deg, rgba(240,253,244,0.75) 0%, rgba(220,252,231,0.92) 100%)' }} />

                {/* Animated light rays */}
                <div className="absolute top-0 left-1/3 w-1 h-full opacity-20"
                    style={{ background: 'linear-gradient(180deg, #4ade80, transparent)' }} />

                <div className="relative z-10 text-green-900 max-w-lg">
                    {/* Logo badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center gap-3 mb-10"
                    >
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-green-300 bg-white/60 shadow-sm"
                            style={{ backdropFilter: 'blur(10px)' }}>
                            <Sprout className="w-7 h-7 text-green-600" />
                        </div>
                        <span className="text-green-800 font-extrabold text-lg tracking-wider uppercase drop-shadow-sm">SmartAgri AI</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.7 }}
                        className="text-5xl font-extrabold mb-6 leading-tight text-green-950"
                    >
                        Cultivate Success with{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #15803d, #16a34a, #d97706)',
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
                        className="text-green-800 text-lg font-medium leading-relaxed mb-10"
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
                                className="p-4 rounded-2xl border border-green-200 flex items-center gap-3 shadow-sm bg-white/70"
                                style={{ backdropFilter: 'blur(10px)' }}
                            >
                                <span className="text-2xl">{f.icon}</span>
                                <div>
                                    <div className="text-xl font-extrabold text-green-900">{f.val}</div>
                                    <div className="text-xs font-semibold text-green-700">{f.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Crop strip at bottom */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-10 flex items-center gap-2 text-green-700 font-semibold text-sm"
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
                <div className="absolute inset-0 opacity-40"
                    style={{ background: 'radial-gradient(circle at 50% 50%, rgba(134,239,172,0.4), transparent 70%)' }} />

                <div className="w-full max-w-md space-y-8 relative z-10">
                    {/* Mobile logo */}
                    <div className="text-center lg:hidden">
                        <div className="inline-flex items-center gap-2 mb-4 bg-white/60 p-2 pr-4 rounded-2xl shadow-sm border border-green-200">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-100 border border-green-300">
                                <Sprout className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-green-800 font-extrabold text-xl">SmartAgri AI</span>
                        </div>
                    </div>

                    {/* Header */}
                    <div>
                        <motion.h2
                            key={isLogin ? 'login' : 'register'}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-3xl font-extrabold text-green-900 tracking-tight"
                        >
                            {isLogin ? 'Welcome back 👋' : 'Join the farm 🌱'}
                        </motion.h2>
                        <p className="mt-2 text-green-700 font-medium">
                            {isLogin ? 'Sign in to your dashboard' : 'Start your journey to smarter farming'}
                        </p>
                    </div>

                    {/* Form card */}
                    <div className="rounded-3xl p-8 bg-white/80 shadow-xl border border-white"
                        style={{
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 8px 30px rgba(34,197,94,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
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
                                        <label className="text-sm font-bold text-green-800 ml-1">Full Name</label>
                                        <div className="relative">
                                            <input
                                                type="text" required={!isLogin}
                                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border border-green-200 text-green-900 placeholder-green-700/50 focus:bg-white focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all duration-300 outline-none text-sm"
                                                placeholder="John Doe"
                                                value={formData.fullName}
                                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                            />
                                            <User className="w-5 h-5 text-green-500 absolute left-3.5 top-3.5" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-green-800 ml-1">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email" required
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border border-green-200 text-green-900 placeholder-green-700/50 focus:bg-white focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all duration-300 outline-none text-sm"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <Mail className="w-5 h-5 text-green-500 absolute left-3.5 top-3.5" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-sm font-bold text-green-800 ml-1">Password</label>
                                    {isLogin && (
                                        <a href="#" className="text-sm text-green-600 hover:text-green-500 font-bold transition-colors">
                                            Forgot password?
                                        </a>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        type="password" required
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 border border-green-200 text-green-900 placeholder-green-700/50 focus:bg-white focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all duration-300 outline-none text-sm"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <Lock className="w-5 h-5 text-green-500 absolute left-3.5 top-3.5" />
                                </div>

                                <AnimatePresence>
                                    {!isLogin && formData.password && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="pt-1 overflow-hidden"
                                        >
                                            <div className="flex gap-1 mb-1 mt-1">
                                                {[1, 2, 3, 4, 5].map((level) => {
                                                    const strength = getPasswordStrength(formData.password);
                                                    const bgColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-400', 'bg-green-400', 'bg-green-600'];
                                                    const bgColor = bgColors[strength - 1] || bgColors[0];
                                                    return (
                                                        <div
                                                            key={level}
                                                            className={`h-1.5 w-full rounded-full transition-all duration-300 ${level <= strength ? bgColor : 'bg-green-100'
                                                                }`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                            <div className="flex justify-between items-center text-xs mt-1 px-1">
                                                <span className={`${['text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-500', 'text-green-700'][getPasswordStrength(formData.password) - 1] || 'text-red-500'
                                                    } font-bold`}>
                                                    {['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][getPasswordStrength(formData.password) - 1] || 'Very Weak'}
                                                </span>
                                                <span className="text-green-700 font-medium">Requires 3+ bars</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-3 rounded-xl text-red-700 font-semibold text-sm flex items-center gap-2 bg-red-50 border border-red-200"
                                    >
                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {successMsg && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-3 rounded-xl text-green-700 font-semibold text-sm flex items-center gap-2 bg-green-50 border border-green-200"
                                    >
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                                        {successMsg}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                className={cn(
                                    "w-full py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg",
                                    isLoading ? "opacity-70 cursor-wait" : ""
                                )}
                                style={{
                                    background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
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

                    <p className="text-center text-green-800 font-medium text-sm">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }}
                            className="text-green-600 font-extrabold hover:text-green-500 transition-colors ml-1"
                        >
                            {isLogin ? 'Sign up free →' : 'Log in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
