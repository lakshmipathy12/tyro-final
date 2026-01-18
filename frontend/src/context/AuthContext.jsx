import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/axiosConfig';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for user data on initial load
        // Note: Secure HttpOnly cookie handles the session, but we keep user info in state
        try {
            const storedUser = localStorage.getItem('tyro_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from local storage", error);
            localStorage.removeItem('tyro_user');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.data.status === 'success') {
                const userData = response.data.data.user;
                setUser(userData);
                localStorage.setItem('tyro_user', JSON.stringify(userData));
                toast.success(`Welcome back, ${userData.name}!`);
                return true;
            }
        } catch (error) {
            console.error("Login failed", error);
            toast.error(error.response?.data?.message || 'Login failed');
            return false;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            localStorage.removeItem('tyro_user');
            toast.info('Logged out successfully');
        } catch (error) {
            console.error("Logout failed", error);
            // Forced local logout anyway
            setUser(null);
            localStorage.removeItem('tyro_user');
        }
    };

    const updateUser = (updatedData) => {
        const newUserData = { ...user, ...updatedData };
        setUser(newUserData);
        localStorage.setItem('tyro_user', JSON.stringify(newUserData));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
