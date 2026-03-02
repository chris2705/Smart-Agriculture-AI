import { useState, useEffect, useRef } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../lib/firebase';

/**
 * Custom hook to subscribe to real-time sensor data from Firebase RTDB.
 *
 * @param {string} sensorId - The sensor/device ID (path: sensors/<sensorId>)
 * @returns {{ sensorData, isConnected, lastUpdated, error }}
 *
 * Expected RTDB structure at sensors/<sensorId>:
 * {
 *   nitrogen: number,
 *   phosphorus: number,
 *   potassium: number,
 *   pH: number,
 *   moisture: number,
 *   temperature: number,
 *   timestamp: number (ms since epoch)
 * }
 */
export const useSensorData = (sensorId = 'default') => {
    const [sensorData, setSensorData] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [error, setError] = useState(null);
    const listenerRef = useRef(null);

    useEffect(() => {
        if (!sensorId) return;

        setError(null);

        try {
            if (!database) {
                const msg = 'Realtime database not configured. Firebase disabled.';
                console.warn('[useSensorData] ' + msg);
                setError(msg);
                setIsConnected(false);
                return;
            }

            // The ESP32 sensor writes to /sensorData (flat path).
            // For future multi-sensor support you could use /sensors/<sensorId>.
            const sensorRef = ref(database, 'sensorData');
            listenerRef.current = sensorRef;

            const unsubscribe = onValue(
                sensorRef,
                (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        setSensorData({
                            nitrogen: data.nitrogen ?? null,
                            phosphorus: data.phosphorus ?? null,
                            potassium: data.potassium ?? null,
                            pH: data.pH ?? null,
                            moisture: data.moisture ?? null,
                            temperature: data.temperature ?? null,
                        });
                        // The ESP32 sends millis() as timestamp, which is time since boot, not epoch time.
                        // Using new Date() reflects when the frontend receives the data.
                        setLastUpdated(new Date());
                        setIsConnected(true);
                    } else {
                        // Path exists but no data yet
                        setSensorData(null);
                        setIsConnected(true);
                    }
                },
                (err) => {
                    console.error('[useSensorData] Firebase error:', err);
                    setError(err.message);
                    setIsConnected(false);
                }
            );

            return () => {
                // Clean up listener
                off(sensorRef);
            };
        } catch (err) {
            console.error('[useSensorData] Init error:', err);
            setError(err.message);
            setIsConnected(false);
        }
    }, [sensorId]);

    return { sensorData, isConnected, lastUpdated, error };
};
