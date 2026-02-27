import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Sprout, CloudSun, ArrowRight, User, LogOut } from 'lucide-react';

export const WelcomePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = () => {
        logout();
        navigate('/');
    };

    // Fallback name if fullName isn't populated
    const userName = user?.full_name || user?.email?.split('@')[0] || 'Farmer';

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-green-50">
            {/* Background */}
            <div className="fixed inset-0 -z-10 bg-green-50"
                style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 40%, #ecfdf5 100%)'
                }} />

            <div className="w-full max-w-4xl p-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white border-2 border-green-200 shadow-md mb-6">
                        <User className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-green-950 tracking-tight">
                        Welcome, {userName}!
                    </h1>
                    <p className="mt-4 text-xl text-green-800 font-medium max-w-2xl mx-auto">
                        What would you like to focus on today?
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {/* Dashboard Option */}
                    <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-green-200 cursor-pointer flex flex-col items-center text-center group transition-all hover:shadow-2xl"
                        onClick={() => navigate('/dashboard')}
                    >
                        <div className="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center mb-6 group-hover:bg-green-500 transition-colors">
                            <Sprout className="w-10 h-10 text-green-600 group-hover:text-white transition-colors" />
                        </div>
                        <h2 className="text-2xl font-bold text-green-900 mb-3">Farm Dashboard</h2>
                        <p className="text-green-700 font-medium mb-8">
                            Manage your fields, add new crops, and generate AI-powered soil analyses.
                        </p>
                        <div className="mt-auto flex items-center gap-2 text-green-600 font-bold group-hover:text-green-500">
                            Go to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </motion.div>

                    {/* Weather Option */}
                    <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-blue-200 cursor-pointer flex flex-col items-center text-center group transition-all hover:shadow-2xl"
                        onClick={() => navigate('/weather')}
                    >
                        <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors">
                            <CloudSun className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        <h2 className="text-2xl font-bold text-blue-900 mb-3">Weather Details</h2>
                        <p className="text-blue-800/80 font-medium mb-8">
                            Check real-time weather forecasts, precipitation, and environmental conditions.
                        </p>
                        <div className="mt-auto flex items-center gap-2 text-blue-600 font-bold group-hover:text-blue-500">
                            View Weather <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </motion.div>
                </div>

                {/* Sign Out */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="flex justify-center mt-10"
                >
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/70 border border-red-200 text-red-500 font-semibold shadow hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </motion.div>
            </div>
        </div>
    );
};
