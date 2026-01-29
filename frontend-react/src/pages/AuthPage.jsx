import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
    const [error, setError] = useState('');

    const { login, register, user, loading } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (!loading && user) {
            navigate('/dashboard');
        }
    }, [user, loading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const res = isLogin
            ? await login(formData.email, formData.password)
            : await register(formData.fullName, formData.email, formData.password);

        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex bg-zinc-50 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-nature-200/40 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />

            {/* Left Side - Visual (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-nature-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1625246333195-584050799335?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-b from-nature-900/50 to-nature-900/90" />

                <div className="relative z-10 text-white max-w-lg">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20">
                        <Sprout className="w-8 h-8 text-nature-300" />
                    </div>
                    <h1 className="text-5xl font-display font-bold mb-6 leading-tight">
                        Cultivate Success with <br />
                        <span className="text-nature-300">Intelligent Insights</span>
                    </h1>
                    <p className="text-lg text-nature-100/80 leading-relaxed mb-8">
                        Join thousands of farmers using AI to analyze soil health, predict crop yields, and optimize fertilizer usage for a sustainable future.
                    </p>

                    <div className="grid grid-cols-2 gap-6">
                        {[
                            { label: 'Precision Analysis', val: '98%' },
                            { label: 'Active Farmers', val: '10k+' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <div className="text-2xl font-bold mb-1">{stat.val}</div>
                                <div className="text-sm text-white/60">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <div className="inline-flex lg:hidden bg-nature-100 p-3 rounded-full mb-6">
                            <Sprout className="w-6 h-6 text-nature-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">
                            {isLogin ? 'Welcome back' : 'Create an account'}
                        </h2>
                        <p className="mt-2 text-zinc-500">
                            {isLogin
                                ? 'Enter your credentials to access your dashboard'
                                : 'Start your journey to smarter farming today'}
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-zinc-100">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <AnimatePresence mode="popLayout">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, y: -20 }}
                                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -20 }}
                                        className="space-y-2 overflow-hidden"
                                    >
                                        <label className="text-sm font-medium text-zinc-700 ml-1">Full Name</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required={!isLogin}
                                                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-nature-500/20 focus:border-nature-500 outline-none transition-all"
                                                placeholder="John Doe"
                                                value={formData.fullName}
                                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                            />
                                            <User className="w-5 h-5 text-zinc-400 absolute left-3 top-3.5" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700 ml-1">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-nature-500/20 focus:border-nature-500 outline-none transition-all"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <Mail className="w-5 h-5 text-zinc-400 absolute left-3 top-3.5" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-sm font-medium text-zinc-700 ml-1">Password</label>
                                    {isLogin && (
                                        <a href="#" className="text-sm text-nature-600 hover:text-nature-700 font-medium">Forgot password?</a>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-nature-500/20 focus:border-nature-500 outline-none transition-all"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <Lock className="w-5 h-5 text-zinc-400 absolute left-3 top-3.5" />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={cn(
                                    "w-full py-3.5 rounded-xl text-white font-semibold shadow-lg shadow-nature-500/20 flex items-center justify-center gap-2 transition-all",
                                    "bg-gradient-to-r from-nature-600 to-emerald-600 hover:from-nature-700 hover:to-emerald-700",
                                    isLoading ? "opacity-80 cursor-wait" : "hover:scale-[1.02] active:scale-[0.98]"
                                )}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-zinc-500">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-nature-600 font-semibold hover:text-nature-700 transition-colors"
                        >
                            {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
