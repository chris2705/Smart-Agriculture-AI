import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, CloudSun, MapPin, Droplets, Wind, Sun, Thermometer,
    Eye, Gauge, Loader2, AlertCircle, RefreshCw, Sunrise, Sunset
} from 'lucide-react';

const API_KEY = '04435bd283858d117e39b59a82afd455';

const getWeatherIcon = (code) => {
    if (code >= 200 && code < 300) return '⛈️';
    if (code >= 300 && code < 400) return '🌦️';
    if (code >= 500 && code < 600) return '🌧️';
    if (code >= 600 && code < 700) return '❄️';
    if (code >= 700 && code < 800) return '🌫️';
    if (code === 800) return '☀️';
    if (code > 800) return '⛅';
    return '🌡️';
};

const formatTime = (unix) => {
    const d = new Date(unix * 1000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const StatCard = ({ icon: Icon, iconColor, bg, label, value, sub }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${bg} rounded-2xl p-5 border border-white/60 flex items-center gap-4 shadow-sm`}
    >
        <div className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center flex-shrink-0">
            <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-0.5">{label}</div>
            <div className="text-2xl font-black text-slate-800">{value}</div>
            {sub && <div className="text-xs text-slate-500 font-medium mt-0.5">{sub}</div>}
        </div>
    </motion.div>
);

export const WeatherPage = () => {
    const navigate = useNavigate();
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cityInput, setCityInput] = useState('');
    const [searchQuery, setSearchQuery] = useState(null);

    const parseApiError = async (res) => {
        if (res.status === 401) {
            return 'API key not yet activated. OpenWeatherMap free keys take up to 2 hours to become active after registration. Please try again shortly.';
        }
        if (res.status === 404) return 'City not found. Please check the spelling and try again.';
        try {
            const err = await res.json();
            return err.message || `API error: ${res.status}`;
        } catch {
            return `API error: ${res.status}`;
        }
    };

    const fetchWeatherByCoords = async (lat, lon) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
            );
            if (!res.ok) throw new Error(await parseApiError(res));
            const data = await res.json();
            setWeather(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchWeatherByCity = async (city) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
            );
            if (!res.ok) throw new Error(await parseApiError(res));
            const data = await res.json();
            setWeather(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // On mount: try to get geolocation
    useEffect(() => {
        if (searchQuery) {
            fetchWeatherByCity(searchQuery);
            return;
        }
        if (!navigator.geolocation) {
            setError('Geolocation not supported by your browser. Please search for a city below.');
            setLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
            () => {
                setError('Location access denied. Please search for a city below.');
                setLoading(false);
            }
        );
    }, [searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (cityInput.trim()) setSearchQuery(cityInput.trim());
    };

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #eff6ff 0%, #dbeafe 40%, #f0fdf4 100%)' }}>
            {/* Animated sky gradient blobs */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-green-200/30 blur-3xl" />
            </div>

            {/* Header Banner */}
            <div className="relative h-52 md:h-64 overflow-hidden shadow-sm">
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=2065&auto=format&fit=crop')` }}
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(239,246,255,0.4) 0%, rgba(219,234,254,0.95) 100%)' }} />
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/welcome')}
                    className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm shadow-sm"
                    style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(59,130,246,0.3)', color: '#1e3a8a' }}
                >
                    <ArrowLeft className="w-4 h-4 text-blue-700" />
                    Back to Welcome Page
                </motion.button>
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-blue-200">
                                <CloudSun className="w-6 h-6 text-blue-600" />
                            </div>
                            <h1 className="text-4xl font-extrabold text-blue-950">Weather Details</h1>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Search bar */}
            <div className="container mx-auto px-4 pt-8 max-w-5xl">
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onSubmit={handleSearch}
                    className="flex gap-3"
                >
                    <div className="flex-1 relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                        <input
                            type="text"
                            value={cityInput}
                            onChange={e => setCityInput(e.target.value)}
                            placeholder="Search a city (e.g. Mumbai, London)..."
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/80 border border-blue-200 text-blue-900 placeholder-blue-400 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none font-medium shadow-sm backdrop-blur-md"
                        />
                    </div>
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="px-6 py-3.5 rounded-2xl font-bold text-white shadow-md"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
                    >
                        Search
                    </motion.button>
                    {weather && (
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { setSearchQuery(null); setWeather(null); setLoading(true); setCityInput(''); }}
                            title="Use my location"
                            className="px-4 py-3.5 rounded-2xl bg-white/80 border border-blue-200 text-blue-600 shadow-sm"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </motion.button>
                    )}
                </motion.form>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6 max-w-5xl pb-16">
                <AnimatePresence mode="wait">
                    {loading && (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                            <p className="text-blue-700 font-semibold">Fetching weather data…</p>
                        </motion.div>
                    )}

                    {error && !loading && (
                        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="mt-6 p-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-semibold flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 flex-shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {weather && !loading && (
                        <motion.div key="weather" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                            className="space-y-6 mt-6">
                            {/* Main Card */}
                            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-blue-100 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-blue-400 to-cyan-400" />
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                    <div>
                                        <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{weather.name}, {weather.sys?.country}</span>
                                        </div>
                                        <div className="text-7xl mb-3">{getWeatherIcon(weather.weather?.[0]?.id)}</div>
                                        <div className="text-6xl font-black text-slate-800 leading-none">
                                            {Math.round(weather.main?.temp)}°C
                                        </div>
                                        <div className="text-blue-700 font-semibold text-lg mt-2 capitalize">
                                            {weather.weather?.[0]?.description}
                                        </div>
                                        <div className="text-slate-500 text-sm mt-1">
                                            Feels like {Math.round(weather.main?.feels_like)}°C ·
                                            High {Math.round(weather.main?.temp_max)}° ·
                                            Low {Math.round(weather.main?.temp_min)}°
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 md:items-end">
                                        <div className="flex items-center gap-2 text-orange-500 font-bold">
                                            <Sunrise className="w-5 h-5" />
                                            <span>Sunrise {formatTime(weather.sys?.sunrise)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-indigo-500 font-bold">
                                            <Sunset className="w-5 h-5" />
                                            <span>Sunset {formatTime(weather.sys?.sunset)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <StatCard icon={Droplets} iconColor="text-blue-500" bg="bg-blue-50" label="Humidity" value={`${weather.main?.humidity}%`} sub="Relative humidity" />
                                <StatCard icon={Wind} iconColor="text-teal-500" bg="bg-teal-50" label="Wind Speed" value={`${weather.wind?.speed} m/s`} sub={`Direction: ${weather.wind?.deg}°`} />
                                <StatCard icon={Gauge} iconColor="text-purple-500" bg="bg-purple-50" label="Pressure" value={`${weather.main?.pressure} hPa`} sub="Atmospheric" />
                                <StatCard icon={Eye} iconColor="text-cyan-500" bg="bg-cyan-50" label="Visibility" value={`${((weather.visibility || 0) / 1000).toFixed(1)} km`} sub="Horizontal visibility" />
                                <StatCard icon={Thermometer} iconColor="text-orange-500" bg="bg-orange-50" label="Feels Like" value={`${Math.round(weather.main?.feels_like)}°C`} sub="Apparent temperature" />
                                <StatCard icon={Sun} iconColor="text-yellow-500" bg="bg-yellow-50" label="Cloud Cover" value={`${weather.clouds?.all}%`} sub="Cloudiness" />
                            </div>

                            {/* Agricultural insight */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                                <h3 className="text-lg font-bold text-green-900 mb-2">🌱 Farming Conditions</h3>
                                <p className="text-green-800 font-medium leading-relaxed">
                                    {weather.main?.humidity > 80
                                        ? 'High humidity — watch for fungal disease risk. Consider spacing for airflow.'
                                        : weather.main?.humidity < 30
                                            ? 'Low humidity detected — irrigate your fields and monitor moisture closely.'
                                            : 'Humidity levels are in a healthy range for most crops.'}
                                    {' '}
                                    {weather.wind?.speed > 10
                                        ? 'Strong winds may affect spraying operations — plan accordingly.'
                                        : 'Wind is calm — favorable conditions for field operations.'}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
