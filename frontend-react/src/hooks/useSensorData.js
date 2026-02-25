import { useState, useEffect, useRef } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../lib/firebase';

/**
 * Custom hook to subscribe to real-time sensor data from Firebase RTDB.
 *
 * @param {string} sensorId - The sensor/device ID. Currently the ESP32
 *   pushes all data to the single path `/sensorData`, so this param is
 *   accepted for future multi-sensor support but the listener always
 *   reads from `/sensorData`.
 * @returns {{ sensorData, isConnected, lastUpdated, error }}
 *
 * Expected RTDB structure at /sensorData:
 * {
 *   nitrogen: number,
 *   phosphorus: number,
 *   potassium: number,
 *   pH: number,
 *   moisture: number,
 *   temperature: number,
 *   timestamp: number (Arduino millis() uptime – NOT epoch)
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
                        // The Arduino currently sends millis() (device uptime),
                        // which is NOT a real epoch timestamp. We use the
                        // current wall-clock time as the "last updated" stamp
                        // so the UI shows a meaningful recency indicator.
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
