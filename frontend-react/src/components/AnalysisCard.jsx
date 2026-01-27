import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Droplets, FlaskConical, Sprout, ArrowRight } from 'lucide-react';

export const AnalysisCard = ({ mode, data, selectedCrop, recommendedCrop, onAction }) => {
    const isHealthy = mode === 'existing' && recommendedCrop === selectedCrop; // Simple logic: if recommendation matches selection
    // Or if mode is 'new', it's always a recommendation.

    const renderExistingCropAnalysis = () => (
        <div className="space-y-6">
            <div className={`p-4 rounded-xl border ${isHealthy ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'} flex items-start gap-4`}>
                <div className={`p-2 rounded-full ${isHealthy ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    {isHealthy ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div>
                    <h3 className={`font-bold ${isHealthy ? 'text-green-800' : 'text-amber-800'}`}>
                        {isHealthy ? 'Optimal Conditions' : 'Attention Needed'}
                    </h3>
                    <p className={`text-sm ${isHealthy ? 'text-green-600' : 'text-amber-600'}`}>
                        {isHealthy
                            ? `Your field is perfectly suited for ${selectedCrop}.`
                            : `Current soil conditions might not be ideal for ${selectedCrop}. Predicted best crop is ${recommendedCrop}.`
                        }
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/50 p-4 rounded-xl border border-zinc-100">
                    <h4 className="font-semibold text-zinc-700 mb-3 flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-nature-500" /> Nutrient Status
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Nitrogen</span>
                            <span className={data.nitrogen < 10 ? "text-amber-500 font-medium" : "text-zinc-700"}>
                                {data.nitrogen < 10 ? 'Low' : 'Optimal'} ({data.nitrogen})
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Phosphorus</span>
                            <span className="text-zinc-700">Optimal ({data.phosphorus})</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white/50 p-4 rounded-xl border border-zinc-100">
                    <h4 className="font-semibold text-zinc-700 mb-3 flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-500" /> Recommendations
                    </h4>
                    <ul className="text-sm space-y-2 text-zinc-600 list-disc list-inside">
                        {data.nitrogen < 10 && <li>Apply urea fertilizer for N boost.</li>}
                        <li>Maintain moisture at {data.moisture}%.</li>
                        <li>Monitor for early pests.</li>
                    </ul>
                </div>
            </div>
        </div>
    );

    const renderNewCropRecommendation = () => (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-nature-50 to-emerald-50 border border-nature-100 p-6 rounded-2xl text-center">
                <div className="inline-block p-4 bg-white rounded-full shadow-sm mb-4">
                    <Sprout className="w-12 h-12 text-nature-600" />
                </div>
                <h3 className="text-2xl font-bold text-nature-900 mb-2">{recommendedCrop}</h3>
                <p className="text-nature-700 mb-6">Highly recommended for your soil profile.</p>

                <button
                    onClick={onAction}
                    className="bg-nature-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-nature-700 shadow-md transition-colors"
                >
                    Establish this Crop
                </button>
            </div>

            <div className="bg-white/50 p-4 rounded-xl border border-zinc-100">
                <h4 className="font-semibold text-zinc-700 mb-3">Preparation Steps</h4>
                <ul className="space-y-3">
                    {[
                        'Plow the field to a depth of 20-30cm.',
                        'Mix organic compost 2 weeks before planting.',
                        'Ensure irrigation channels are clear.'
                    ].map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm text-zinc-600">
                            <div className="w-6 h-6 rounded-full bg-nature-100 text-nature-600 flex items-center justify-center shrink-0 font-bold text-xs">
                                {i + 1}
                            </div>
                            {step}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );

    return (
        <div className="h-full">
            {mode === 'existing' ? renderExistingCropAnalysis() : renderNewCropRecommendation()}
        </div>
    );
};
