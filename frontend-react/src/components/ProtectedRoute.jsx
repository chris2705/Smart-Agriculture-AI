import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Sprout } from 'lucide-react';

/**
 * ProtectedRoute — wraps any route that requires authentication.
 *
 * While auth state is still loading (e.g. reading token from localStorage)
 * it shows a branded loading spinner instead of rendering children, which
 * prevents premature 401 API calls and redirect loops.
 *
 * Once loading is finished:
 *   - If user is authenticated → render children normally
 *   - If user is NOT authenticated → redirect to /login (replace history)
 */
export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // Auth state is still initialising — show a loading screen
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center"
                style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 50%, #ecfdf5 100%)' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 rounded-full border-4 border-green-100 flex items-center justify-center mb-4"
                    style={{ borderTopColor: '#22c55e' }}
                />
                <div className="flex items-center gap-2 text-green-700 font-bold text-lg">
                    <Sprout className="w-5 h-5" />
                    Loading SmartAgri…
                </div>
            </div>
        );
    }

    // Not authenticated — redirect to login, replacing the current
    // history entry so the user can't hit "Back" into a protected page.
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Authenticated — render the page
    return children;
};
