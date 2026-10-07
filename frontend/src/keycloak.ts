'use client';

import Keycloak from 'keycloak-js';

export const keycloakConfig = {
    url: process.env.NEXT_PUBLIC_AUTH_LOGIN_URL || 'https://login.pi.gov.br/auth',
    realm: process.env.NEXT_PUBLIC_AUTH_LOGIN_REALM || 'pi',
    clientId: process.env.NEXT_PUBLIC_AUTH_LOGIN_CLIENT_ID || 'cuidar-piaui',
};

let keycloakInstance: Keycloak | null = null;

export const getKeycloak = (): Keycloak | null => {
    if (typeof window === 'undefined') return null;
    
    if (!keycloakInstance) {
        keycloakInstance = new Keycloak(keycloakConfig);
    }
    
    return keycloakInstance;
};
