import React, { createContext, useState, useEffect, ReactNode, useRef } from 'react';
import Keycloak from 'keycloak-js';

interface AuthContextProps {
  keycloak: Keycloak | null;
  authenticated: boolean;
  userInfo: any;
}

export const AuthContext = createContext<AuthContextProps>({
    keycloak: null,
    authenticated: false,
    userInfo: {}
    
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
    const [authenticated, setAuthenticated] = useState(false);
    const isInitialized = useRef(false);
    const [userInfo, setUserInfo] = useState<any>({});

    useEffect(() => {
        if (!isInitialized.current) {
            const initializeKeycloak = async () => {
                const kc = new Keycloak({
                    url: import.meta.env.VITE_KEYCLOAK_URL,
                    realm: import.meta.env.VITE_KEYCLOAK_REALM,
                    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
                });
    
                const auth = await kc.init({ onLoad: 'login-required' });
                setKeycloak(kc);
                setAuthenticated(auth);

                if (auth) {
                    const userInfo = await kc?.loadUserInfo();
                    setUserInfo(userInfo);
                }
            };

            
    
            initializeKeycloak();
            isInitialized.current = true;
        }
    }, []);

    return (
        <AuthContext.Provider value={{ keycloak, authenticated, userInfo }}>
            {children}
        </AuthContext.Provider>
    );
};