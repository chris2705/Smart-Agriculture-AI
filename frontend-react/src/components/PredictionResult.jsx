import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, TestTube } from 'lucide-react';

const ResultCard = ({ title, value, icon: Icon, colorClass, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
    >
        <div className="flex items-center gap-4 mb-3">
            <div className={`p-3 rounded-xl ${colorClass} bg-opacity-20`}>
                <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
            </div>
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{title}</h3>
        </div>
        <div className="text-2xl font-bold text-zinc-900">
            {value}
        </div>
    </motion.div>
);

export const PredictionResult = ({ result }) => {
    if (!result) return null;

    const sortedProbs = Object.entries(result.explanation?.crop_probabilities || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); // Top 5

    return (
        <div className="space-y-8 mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResultCard
                    title="Recommended Crop"
                    value={result.prediction}
                    icon={Sprout}
                    colorClass="bg-nature-600 text-nature-600"
                    delay={0.1}
                />
                <ResultCard
                    title="Recommended Fertilizer"
                    value={result.explanation?.fertilizer_recommendation}
                    icon={TestTube}
                    colorClass="bg-blue-600 text-blue-600"
                    delay={0.2}
                />
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-100"
            >
                <h3 className="text-lg font-semibold text-zinc-800 mb-6 flex items-center gap-2">
                    <span>📊</span> Crop Probability Analysis
                </h3>
                <div className="space-y-4">
                    {sortedProbs.map(([crop, prob], idx) => (
                        <div key={crop} className="relative">
                            <div className="flex justify-between text-sm font-medium text-zinc-600 mb-1">
                                <span className="capitalize">{crop}</span>
                                <span>{(prob * 100).toFixed(1)}%</span>
                            </div>
                            <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${prob * 100}%` }}
                                    transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                                    className="h-full bg-gradient-to-r from-nature-400 to-nature-600 rounded-full"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {result.explanation && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100"
                >
                    <h4 className="font-semibold text-blue-900 mb-2">💡 AI Insight</h4>
                    <div className="text-blue-800 leading-relaxed">
                        Based on the soil analysis, <span className="font-bold">{result.prediction}</span> is identified as the optimal crop.
                        This recommendation considers the specific nutrient balance and calculated total NPK levels.
                    </div>
                </motion.div>
            )}
        </div>
    );
};
