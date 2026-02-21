import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Traditional login (username + password)
    const login = async (formData) => {
        const res = await api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const token = res.data.access_token;
        localStorage.setItem('token', token);

        // Use user data from response if available, otherwise fetch
        if (res.data.user) {
            setUser(res.data.user);
            return res.data.user;
        }

        const userRes = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        });

        setUser(userRes.data);
        return userRes.data;
    };

    // Google OAuth login
    const googleLogin = async (credential) => {
        const res = await api.post('/auth/google', { credential });

        const token = res.data.access_token;
        localStorage.setItem('token', token);

        // Use user data from response if available, otherwise fetch
        if (res.data.user) {
            setUser(res.data.user);
            return res.data.user;
        }

        const userRes = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        });

        setUser(userRes.data);
        return userRes.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        window.location.href = '/';
    };

    const checkUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const res = await api.get('/auth/me', { timeout: 5000 });
            setUser(res.data);
        } catch (err) {
            setUser(null);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { checkUser(); }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, login, googleLogin, logout, loading, isAdmin: user?.is_admin, isMentor: user?.is_mentor }}>
            {loading ? (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-teal-300 font-bold animate-pulse text-xl font-display">
                        Initializing PDF2Quiz AI...
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};