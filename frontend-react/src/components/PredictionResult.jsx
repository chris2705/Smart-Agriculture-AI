import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, TestTube, CheckCircle2, TrendingUp, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

const ResultCard = ({ title, value, icon: Icon, colorClass, delay, gradient }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className={cn(
            "relative overflow-hidden group rounded-3xl p-6 shadow-xl border border-white/50",
            "bg-white/80 backdrop-blur-xl"
        )}
    >
        <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${gradient} transition-opacity duration-500 group-hover:opacity-20`} />

        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-start justify-between mb-4">
                <div className={cn("p-3 rounded-2xl", colorClass, "bg-opacity-10")}>
                    <Icon className={cn("w-6 h-6", colorClass.replace('bg-', 'text-'))} />
                </div>
                <div className="h-8 w-8 rounded-full bg-zinc-100/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <TrendingUp className="w-4 h-4 text-zinc-400" />
                </div>
            </div>

            <div>
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">{title}</h3>
                <div className="text-3xl font-display font-bold text-zinc-900 leading-tight">
                    {value}
                </div>
            </div>
        </div>
    </motion.div>
);

export const PredictionResult = ({ result }) => {
    if (!result) return null;

    const sortedProbs = Object.entries(result.explanation?.crop_probabilities || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); // Top 5

    return (
        <div className="space-y-8 mt-16">
            <div className="flex items-center gap-2 mb-6">
                <div className="h-1 w-12 bg-nature-500 rounded-full" />
                <h2 className="text-2xl font-bold text-zinc-800">Analysis Results</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResultCard
                    title="Optimal Crop"
                    value={result.prediction}
                    icon={Sprout}
                    colorClass="bg-nature-600 text-nature-600"
                    gradient="from-nature-400 to-emerald-400"
                    delay={0.1}
                />
                <ResultCard
                    title="Recommended Fertilizer"
                    value={result.explanation?.fertilizer_recommendation}
                    icon={TestTube}
                    colorClass="bg-blue-600 text-blue-600"
                    gradient="from-blue-400 to-indigo-400"
                    delay={0.2}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-panel rounded-[2rem] p-8 md:p-10 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-nature-100/50 rounded-full blur-3xl -z-10 -mr-16 -mt-16" />

                <h3 className="text-xl font-bold text-zinc-800 mb-8 flex items-center gap-3">
                    <Activity className="w-6 h-6 text-nature-600" />
                    Crop Probability Analysis
                </h3>

                <div className="space-y-6">
                    {sortedProbs.map(([crop, prob], idx) => (
                        <div key={crop} className="relative group">
                            <div className="flex justify-between items-end mb-2">
                                <span className="font-semibold text-zinc-700 capitalize text-lg">{crop}</span>
                                <span className="font-mono text-sm font-medium text-zinc-500">{(prob * 100).toFixed(1)}%</span>
                            </div>
                            <div className="h-4 w-full bg-zinc-100 rounded-full overflow-hidden shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${prob * 100}%` }}
                                    transition={{ duration: 1.5, delay: 0.5 + (idx * 0.1), ease: "easeOut" }}
                                    className={cn(
                                        "h-full rounded-full relative overflow-hidden",
                                        idx === 0 ? "bg-gradient-to-r from-nature-500 to-emerald-500" : "bg-zinc-300"
                                    )}
                                >
                                    {idx === 0 && (
                                        <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {result.explanation && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-8 border border-blue-100/50 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400" />
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 p-3 bg-blue-100 rounded-full h-fit">
                            <CheckCircle2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900 text-lg mb-2">AI Recommendation Engine</h4>
                            <p className="text-blue-800/80 leading-relaxed text-lg">
                                Based on your soil's unique profile, <span className="font-bold text-blue-900 underline decoration-blue-300 decoration-2 underline-offset-2">{result.prediction}</span> has been identified as the optimal crop choice.
                                Our model analyzed the nutrient balance (N: {result.explanation.input_data?.nitrogen}, P: {result.explanation.input_data?.phosphorus}, K: {result.explanation.input_data?.potassium})
                                to ensure maximum yield potential.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* XAI Section */}
            {(result.shap_summary_url || result.lime_examples) && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-12 bg-purple-500 rounded-full" />
                        <h2 className="text-2xl font-bold text-zinc-800">Model Insights (XAI)</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* SHAP Plot */}
                        {result.shap_summary_url && (
                            <div className="bg-white rounded-3xl p-6 shadow-xl border border-zinc-100">
                                <h3 className="text-lg font-bold text-zinc-700 mb-4 flex items-center gap-2">
                                    Global Feature Importance (SHAP)
                                    <span className="text-xs font-normal text-zinc-400 px-2 py-1 bg-zinc-100 rounded-full">Global</span>
                                </h3>
                                <div className="aspect-[4/3] bg-zinc-50 rounded-xl overflow-hidden relative">
                                    <img
                                        src={`http://${window.location.hostname}:8000${result.shap_summary_url}`}
                                        alt="SHAP Summary"
                                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <p className="text-zinc-500 text-sm mt-4">
                                    Shows which features (Nitrogen, pH, etc.) generally have the biggest impact on the model's decisions.
                                </p>
                            </div>
                        )}

                        {/* LIME Examples */}
                        {result.lime_examples && (
                            <div className="bg-white rounded-3xl p-6 shadow-xl border border-zinc-100">
                                <h3 className="text-lg font-bold text-zinc-700 mb-4 flex items-center gap-2">
                                    Decision Logic Samples (LIME)
                                    <span className="text-xs font-normal text-zinc-400 px-2 py-1 bg-zinc-100 rounded-full">Local</span>
                                </h3>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {result.lime_examples.slice(0, 3).map((example, idx) => (
                                        <div key={idx} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Logic Path #{idx + 1}</div>
                                            <div className="space-y-2">
                                                {example.explanation.slice(0, 3).map(([condition, weight], i) => (
                                                    <div key={i} className="flex items-center justify-between text-sm">
                                                        <code className="bg-white px-2 py-1 rounded border border-zinc-200 text-zinc-600 font-mono text-xs truncate max-w-[70%]">
                                                            {condition}
                                                        </code>
                                                        <span className={cn(
                                                            "font-medium",
                                                            weight > 0 ? "text-emerald-600" : "text-red-500"
                                                        )}>
                                                            {weight > 0 ? "+" : ""}{weight.toFixed(3)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-zinc-500 text-sm mt-4">
                                    Sample decision paths showing how specific conditions (normalized values) influence the prediction score.
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
};
