import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Loader2, Navigation, X, Crosshair } from 'lucide-react';

// Fix Leaflet default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom green marker icon for agriculture theme
const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Component to handle map click events
const MapClickHandler = ({ onMapClick }) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        },
    });
    return null;
};

// Component to recenter map programmatically
const MapRecenter = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom || 13, { duration: 1.2 });
        }
    }, [center, zoom, map]);
    return null;
};

// Component to handle draggable marker
const DraggableMarker = ({ position, onDragEnd }) => {
    const markerRef = useRef(null);

    const eventHandlers = {
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const latlng = marker.getLatLng();
                onDragEnd(latlng);
            }
        },
    };

    return position ? (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
            icon={greenIcon}
        />
    ) : null;
};

export const LocationPicker = ({ value, onChange }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [mapCenter, setMapCenter] = useState(
        value?.latitude && value?.longitude
            ? [value.latitude, value.longitude]
            : [20.5937, 78.9629] // Default: center of India
    );
    const [markerPosition, setMarkerPosition] = useState(
        value?.latitude && value?.longitude
            ? [value.latitude, value.longitude]
            : null
    );
    const [searchError, setSearchError] = useState('');
    const [isLocating, setIsLocating] = useState(false);
    const searchTimeoutRef = useRef(null);
    const resultsRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (resultsRef.current && !resultsRef.current.contains(e.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reverse geocode a lat/lng to display name
    const reverseGeocode = useCallback(async (lat, lng) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const data = await res.json();
            return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        } catch {
            return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
    }, []);

    // Handle position update (from click, drag, or search)
    const updatePosition = useCallback(async (lat, lng, displayName) => {
        const newPos = [lat, lng];
        setMarkerPosition(newPos);
        setMapCenter(newPos);

        if (!displayName) {
            displayName = await reverseGeocode(lat, lng);
        }

        onChange?.({
            latitude: lat,
            longitude: lng,
            displayName,
        });
    }, [onChange, reverseGeocode]);

    // Handle map click
    const handleMapClick = useCallback((latlng) => {
        updatePosition(latlng.lat, latlng.lng);
    }, [updatePosition]);

    // Handle marker drag end
    const handleDragEnd = useCallback((latlng) => {
        updatePosition(latlng.lat, latlng.lng);
    }, [updatePosition]);

    // Search Nominatim
    const performSearch = useCallback(async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        setSearchError('');

        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const data = await res.json();

            if (data.length === 0) {
                setSearchError('No results found. Try a different search.');
                setSearchResults([]);
            } else {
                setSearchResults(data);
                setShowResults(true);
            }
        } catch (err) {
            setSearchError('Search failed. Check your internet connection.');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Debounced search on input change
    const handleSearchInput = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        setSearchError('');

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            performSearch(val);
        }, 500);
    };

    // Select a search result
    const handleSelectResult = (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        updatePosition(lat, lng, result.display_name);
        setSearchQuery(result.display_name);
        setShowResults(false);
        setSearchResults([]);
    };

    // Handle search form submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        performSearch(searchQuery);
    };

    // Clear search
    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setShowResults(false);
        setSearchError('');
    };

    // Use device's current location via Geolocation API
    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            setSearchError('Geolocation is not supported by your browser.');
            return;
        }

        setIsLocating(true);
        setSearchError('');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                updatePosition(latitude, longitude);
                setSearchQuery('');
                setIsLocating(false);
            },
            (err) => {
                setIsLocating(false);
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        setSearchError('Location permission denied. Please allow location access in your browser settings.');
                        break;
                    case err.POSITION_UNAVAILABLE:
                        setSearchError('Location information is unavailable.');
                        break;
                    case err.TIMEOUT:
                        setSearchError('Location request timed out. Please try again.');
                        break;
                    default:
                        setSearchError('An unknown error occurred while getting location.');
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return (
        <div className="space-y-3">
            {/* Search bar */}
            <div className="relative" ref={resultsRef}>
                <form onSubmit={handleSearchSubmit} className="relative">
                    <div className="relative rounded-xl overflow-hidden"
                        style={{
                            border: '1px solid rgba(134,239,172,0.4)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        }}>
                        <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center bg-green-50/50 border-r border-green-100">
                            {isSearching ? (
                                <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
                            ) : (
                                <Search className="w-4 h-4 text-green-500" />
                            )}
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchInput}
                            placeholder="Search village, city, or district..."
                            className="w-full pl-14 pr-10 py-3 bg-white text-green-950 font-semibold text-sm outline-none placeholder-green-400/60"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-green-100 transition-colors"
                            >
                                <X className="w-3.5 h-3.5 text-green-600" />
                            </button>
                        )}
                    </div>
                </form>

                {/* Use Current Location button */}
                <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{
                        background: isLocating ? 'rgba(220,252,231,0.6)' : 'linear-gradient(135deg, rgba(220,252,231,0.7), rgba(236,253,245,0.7))',
                        border: '1px solid rgba(34,197,94,0.3)',
                        color: '#166534',
                        cursor: isLocating ? 'wait' : 'pointer',
                    }}
                >
                    {isLocating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Crosshair className="w-4 h-4" />
                    )}
                    {isLocating ? 'Getting your location...' : '📍 Use Current Location'}
                </button>

                {/* Search results dropdown */}
                {showResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-[1000] rounded-xl overflow-hidden shadow-xl border border-green-200"
                        style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)' }}>
                        {searchResults.map((result, i) => (
                            <button
                                key={i}
                                onClick={() => handleSelectResult(result)}
                                className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-green-50 transition-colors border-b border-green-50 last:border-b-0"
                            >
                                <MapPin className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-green-900 truncate">{result.display_name}</p>
                                    <p className="text-xs text-green-600 mt-0.5">
                                        {parseFloat(result.lat).toFixed(4)}°N, {parseFloat(result.lon).toFixed(4)}°E
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Search error */}
            {searchError && (
                <p className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                    ⚠️ {searchError}
                </p>
            )}

            {/* Map */}
            <div className="rounded-2xl overflow-hidden border border-green-200 shadow-sm" style={{ height: '400px' }}>
                <MapContainer
                    center={mapCenter}
                    zoom={markerPosition ? 13 : 5}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onMapClick={handleMapClick} />
                    <MapRecenter center={mapCenter} zoom={13} />
                    <DraggableMarker position={markerPosition} onDragEnd={handleDragEnd} />
                </MapContainer>
            </div>

            {/* Hint text */}
            <p className="text-xs font-medium text-green-600/70 flex items-center gap-1.5">
                <Navigation className="w-3 h-3" />
                Search or click on the map to set location. Drag the marker to fine-tune.
            </p>

            {/* Selected location info */}
            {markerPosition && value?.displayName && (
                <div className="rounded-xl p-3 flex items-start gap-3"
                    style={{
                        background: 'linear-gradient(135deg, rgba(220,252,231,0.5), rgba(236,253,245,0.5))',
                        border: '1px solid rgba(34,197,94,0.25)'
                    }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm border border-green-200 flex-shrink-0">
                        <MapPin className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-green-900 truncate">{value.displayName}</p>
                        <p className="text-xs font-semibold text-green-700 mt-0.5">
                            📍 {value.latitude.toFixed(6)}°N, {value.longitude.toFixed(6)}°E
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
