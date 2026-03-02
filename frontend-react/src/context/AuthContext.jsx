import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import BACKEND_URL from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On boot: restore user from localStorage if both user + token are present.
    // The stored token is considered valid until a protected API call returns 401.
    // Each individual page (Dashboard, FieldDetails, etc.) already handles 401
    // by clearing the token and redirecting to /login — so no separate validation
    // call is needed here, and we avoid an extra network request that could
    // hit CORS issues before the backend is reachable.
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                // Corrupt JSON — clear it
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            // OAuth2 expects form data
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const response = await axios.post(`${BACKEND_URL}/auth/login`, formData);

            const { access_token, user: userData } = response.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            return { success: true };
        } catch (error) {
            console.error("Login failed:", error);
            return {
                success: false,
                message: error.response?.data?.detail || "Login failed. Please check your credentials."
            };
        }
    };

    const register = async (fullName, email, password) => {
        try {
            await axios.post(`${BACKEND_URL}/auth/register`, {
                email,
                password,
                full_name: fullName
            });
            return { success: true, message: "Account is created successfully! Please log in." };
        } catch (error) {
            console.error("Registration failed:", error);
            const serverMsg = error.response?.data?.detail || error.response?.data || null;
            const message = serverMsg || error.message || "Registration failed. Try a different email.";
            return {
                success: false,
                message,
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
