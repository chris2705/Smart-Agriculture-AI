import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Sprout, MapPin, Ruler, ChevronRight, LogOut, Trash2, User as UserIcon } from 'lucide-react';
import { PlantBackground } from '../components/PlantBackground';
import { AddFieldWizard } from '../components/AddFieldWizard';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [fields, setFields] = useState([]);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const BACKEND_URL = `http://${window.location.hostname}:8000`;

    React.useEffect(() => {
        const fetchFields = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${BACKEND_URL}/fields/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFields(res.data);
            } catch (err) {
                console.error("Failed to fetch fields", err);

                // Check if it's an authentication error
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };
        fetchFields();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleAddField = (newField) => {
        setFields([...fields, newField]);
        setIsWizardOpen(false);
    };

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
        <div className="min-h-screen relative overflow-hidden bg-zinc-50">
            <PlantBackground opacity={0.2} />

            {/* Profile & Logout - Top Left */}
            {user && (
                <div className="absolute top-6 left-6 z-50 flex items-center gap-3 bg-white/80 backdrop-blur-md p-2 pr-4 rounded-full shadow-sm border border-zinc-200/50 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-nature-100 rounded-full flex items-center justify-center text-nature-700 font-bold">
                        {user.full_name?.[0]?.toUpperCase() || <UserIcon className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-zinc-800 leading-tight">{user.full_name}</span>
                        <button
                            onClick={handleLogout}
                            className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 mt-0.5"
                        >
                            <LogOut className="w-3 h-3" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10 pt-24">
                {/* Header */}
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 mb-2">My Fields</h1>
                        <p className="text-zinc-500">Manage your crops and soil health</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsWizardOpen(true)}
                        className="bg-nature-600 hover:bg-nature-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-nature-600/30 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Field
                    </motion.button>
                </div>

                {/* Fields Grid */}
                {fields.length === 0 ? (
                    <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-zinc-200/50 p-12 text-center">
                        <div className="w-20 h-20 bg-nature-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sprout className="w-10 h-10 text-nature-600" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 mb-2">No fields added yet</h3>
                        <p className="text-zinc-500 max-w-md mx-auto mb-8">
                            Start by adding your first field to get personalized crop recommendations and soil analysis.
                        </p>
                        <button
                            onClick={() => setIsWizardOpen(true)}
                            className="text-nature-600 font-semibold hover:text-nature-700 hover:underline"
                        >
                            Add your first field &rarr;
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {fields.map((field) => (
                            <motion.div
                                key={field.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => navigate(`/field/${field.id}`, { state: { field } })}
                                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-nature-100 p-2 rounded-lg">
                                        <Sprout className="w-6 h-6 text-nature-600" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => handleDeleteField(e, field.id)}
                                            className="p-1 hover:bg-red-50 rounded text-zinc-300 hover:text-red-500 transition-colors"
                                            title="Delete Field"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-nature-500 transition-colors" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 mb-1">{field.name}</h3>
                                <p className="text-sm text-zinc-500 mb-4">{field.crop_type && field.crop_type !== "None" ? field.crop_type : 'No crop planted'}</p>

                                <div className="space-y-2">
                                    <div className="flex items-center text-xs text-zinc-600 gap-2">
                                        <MapPin className="w-4 h-4 text-zinc-400" />
                                        {field.location || 'Unknown Location'}
                                    </div>
                                    <div className="flex items-center text-xs text-zinc-600 gap-2">
                                        <Ruler className="w-4 h-4 text-zinc-400" />
                                        {field.size} acres
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Field Wizard Modal */}
            <AnimatePresence>
                {isWizardOpen && (
                    <AddFieldWizard onClose={() => setIsWizardOpen(false)} onComplete={handleAddField} />
                )}
            </AnimatePresence>
        </div>
    );
};
