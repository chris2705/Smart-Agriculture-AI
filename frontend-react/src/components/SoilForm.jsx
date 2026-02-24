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
            <div className="relative rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                    background: isFocused
                        ? 'rgba(52,168,83,0.12)'
                        : hasSensorValue
                            ? 'rgba(96,165,250,0.06)'
                            : 'rgba(255,255,255,0.05)',
                    border: isFocused
                        ? '1px solid rgba(82,183,136,0.5)'
                        : hasSensorValue
                            ? '1px solid rgba(96,165,250,0.2)'
                            : '1px solid rgba(255,255,255,0.09)',
                    boxShadow: isFocused ? '0 0 20px rgba(52,168,83,0.15)' : 'none'
                }}
            >
                {/* Icon sidebar */}
                <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center"
                    style={{
                        background: isFocused ? 'rgba(52,168,83,0.15)' : 'rgba(255,255,255,0.04)',
                        borderRight: '1px solid rgba(255,255,255,0.06)'
                    }}>
                    <Icon className="w-4 h-4 transition-colors duration-300"
                        style={{ color: isFocused ? '#52b788' : 'rgba(200,240,210,0.35)' }} />
                </div>

                <div className="pl-14 pr-4 py-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-0.5 transition-colors duration-300"
                        style={{ color: isFocused ? '#95d5b2' : 'rgba(200,240,210,0.45)' }}>
                        {label} {unit && <span className="normal-case font-normal opacity-70">({unit})</span>}
                        {hasSensorValue && (
                            <span className="ml-2 inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full normal-case font-bold"
                                style={{ background: 'rgba(96,165,250,0.15)', color: '#93c5fd', border: '1px solid rgba(96,165,250,0.3)' }}>
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
                        className="w-full bg-transparent border-none p-0 font-semibold focus:ring-0 text-base outline-none"
                        style={{ color: 'rgba(220,255,230,0.9)' }}
                        placeholder="0"
                    />
                </div>
            </div>
        </motion.div>
    );
};

export const SoilForm = ({ onSubmit, isLoading, sensorData }) => {
    const { register, handleSubmit, setValue, getValues } = useForm();
    const [sensorLoaded, setSensorLoaded] = useState(false);

    // Function to load sensor data into form fields
    const loadSensorData = (data) => {
        if (!data) return;
        const fieldMap = ['nitrogen', 'phosphorus', 'potassium', 'pH', 'moisture', 'temperature'];
        fieldMap.forEach((field) => {
            if (data[field] != null) {
                setValue(field, data[field], { shouldValidate: true });
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
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                    style={{
                        background: 'rgba(96,165,250,0.1)',
                        border: '1px solid rgba(96,165,250,0.25)',
                        color: '#93c5fd'
                    }}
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

            <div className="flex justify-center pt-4">
                <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(52,168,83,0.55)' }}
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    disabled={isLoading}
                    className="relative group inline-flex items-center gap-3 px-10 py-4 rounded-full text-white font-bold text-lg overflow-hidden transition-all"
                    style={{
                        background: isLoading
                            ? 'rgba(45,106,79,0.6)'
                            : 'linear-gradient(135deg, #1b4332, #2d6a4f, #52b788)',
                        boxShadow: '0 4px 24px rgba(45,106,79,0.4)',
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
