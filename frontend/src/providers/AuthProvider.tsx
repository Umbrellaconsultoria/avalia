'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getKeycloak } from '../keycloak';

interface AuthContextType {
    isAuthenticated: boolean;
    isInitialized: boolean;
    user: any | null;
    token: string | null;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    isInitialized: false,
    user: null,
    token: null,
    login: () => {},
    logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const isRun = React.useRef(false);

    useEffect(() => {
        if (isRun.current) return;
        isRun.current = true;

        const initKeycloak = async () => {
            const keycloak = getKeycloak();
            if (!keycloak) return;

            try {
                const authenticated = await keycloak.init({
                    onLoad: 'check-sso',
                    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
                });

                if (authenticated && keycloak.token) {
                    setToken(keycloak.token);
                    
                    // Fetch real user profile from our Node.js Backend to get Internal Roles
                    try {
                        const response = await fetch('http://localhost:3001/api/auth/me', {
                            headers: {
                                Authorization: `Bearer ${keycloak.token}`
                            }
                        });
                        
                        if (response.ok) {
                            const dbProfile = await response.json();
                            setUser(dbProfile);
                        } else {
                            // Fallback to keycloak info if backend fails
                            setUser(await keycloak.loadUserProfile());
                        }
                    } catch (e) {
                         setUser(await keycloak.loadUserProfile());
                    }
                    
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
                
                setIsInitialized(true);
            } catch (error) {
                console.error('Failed to initialize Keycloak', error);
                setIsInitialized(true);
            }
        };

        initKeycloak();
    }, []);

    const login = () => {
        const keycloak = getKeycloak();
        if (keycloak) keycloak.login();
    };

    const logout = () => {
        const keycloak = getKeycloak();
        if (keycloak) keycloak.logout();
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isInitialized, user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
