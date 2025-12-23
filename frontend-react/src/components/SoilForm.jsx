import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Leaf, FlaskConical, Zap, Droplets, Thermometer, Activity, Sprout } from 'lucide-react';
import { cn } from '../lib/utils';

const InputField = ({ label, name, register, icon: Icon, min, max, step, defaultValue }) => (
    <motion.div
        className="relative group"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
        <label className="block text-sm font-medium text-zinc-600 mb-1.5 ml-1">{label}</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-nature-600 transition-colors">
                <Icon className="h-5 w-5" />
            </div>
            <input
                type="number"
                step={step}
                defaultValue={defaultValue}
                {...register(name, { required: true, valueAsNumber: true, min, max })}
                className={cn(
                    "block w-full pl-10 pr-3 py-2.5",
                    "bg-white border border-zinc-200 rounded-xl",
                    "text-zinc-900 placeholder:text-zinc-400",
                    "focus:ring-2 focus:ring-nature-500/20 focus:border-nature-500",
                    "transition-all duration-200 ease-in-out",
                    "hover:border-nature-300"
                )}
            />
        </div>
    </motion.div>
);

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

            <div className="flex justify-center pt-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                        "flex items-center gap-2 px-8 py-3 rounded-full text-white font-semibold shadow-lg shadow-nature-500/30",
                        "bg-gradient-to-r from-nature-500 to-nature-600 hover:from-nature-400 hover:to-nature-500",
                        "transition-all duration-300",
                        isLoading ? "opacity-70 cursor-wait" : ""
                    )}
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Sprout className="w-5 h-5" />
                    )}
                    <span>{isLoading ? 'Analyzing Soil...' : 'Get Recommendation'}</span>
                </motion.button>
            </div>
        </form>
    );
};
