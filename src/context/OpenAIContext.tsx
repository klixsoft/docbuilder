import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Server } from '@/components/OpenAPIViewer/types';

interface SecurityConfig {
    [key: string]: string;
}

interface OpenAPIContextType {
    selectedServer: Server | null;
    setSelectedServer: (server: Server | null) => void;
    securityConfig: SecurityConfig;
    setSecurityConfig: (config: SecurityConfig) => void;
    updateSecurityValue: (schemeName: string, value: string) => void;
}

const OpenAPIContext = createContext<OpenAPIContextType | undefined>(undefined);

export function OpenAPIProvider({ children }: { children: ReactNode }) {
    const [selectedServer, setSelectedServer] = useState<Server | null>(null);
    const [securityConfig, setSecurityConfig] = useState<SecurityConfig>({});

    const updateSecurityValue = (schemeName: string, value: string) => {
        setSecurityConfig(prev => ({
            ...prev,
            [schemeName]: value
        }));
    };

    return (
        <OpenAPIContext.Provider
            value={{
                selectedServer,
                setSelectedServer,
                securityConfig,
                setSecurityConfig,
                updateSecurityValue,
            }}
        >
            {children}
        </OpenAPIContext.Provider>
    );
}

export function useOpenAPI() {
    const context = useContext(OpenAPIContext);
    if (!context) {
        throw new Error('useOpenAPI must be used within OpenAPIProvider');
    }
    return context;
}