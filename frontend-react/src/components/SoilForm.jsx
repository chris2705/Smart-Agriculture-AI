import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Leaf, FlaskConical, Zap, Droplets, Thermometer, Activity, Sparkles, Radio } from 'lucide-react';

const InputField = ({ label, name, register, icon: Icon, min, max, step, defaultValue, unit, sensorValue }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasSensorValue = sensorValue != null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative group"
        >
            <div className="relative rounded-2xl overflow-hidden transition-all duration-300 bg-white shadow-sm"
                style={{
                    background: isFocused
                        ? 'rgba(240,253,244,1)'
                        : hasSensorValue
                            ? 'rgba(239,246,255,1)'
                            : 'rgba(255,255,255,0.8)',
                    border: isFocused
                        ? '1px solid rgba(74,222,128,0.5)'
                        : hasSensorValue
                            ? '1px solid rgba(96,165,250,0.5)'
                            : '1px solid rgba(134,239,172,0.3)',
                    boxShadow: isFocused ? '0 4px 20px rgba(34,197,94,0.15)' : 'none'
                }}
            >
                {/* Icon sidebar */}
                <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center bg-green-50/50 border-r border-green-100"
                    style={{
                        background: isFocused ? 'rgba(220,252,231,0.5)' : 'rgba(240,253,244,0.5)'
                    }}>
                    <Icon className="w-4 h-4 transition-colors duration-300"
                        style={{ color: isFocused ? '#16a34a' : '#22c55e' }} />
                </div>

                <div className="pl-14 pr-4 py-3">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-0.5 transition-colors duration-300"
                        style={{ color: isFocused ? '#166534' : '#15803d' }}>
                        {label} {unit && <span className="normal-case font-semibold text-green-700">({unit})</span>}
                        {hasSensorValue && (
                            <span className="ml-2 inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full normal-case font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
                                <Radio className="w-2.5 h-2.5" /> SENSOR
                            </span>
                        )}
                    </label>
                    <input
                        type="number"
                        step={step || 'any'}
                        defaultValue={defaultValue}
                        {...register(name, { required: true, valueAsNumber: true, min, max })}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="w-full bg-transparent border-none p-0 font-extrabold focus:ring-0 text-base outline-none text-green-950 placeholder-green-700/30"
                        placeholder="0"
                    />
                </div>
            </div>
        </motion.div>
    );
};

export const SoilForm = ({ onSubmit, isLoading, sensorData, fieldData }) => {
    const { register, handleSubmit, setValue, getValues } = useForm();
    const [sensorLoaded, setSensorLoaded] = useState(false);
    const [fertCrops, setFertCrops] = useState([]);
    const [soilTypes, setSoilTypes] = useState([]);

    useEffect(() => {
        // Fetch fertilizer-supported crops and soil types for dropdowns
        const BACKEND_URL = `http://${window.location.hostname}:8000`;
        fetch(`${BACKEND_URL}/supported-fert-crops`)
            .then(r => r.json())
            .then(d => setFertCrops(d.crops || []))
            .catch(() => setFertCrops([]));
        fetch(`${BACKEND_URL}/supported-soil-types`)
            .then(r => r.json())
            .then(d => setSoilTypes(d.soil_types || []))
            .catch(() => setSoilTypes([]));
    }, []);

    // Function to load sensor data into form fields
    const loadSensorData = (data) => {
        if (!data) return;
        const fieldMap = ['nitrogen', 'phosphorus', 'potassium', 'pH', 'moisture', 'temperature'];
        fieldMap.forEach((field) => {
            if (data[field] != null) {
                const rounded = parseFloat(Number(data[field]).toFixed(1));
                setValue(field, rounded, { shouldValidate: true });
            }
        });
        setSensorLoaded(true);
        // Auto-reset the indicator after 3 seconds
        setTimeout(() => setSensorLoaded(false), 3000);
    };

    // Expose loadSensorData so parent components can call it
    // (the SensorPanel "Load into Form" button does this)
    useEffect(() => {
        if (sensorData && sensorData._autoLoad) {
            loadSensorData(sensorData);
        }
    }, [sensorData]);

    const fields = [
        { label: 'Nitrogen', name: 'nitrogen', icon: Leaf, defaultValue: 12, min: 0, unit: 'mg/kg' },
        { label: 'Phosphorus', name: 'phosphorus', icon: FlaskConical, defaultValue: 8, min: 0, unit: 'mg/kg' },
        { label: 'Potassium', name: 'potassium', icon: Zap, defaultValue: 6, min: 0, unit: 'mg/kg' },
        { label: 'pH Level', name: 'pH', icon: Activity, defaultValue: 6.0, min: 0, max: 14, step: 0.1 },
        { label: 'Moisture', name: 'moisture', icon: Droplets, defaultValue: 3, min: 0, unit: '%' },
        { label: 'Temperature', name: 'temperature', icon: Thermometer, defaultValue: 4, min: 0, unit: '°C' },
    ];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Sensor loaded notification */}
            {sensorLoaded && (
                <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-50 border border-blue-200 text-blue-800"
                >
                    <Radio className="w-4 h-4" />
                    ✅ Sensor values loaded! You can edit them before submitting.
                </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {fields.map((f, i) => (
                    <motion.div key={f.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}>
                        <InputField
                            {...f}
                            register={register}
                            sensorValue={sensorData?.[f.name]}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Soil type selector (used for fertilizer recommendation when a crop is planted but soil type is unknown) */}
            {fieldData && fieldData.crop_type && fieldData.crop_type !== "None" && !fieldData.soil_type && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 md:col-span-1">
                        <label className="block text-sm font-semibold text-zinc-700 mb-2">Soil Type</label>
                        <select {...register('soil_type')} className="w-full px-4 py-3 rounded-xl border border-zinc-200 outline-none bg-white text-zinc-900">
                            <option value="">Select soil type (required for fertilizer)</option>
                            {soilTypes.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            )}

            <div className="flex justify-center pt-4">
                <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 8px 30px rgba(34,197,94,0.3)' }}
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    disabled={isLoading}
                    className="relative group inline-flex items-center gap-3 px-10 py-4 rounded-full text-white font-extrabold text-lg overflow-hidden transition-all shadow-lg"
                    style={{
                        background: isLoading
                            ? 'rgba(34,197,94,0.6)'
                            : 'linear-gradient(135deg, #22c55e, #16a34a)',
                        cursor: isLoading ? 'wait' : 'pointer'
                    }}
                >
                    {/* Shimmer overlay on hover */}
                    <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }} />

                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="relative z-10">Analyzing Soil...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5 relative z-10" />
                            <span className="relative z-10">🌱 Generate Analysis</span>
                        </>
                    )}
                </motion.button>
            </div>
        </form>
    );
};
