import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { Sprout, TestTube, CheckCircle2, TrendingUp, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

const getFertilizerDetails = (category) => {
    if (!category) return { categoryName: category, fertilizers: [] };
    switch (category) {
        case "Nitrogen_Rich":
        case "Nitrogen Rich":
            return { categoryName: "Nitrogen Rich", fertilizers: ["Urea"] };
        case "Phosphorus_Rich":
        case "Phosphorus Rich":
            return { categoryName: "Phosphorus Rich", fertilizers: ["DAP", "10-26-26", "14-35-14"] };
        case "Balanced_NPK":
        case "Balanced NPK":
            return { categoryName: "Balanced NPK", fertilizers: ["20-20", "28-28", "17-17-17"] };
        default:
            return { categoryName: category, fertilizers: [] };
    }
};

const getFertilizerDisplay = (category) => {
    const details = getFertilizerDetails(category);
    if (details.fertilizers.length > 0) {
        return `${details.categoryName} – Recommended: ${details.fertilizers.join(", ")}`;
    }
    return details.categoryName;
};

const ResultCard = ({ title, value, categoryName, fertilizers, icon: Icon, colorClass, delay, gradient }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className={cn(
            "relative overflow-hidden group rounded-3xl p-6 shadow-md border border-green-100",
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
                <h3 className="text-sm font-extrabold text-green-800 uppercase tracking-wider mb-1">{title}</h3>
                <div className="text-3xl font-display font-black text-green-950 leading-tight">
                    {categoryName || value}
                </div>
                {fertilizers && fertilizers.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-green-100">
                        <div className="text-sm font-bold text-green-800 uppercase tracking-wider mb-2">Recommended Options</div>
                        <div className="flex flex-wrap gap-2">
                            {fertilizers.map((fert, idx) => (
                                <span
                                    key={idx}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-md font-bold border shadow-sm transition-transform hover:scale-105",
                                        "bg-blue-50 text-blue-800 border-blue-200"
                                    )}
                                >
                                    {fert}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </motion.div>
);

export const PredictionResult = ({ result }) => {
    if (!result) return null;

    const sortedProbs = Object.entries(result.explanation?.crop_probabilities || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); // Top 5

    const fertDetailsOnly = getFertilizerDetails(result.explanation?.fertilizer_recommendation || result.prediction);
    const fertDetailsCombined = getFertilizerDetails(result.explanation?.fertilizer_recommendation);

    if (result.is_fertilizer_only) {
        return (
            <div className="space-y-10 mt-16">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center gap-4 mb-8"
                >
                    <div className="h-1.5 w-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-md" />
                    <h2 className="text-3xl font-display font-black text-green-900 tracking-tight">Analysis Results</h2>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ResultCard
                        title="Fertilizer Category"
                        value={result.prediction}
                        categoryName={fertDetailsOnly.categoryName}
                        fertilizers={fertDetailsOnly.fertilizers}
                        icon={TestTube}
                        colorClass="bg-blue-600 text-blue-600"
                        gradient="from-blue-400 to-indigo-400"
                        delay={0.1}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-8 border border-blue-100/50 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400" />
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 p-3 bg-blue-100 rounded-full h-fit">
                            <CheckCircle2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="w-full">
                            <h4 className="font-bold text-blue-900 text-lg mb-2">
                                Fertilizer Insights
                            </h4>
                            <div className="text-blue-900/90 leading-relaxed text-xl space-y-4">
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                >
                                    For your planted crop of <span className="font-extrabold text-blue-950 capitalize bg-white/50 px-2 py-0.5 rounded-md">{result.explanation?.input_data?.crop_type || 'your crop'}</span> growing in <span className="font-extrabold text-blue-950 capitalize bg-white/50 px-2 py-0.5 rounded-md">{result.explanation?.input_data?.soil_type || 'your soil'}</span>, we recommend applying <span className="font-extrabold text-blue-950 underline decoration-blue-500 decoration-4 underline-offset-4">{getFertilizerDisplay(result.prediction)}</span>.
                                </motion.p>
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.6 }}
                                    className="text-lg opacity-80"
                                >
                                    This recommendation is precision-tailored to your current soil nutrient metrics (N: {result.explanation?.input_data?.n ?? '—'}, P: {result.explanation?.input_data?.p ?? '—'}, K: {result.explanation?.input_data?.k ?? '—'}) and environmental conditions (Moisture: {result.explanation?.input_data?.moisture ?? '—'}%, Temp: {result.explanation?.input_data?.temperature ?? '—'}°C) to ensure optimal uptake and maximum yield potential.
                                </motion.p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="space-y-10 mt-16">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-4 mb-8"
            >
                <div className="h-1.5 w-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-md" />
                <h2 className="text-3xl font-display font-black text-green-900 tracking-tight">Analysis Results</h2>
            </motion.div>

            <div className={`grid grid-cols-1 ${result.explanation?.fertilizer_recommendation ? 'md:grid-cols-2' : ''} gap-8`}>
                {!result.existing_crop_analysis && (
                    <ResultCard
                        title="Optimal Crop"
                        value={result.prediction}
                        icon={Sprout}
                        colorClass="bg-green-600 text-green-600"
                        gradient="from-green-400 to-emerald-400"
                        delay={0.1}
                    />
                )}
                {result.explanation?.fertilizer_recommendation && (
                    <ResultCard
                        title="Fertilizer Category"
                        value={result.explanation?.fertilizer_recommendation}
                        categoryName={fertDetailsCombined.categoryName}
                        fertilizers={fertDetailsCombined.fertilizers}
                        icon={TestTube}
                        colorClass="bg-blue-600 text-blue-600"
                        gradient="from-blue-400 to-indigo-400"
                        delay={0.2}
                    />
                )}
            </div>

            {!result.existing_crop_analysis ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/80 backdrop-blur-md rounded-[2rem] p-8 md:p-10 relative overflow-hidden border border-green-200 shadow-md"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-100/50 rounded-full blur-3xl -z-10 -mr-16 -mt-16" />

                    <h3 className="text-xl font-extrabold text-green-900 mb-8 flex items-center gap-3">
                        <Activity className="w-6 h-6 text-green-600" />
                        Crop Probability Analysis
                    </h3>

                    <div className="space-y-6">
                        {sortedProbs.map(([crop, prob], idx) => (
                            <div key={crop} className="relative group">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="font-bold text-green-800 capitalize text-lg">{crop}</span>
                                    <span className="font-mono text-sm font-bold text-green-600">{(prob * 100).toFixed(1)}%</span>
                                </div>
                                <div className="h-4 w-full bg-green-50 rounded-full overflow-hidden shadow-inner border border-green-100">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${prob * 100}%` }}
                                        transition={{ duration: 1.5, delay: 0.5 + (idx * 0.1), ease: "easeOut" }}
                                        className={cn(
                                            "h-full rounded-full relative overflow-hidden",
                                            idx === 0 ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-green-300"
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
            ) : null}

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
                    <div className="w-full">
                        <h4 className="font-bold text-blue-900 text-lg mb-2">
                            {result.existing_crop_analysis ? 'Crop Health Analysis' : 'AI Recommendation Engine'}
                        </h4>

                        {result.existing_crop_analysis ? (
                            <div className="text-blue-900/90 leading-relaxed text-xl prose prose-blue prose-lg max-w-none">
                                <ReactMarkdown>{result.existing_crop_analysis}</ReactMarkdown>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.7 }}
                                    className="text-blue-900/90 leading-relaxed text-xl"
                                >
                                    Based on your soil's unique profile, <span className="font-extrabold text-blue-950 underline decoration-blue-500 decoration-4 bg-white/50 px-2 py-0.5 rounded-md underline-offset-4">{result.prediction}</span> has been identified as the optimal crop choice.
                                </motion.p>
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.8 }}
                                    className="text-blue-800/80 leading-relaxed text-lg"
                                >
                                    Our model analyzed the nutrient balance (N: {result.explanation?.input_data?.nitrogen ?? '—'}, P: {result.explanation?.input_data?.phosphorus ?? '—'}, K: {result.explanation?.input_data?.potassium ?? '—'})
                                    to ensure maximum yield potential.
                                </motion.p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* XAI Section */}
            {(result.shap_summary_url || result.lime_examples) && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-1.5 w-16 bg-gradient-to-r from-purple-400 to-fuchsia-300 rounded-full shadow-lg" />
                        <h2 className="text-3xl font-display font-black text-green-900 tracking-tight">Model Insights (XAI)</h2>
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
                                            <div className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-2">Logic Path #{idx + 1}</div>
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
