import React from 'react';
import { Lock, Key } from 'lucide-react';
import type { SecuritySchemeObject, AuthCredentials } from './types';

interface AuthenticationInputProps {
    securitySchemes: Record<string, SecuritySchemeObject>;
    requiredSecurity: string[];
    credentials: AuthCredentials | null;
    onChange: (credentials: AuthCredentials | null) => void;
}

export default function AuthenticationInput({
    securitySchemes,
    requiredSecurity,
    credentials,
    onChange,
}: AuthenticationInputProps) {
    if (requiredSecurity.length === 0) {
        return null;
    }

    const handleChange = (value: string) => {
        const schemeName = requiredSecurity[0];
        const scheme = securitySchemes[schemeName];

        if (!scheme) {
            onChange(null);
            return;
        }

        if (scheme.type === 'http' && scheme.scheme === 'bearer') {
            onChange({
                type: 'bearer',
                value,
            });
        } else if (scheme.type === 'apiKey') {
            onChange({
                type: 'apiKey',
                value,
                name: scheme.name,
                in: scheme.in as 'header' | 'query',
            });
        } else {
            onChange(null);
        }
    };

    const renderAuthInput = () => {
        const schemeName = requiredSecurity[0];
        const scheme = securitySchemes[schemeName];

        if (!scheme) {
            return (
                <div className="text-sm text-gray-600">
                    Security scheme &quot;{schemeName}&quot; not found in specification
                </div>
            );
        }

        if (scheme.type === 'http' && scheme.scheme === 'bearer') {
            return (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Bearer Token
                        </div>
                    </label>
                    <input
                        type="password"
                        placeholder="Enter your bearer token"
                        value={credentials?.type === 'bearer' ? credentials.value : ''}
                        onChange={(e) => handleChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {scheme.description && (
                        <p className="text-xs text-gray-500 mt-1">{scheme.description}</p>
                    )}
                </div>
            );
        }

        if (scheme.type === 'apiKey') {
            return (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                            <Key className="w-4 h-4" />
                            API Key
                            {scheme.name && (
                                <span className="text-xs text-gray-500">
                                    ({scheme.in}: {scheme.name})
                                </span>
                            )}
                        </div>
                    </label>
                    <input
                        type="password"
                        placeholder={`Enter your API key (${scheme.in})`}
                        value={credentials?.type === 'apiKey' ? credentials.value : ''}
                        onChange={(e) => handleChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {scheme.description && (
                        <p className="text-xs text-gray-500 mt-1">{scheme.description}</p>
                    )}
                </div>
            );
        }

        if (scheme.type === 'oauth2') {
            return (
                <div className="text-sm text-gray-600">
                    OAuth2 authentication is not yet supported. This feature is coming soon.
                </div>
            );
        }

        if (scheme.type === 'openIdConnect') {
            return (
                <div className="text-sm text-gray-600">
                    OpenID Connect authentication is not yet supported. This feature is coming soon.
                </div>
            );
        }

        return (
            <div className="text-sm text-gray-600">
                Unsupported authentication type: {scheme.type}
            </div>
        );
    };

    return (
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-yellow-700" />
                <h3 className="font-semibold text-yellow-900">Authentication Required</h3>
            </div>
            {renderAuthInput()}
        </div>
    );
}