import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Leaf, FlaskConical, Zap, Activity, Droplets, Thermometer, Clock, RefreshCw } from 'lucide-react';

const SensorGauge = ({ label, value, unit, icon: Icon, color, min = 0, max = 100 }) => {
    const percentage = value != null ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;
    const hasValue = value != null;

    return (
        <div className="relative group">
            <div className="rounded-2xl p-4 transition-all duration-300 hover:scale-[1.03] bg-white/60 shadow-sm"
                style={{
                    border: '1px solid rgba(34,197,94,0.2)'
                }}>
                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white shadow-sm border border-gray-100">
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-green-800">{label}</span>
                </div>

                {/* Value */}
                <div className="flex items-baseline gap-1.5 mb-3">
                    <span className="text-2xl font-extrabold text-green-950 tabular-nums">
                        {hasValue ? (typeof value === 'number' ? value.toFixed(1) : value) : '—'}
                    </span>
                    {unit && <span className="text-xs font-bold text-green-700">{unit}</span>}
                </div>

                {/* Gauge bar */}
                <div className="h-1.5 rounded-full overflow-hidden bg-green-100">
                    <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: hasValue ? `${percentage}%` : '0%' }}
                        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                        style={{
                            background: `linear-gradient(90deg, ${color}cc, ${color})`,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

const formatTimeAgo = (date) => {
    if (!date) return 'Never';
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
};

export const SensorPanel = ({ sensorData, isConnected, lastUpdated, error, onLoadSensorData }) => {
    const [timeAgo, setTimeAgo] = React.useState('');

    // Update "time ago" every 10 seconds
    React.useEffect(() => {
        setTimeAgo(formatTimeAgo(lastUpdated));
        const interval = setInterval(() => setTimeAgo(formatTimeAgo(lastUpdated)), 10000);
        return () => clearInterval(interval);
    }, [lastUpdated]);

    const gauges = [
        { label: 'Nitrogen', key: 'nitrogen', icon: Leaf, color: '#52b788', unit: 'mg/kg', max: 150 },
        { label: 'Phosphorus', key: 'phosphorus', icon: FlaskConical, color: '#f4a261', unit: 'mg/kg', max: 150 },
        { label: 'Potassium', key: 'potassium', icon: Zap, color: '#e9c46a', unit: 'mg/kg', max: 150 },
        { label: 'pH Level', key: 'pH', icon: Activity, color: '#a78bfa', min: 0, max: 14 },
        { label: 'Moisture', key: 'moisture', icon: Droplets, color: '#60a5fa', unit: '%', max: 100 },
        { label: 'Temperature', key: 'temperature', icon: Thermometer, color: '#f87171', unit: '°C', max: 50 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl p-6 mb-6 relative overflow-hidden bg-white/80 shadow-md border border-green-200"
            style={{ backdropFilter: 'blur(12px)' }}
        >
            {/* Subtle gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: 'linear-gradient(90deg, #52b788, #60a5fa, #a78bfa, #f4a261)' }} />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm"
                        style={{
                            border: `1px solid ${isConnected ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        }}>
                        {isConnected ? (
                            <Wifi className="w-5 h-5 text-green-400" />
                        ) : (
                            <WifiOff className="w-5 h-5 text-red-400" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-base font-extrabold text-green-950 flex items-center gap-2">
                            📡 Live Sensor Feed
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isConnected ? 'text-green-800 bg-green-100 border border-green-300' : 'text-red-800 bg-red-100 border border-red-300'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3 text-green-500" />
                            <span className="text-[11px] font-bold text-green-700">
                                Last update: {timeAgo}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Load button */}
                {sensorData && onLoadSensorData && (
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 4px 15px rgba(34,197,94,0.3)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onLoadSensorData(sensorData)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-sm"
                        style={{
                            background: 'linear-gradient(135deg, #16a34a, #22c55e)'
                        }}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Load into Form
                    </motion.button>
                )}
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 p-3 rounded-xl text-xs font-bold bg-red-50 border border-red-200 text-red-700"
                    >
                        ⚠️ {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sensor gauges */}
            {sensorData ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {gauges.map((g, i) => (
                        <motion.div
                            key={g.key}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                        >
                            <SensorGauge
                                label={g.label}
                                value={sensorData[g.key]}
                                unit={g.unit}
                                icon={g.icon}
                                color={g.color}
                                min={g.min}
                                max={g.max}
                            />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        className="text-4xl mb-3"
                    >
                        📡
                    </motion.div>
                    <p className="text-sm font-bold text-green-700">
                        {isConnected
                            ? 'Waiting for sensor data...'
                            : 'Connect a sensor to see live readings'}
                    </p>
                    <p className="text-xs mt-1 font-medium text-green-600/70">
                        Data will appear here automatically when your sensor pushes to Firebase
                    </p>
                </div>
            )}
        </motion.div>
    );
};
