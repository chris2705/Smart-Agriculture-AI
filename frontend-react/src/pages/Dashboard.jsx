import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Sprout, MapPin, Ruler, ChevronRight, LogOut, Trash2, User as UserIcon, LayoutGrid, ArrowLeft } from 'lucide-react';
import { AddFieldWizard } from '../components/AddFieldWizard';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import BACKEND_URL from '../api/client';

const cropImages = {
    wheat: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&q=70&auto=format&fit=crop',
    rice: 'https://images.unsplash.com/photo-1536054395116-10f8b4fd7bde?w=400&q=70&auto=format&fit=crop',
    corn: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=70&auto=format&fit=crop',
    default: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=70&auto=format&fit=crop',
};

const getCropImage = (cropType) => {
    if (!cropType || cropType === 'None') return cropImages.default;
    const lower = cropType.toLowerCase();
    if (lower.includes('wheat')) return cropImages.wheat;
    if (lower.includes('rice')) return cropImages.rice;
    if (lower.includes('corn') || lower.includes('maize')) return cropImages.corn;
    return cropImages.default;
};

const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

export const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [fields, setFields] = useState([]);
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    React.useEffect(() => {
        const fetchFields = async () => {
            const token = localStorage.getItem('token');
            if (!token) return; // Don't fetch if not authenticated
            try {
                const res = await axios.get(`${BACKEND_URL}/fields/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFields(res.data);
            } catch (err) {
                console.error("Failed to fetch fields", err);
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };
        fetchFields();
    }, [user]);

    const handleLogout = () => { logout(); navigate('/login'); };
    const handleAddField = (newField) => { setFields([...fields, newField]); setIsWizardOpen(false); };

    const handleDeleteField = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this field?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${BACKEND_URL}/fields/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFields(fields.filter(f => f.id !== id));
        } catch (err) {
            console.error("Failed to delete field", err);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-green-50">
            {/* Background */}
            <div className="fixed inset-0 -z-20"
                style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 50%, #ecfdf5 100%)' }} />
            <div className="fixed inset-0 -z-10 opacity-[0.05]"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2070&auto=format&fit=crop')`,
                    backgroundSize: 'cover', backgroundPosition: 'center'
                }} />
            <div className="fixed inset-0 -z-10 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(74,222,128,0.2) 0%, transparent 70%)' }} />

            {/* Top nav */}
            <motion.nav
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
                style={{
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(34,197,94,0.2)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                }}
            >
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white shadow-sm border border-green-200">
                        <Sprout className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-green-800 font-extrabold text-lg tracking-wide">SmartAgri AI</span>
                </div>

                {/* User + Actions */}
                {user && (
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/welcome')}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-green-700 hover:text-green-800 bg-green-50 border border-green-200 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:block">Welcome Page</span>
                        </motion.button>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 shadow-sm border border-green-100">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                                {user.full_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-green-900 font-semibold text-sm">{user.full_name}</span>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:text-red-600 bg-red-50 border border-red-200 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:block">Sign Out</span>
                        </motion.button>
                    </div>
                )}
            </motion.nav>

            <div className="container mx-auto px-4 py-10 max-w-6xl relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex justify-between items-end mb-10"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <LayoutGrid className="w-5 h-5 text-green-600" />
                            <span className="text-green-700 text-sm font-extrabold uppercase tracking-wider">My Fields</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-green-950">Farm Dashboard</h1>
                        <p className="mt-1 text-green-800 font-medium">
                            Manage your crops and soil health reports
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.06, boxShadow: '0 8px 30px rgba(34,197,94,0.3)' }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setIsWizardOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white shadow-lg"
                        style={{
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)'
                        }}
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:block">Add Field</span>
                    </motion.button>
                </motion.div>

                {/* Fields grid or empty state */}
                <AnimatePresence mode="wait">
                    {fields.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="agri-card p-16 text-center"
                        >
                            {/* background img in empty state */}
                            <div className="absolute inset-0 rounded-3xl overflow-hidden opacity-10">
                                <div className="h-full bg-cover bg-center"
                                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2070&auto=format&fit=crop')` }} />
                            </div>
                            <div className="relative z-10">
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="text-6xl mb-6"
                                >
                                    🌾
                                </motion.div>
                                <h3 className="text-2xl font-extrabold text-green-900 mb-3">No fields added yet</h3>
                                <p className="max-w-sm mx-auto mb-8 text-green-700 font-medium">
                                    Add your first field to get personalized crop recommendations and soil analysis.
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => setIsWizardOpen(true)}
                                    className="px-8 py-3 rounded-2xl font-bold text-white shadow-md"
                                    style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                                >
                                    🌱 Add Your First Field
                                </motion.button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="grid"
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {fields.map((field) => (
                                <motion.div
                                    key={field.id}
                                    variants={cardVariants}
                                    whileHover={{ y: -6, scale: 1.02 }}
                                    onClick={() => navigate(`/field/${field.id}`, { state: { field } })}
                                    className="agri-card cursor-pointer group overflow-hidden"
                                    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
                                >
                                    {/* Crop image header */}
                                    <div className="h-36 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                            style={{ backgroundImage: `url('${getCropImage(field.crop_type)}')` }} />
                                        <div className="absolute inset-0"
                                            style={{ background: 'linear-gradient(180deg, rgba(7,26,10,0.1) 0%, rgba(7,26,10,0.85) 100%)' }} />
                                        {/* Delete button */}
                                        <button
                                            onClick={(e) => handleDeleteField(e, field.id)}
                                            className="absolute top-3 right-3 p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                            style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.25)' }}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>

                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-lg font-extrabold text-green-950 mb-0.5">{field.name}</h3>
                                                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-green-100 text-green-800 border-green-200 border">
                                                    {field.crop_type && field.crop_type !== 'None' ? field.crop_type : 'No crop planted'}
                                                </span>
                                            </div>
                                            <ChevronRight className="w-5 h-5 mt-1 transition-transform duration-300 group-hover:translate-x-1 text-green-400" />
                                        </div>

                                        <div className="space-y-2 pt-3 border-t border-green-100">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-green-700">
                                                <MapPin className="w-3.5 h-3.5 text-green-500" />
                                                {field.location || 'Unknown Location'}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-semibold text-green-700">
                                                <Ruler className="w-3.5 h-3.5 text-green-500" />
                                                {field.size} acres
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Add Field Wizard */}
            <AnimatePresence>
                {isWizardOpen && (
                    <AddFieldWizard onClose={() => setIsWizardOpen(false)} onComplete={handleAddField} />
                )}
            </AnimatePresence>
        </div>
    );
};
