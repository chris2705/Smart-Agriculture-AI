import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sprout, MapPin, Ruler, Droplets, ChevronRight } from 'lucide-react';
import { PlantBackground } from '../components/PlantBackground';
import { AddFieldWizard } from '../components/AddFieldWizard';

export const Dashboard = () => {
    const [fields, setFields] = useState([]);
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    const handleAddField = (newField) => {
        setFields([...fields, { ...newField, id: Date.now() }]);
        setIsWizardOpen(false);
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-zinc-50">
            <PlantBackground opacity={0.2} />

            <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
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
                                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-nature-100 p-2 rounded-lg">
                                        <Sprout className="w-6 h-6 text-nature-600" />
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-nature-500 transition-colors" />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 mb-1">{field.name}</h3>
                                <p className="text-sm text-zinc-500 mb-4">{field.cropType ? field.cropType : 'No crop planted'}</p>

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
