import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Leaf, FlaskConical, Zap, Droplets, Thermometer, Activity, Sprout, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

const InputField = ({ label, name, register, icon: Icon, min, max, step, defaultValue }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <motion.div
            className="relative group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className={cn(
                "relative transition-all duration-300 rounded-2xl p-1",
                isFocused ? "bg-gradient-to-r from-nature-400 to-emerald-400 shadow-lg shadow-nature-500/20" : "bg-transparent"
            )}>
                <div className="relative bg-white/60 backdrop-blur-xl rounded-xl overflow-hidden border border-white/60 shadow-sm transition-all duration-300 group-hover:bg-white/80">
                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center bg-zinc-50/50 border-r border-zinc-100">
                        <Icon className={cn(
                            "h-5 w-5 transition-colors duration-300",
                            isFocused ? "text-nature-600" : "text-zinc-400"
                        )} />
                    </div>

                    <div className="pl-14 pr-4 py-3">
                        <label className={cn(
                            "block text-xs font-semibold uppercase tracking-wider mb-0.5 transition-colors",
                            isFocused ? "text-nature-700" : "text-zinc-500"
                        )}>
                            {label}
                        </label>
                        <input
                            type="number"
                            step={step}
                            defaultValue={defaultValue}
                            {...register(name, { required: true, valueAsNumber: true, min, max })}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className="w-full bg-transparent border-none p-0 text-zinc-900 font-medium focus:ring-0 placeholder:text-zinc-300 text-lg"
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export const SoilForm = ({ onSubmit, isLoading }) => {
    const { register, handleSubmit } = useForm();

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    label="Nitrogen (N)"
                    name="nitrogen"
                    register={register}
                    icon={Leaf}
                    defaultValue={12}
                    min={0}
                />
                <InputField
                    label="Phosphorus (P)"
                    name="phosphorus"
                    register={register}
                    icon={FlaskConical}
                    defaultValue={8}
                    min={0}
                />
                <InputField
                    label="Potassium (K)"
                    name="potassium"
                    register={register}
                    icon={Zap}
                    defaultValue={6}
                    min={0}
                />
                <InputField
                    label="pH Level"
                    name="pH"
                    register={register}
                    icon={Activity}
                    defaultValue={6.0}
                    min={0} max={14} step={0.1}
                />
                <InputField
                    label="Moisture (%)"
                    name="moisture"
                    register={register}
                    icon={Droplets}
                    defaultValue={3}
                    min={0}
                />
                <InputField
                    label="Temperature (°C)"
                    name="temperature"
                    register={register}
                    icon={Thermometer}
                    defaultValue={4}
                    min={0}
                />
            </div>

            <div className="flex justify-center pt-6">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                        "group relative inline-flex items-center gap-3 px-10 py-4 rounded-full text-white font-bold shadow-xl shadow-nature-600/30 overflow-hidden",
                        "bg-gradient-to-r from-nature-600 via-nature-500 to-emerald-600",
                        "transition-all duration-300",
                        isLoading ? "opacity-90 cursor-wait" : "hover:shadow-2xl hover:shadow-nature-600/50"
                    )}
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />

                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="relative z-10">Analyzing Soil DNA...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5 relative z-10 animate-pulse-slow" />
                            <span className="relative z-10 text-lg">Generate Analysis</span>
                        </>
                    )}
                </motion.button>
            </div>
        </form>
    );
};
