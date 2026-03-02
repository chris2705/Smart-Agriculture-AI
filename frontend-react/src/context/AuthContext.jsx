import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import BACKEND_URL from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On boot: validate stored token against the backend.
    // If the token is expired or invalid, clear it so the user
    // sees the login page instead of being bounced in a redirect loop.
    useEffect(() => {
        const validateSession = async () => {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            if (!storedUser || !token) {
                // No stored session — go straight to login
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                // Quick validation: hit a lightweight authenticated endpoint
                await axios.get(`${BACKEND_URL}/fields/`, {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 5000
                });
                // Token is still valid
                setUser(JSON.parse(storedUser));
            } catch (err) {
                // Token is invalid / expired / network error on auth endpoint
                console.warn('Stored session is invalid, clearing auth data.', err?.response?.status);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        validateSession();
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
