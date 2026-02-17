'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '../services/api';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContextData {
    user: User | null;
    isAuthenticated: boolean;
    signIn: (credentials: any) => Promise<void>;
    signOut: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = Cookies.get('token');
        const storedUser = Cookies.get('user');

        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    async function signIn(credentials: any) {
        try {
            const response = await api.post('/auth/login', credentials);
            const { access_token, user } = response.data;

            Cookies.set('token', access_token, { expires: 1 }); // 1 day
            Cookies.set('user', JSON.stringify(user), { expires: 1 });

            setUser(user);
            router.push('/dashboard');
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    }

    function signOut() {
        Cookies.remove('token');
        Cookies.remove('user');
        setUser(null);
        router.push('/login');
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, signIn, signOut, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
