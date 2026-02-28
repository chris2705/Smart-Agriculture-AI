import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sprout, MapPin, Ruler, Check, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { cn } from '../lib/utils';
import axios from 'axios';
import BACKEND_URL from '../api/client';

const steps = [
    { id: 'activity', title: 'Start' },
    { id: 'details', title: 'Details' }
];

export const AddFieldWizard = ({ onClose, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Reset wizard state when component mounts
    useEffect(() => {
        setCurrentStep(0);
        setFormData({});
        setIsSaving(false);
    }, []);

    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => setCurrentStep(prev => prev - 1);

    const handleActivitySelect = (hasCrop) => {
        setFormData({ ...formData, hasCrop });
        nextStep();
    };

    const handleDetailsSubmit = async (data) => {
        setIsSaving(true);
        console.log("Starting field save...", data);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("No authentication token found. Please log in again.");
                setIsSaving(false);
                return;
            }

            const newField = {
                name: data.name,
                location: data.location,
                size: parseFloat(data.size),
                crop_type: formData.hasCrop ? data.selectedCrop : "None",
                soil_type: formData.hasCrop ? data.selectedSoilType : null
            };

            console.log("Sending field data:", newField);

            const res = await axios.post(`${BACKEND_URL}/fields/`, newField, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("Field saved successfully:", res.data);

            onComplete(res.data);
            onClose();
        } catch (error) {
            console.error("Failed to save field", error);

            // Check if it's an authentication error
            if (error.response?.status === 401) {
                alert("Your session has expired. Please log in again.");
                localStorage.removeItem('token');
                window.location.href = '/login';
                return;
            }

            alert(`Failed to save field: ${error.response?.data?.detail || error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Sub-components for steps ---

    const ActivityStep = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <button
                onClick={() => handleActivitySelect(true)}
                className="p-8 rounded-2xl border-2 border-zinc-100 hover:border-nature-500 hover:bg-nature-50 transition-all group text-left"
            >
                <div className="bg-nature-100 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Sprout className="w-7 h-7 text-nature-600" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Crop Currently Planted</h3>
                <p className="text-zinc-500">I want to analyze my current crop's health and get fertilizer tips.</p>
            </button>

            <button
                onClick={() => handleActivitySelect(false)}
                className="p-8 rounded-2xl border-2 border-zinc-100 hover:border-nature-500 hover:bg-nature-50 transition-all group text-left"
            >
                <div className="bg-emerald-100 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MapPin className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">No Crop Planted</h3>
                <p className="text-zinc-500">I want recommendations for the best crop to plant in this field.</p>
            </button>
        </div>
    );

    const DetailsStep = () => {
        const { register, handleSubmit } = useForm({ defaultValues: formData });
        const [supportedCrops, setSupportedCrops] = useState([]);
        const [supportedSoilTypes, setSupportedSoilTypes] = useState([]);
        const [loadingCrops, setLoadingCrops] = useState(false);

        React.useEffect(() => {
            if (formData.hasCrop) {
                setLoadingCrops(true);
                Promise.all([
                    fetch(`${BACKEND_URL}/supported-fert-crops`).then(res => res.json()),
                    fetch(`${BACKEND_URL}/supported-soil-types`).then(res => res.json())
                ])
                    .then(([fertData, soilData]) => {
                        setSupportedCrops(fertData.crops || []);
                        setSupportedSoilTypes(soilData.soil_types || []);
                    })
                    .catch(e => console.error("Failed to fetch crops/soil data", e))
                    .finally(() => setLoadingCrops(false));
            }
        }, [formData.hasCrop]);

        return (
            <form onSubmit={handleSubmit(handleDetailsSubmit)} className="space-y-6 mt-6">
                <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-2">Field Name</label>
                    <input {...register("name", { required: true })} className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-nature-500 focus:border-transparent outline-none text-zinc-900 bg-white placeholder-zinc-400" placeholder="e.g. North Acre" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-2">Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-zinc-400" />
                        <input {...register("location", { required: true })} className="w-full pl-10 px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-nature-500 focus:border-transparent outline-none text-zinc-900 bg-white placeholder-zinc-400" placeholder="GPS or Address" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-2">Size (Acres)</label>
                    <div className="relative">
                        <Ruler className="absolute left-3 top-3.5 w-5 h-5 text-zinc-400" />
                        <input type="number" step="0.1" {...register("size", { required: true })} className="w-full pl-10 px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-nature-500 focus:border-transparent outline-none text-zinc-900 bg-white placeholder-zinc-400" placeholder="0.0" />
                    </div>
                </div>

                {formData.hasCrop && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-2">Select Current Crop</label>
                            <select {...register("selectedCrop", { required: true })} className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-nature-500 outline-none bg-white text-zinc-900">
                                <option value="">Select a crop...</option>
                                {loadingCrops ? <option disabled>Loading...</option> : supportedCrops.map(crop => (
                                    <option key={crop} value={crop}>{crop}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-2">Select Soil Type</label>
                            <select {...register("selectedSoilType", { required: true })} className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-nature-500 outline-none bg-white text-zinc-900">
                                <option value="">Select a soil type...</option>
                                {loadingCrops ? <option disabled>Loading...</option> : supportedSoilTypes.map(soil => (
                                    <option key={soil} value={soil}>{soil}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {isSaving ? 'Saving...' : 'Save Field'}
                    </button>
                </div>
            </form>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900">Add New Field</h2>
                        <div className="flex gap-2 mt-2">
                            {steps.map((step, idx) => (
                                <div key={step.id} className={cn(
                                    "h-1.5 rounded-full transition-all duration-300",
                                    idx <= currentStep ? "w-8 bg-nature-500" : "w-2 bg-zinc-200"
                                )} />
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-zinc-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 flex-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {currentStep === 0 && <ActivityStep />}
                            {currentStep === 1 && <DetailsStep />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
