'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from './Sidebar';
import Header from './Header';
import ContentArea from './ContentArea';
import type { OpenAPISpec, EndpointGroup, HttpMethod } from './types';
import { OpenAPIProvider, useOpenAPI } from '@/context/OpenAIContext';
import { ProtectionGate } from './ProtectionGate';
import Footer from './Footer';
import { checkAccess } from '@/app/actions/auth';

interface AuthField {
    type: string;
    label: string;
    placeholder: string;
}

interface AuthenticationConfig {
    fields: AuthField[];
    onAuthenticated?: () => void;
}

interface OpenAPIViewerContentProps {
    spec: OpenAPISpec;
    authentication?: AuthenticationConfig;
    company: string | React.ReactNode;
    theme: 'light' | 'dark' | 'system';
    allowedThemes?: string[];
    schemas?: import('./types').SchemaVersion[];
    currentSchemaId?: string;
    projectHash?: string;
    projectName?: string;
}

function OpenAPIViewerContentInner({ spec, authentication, company, theme, allowedThemes, schemas, currentSchemaId, projectHash, projectName }: OpenAPIViewerContentProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [selectedPath, setSelectedPath] = useState<string | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const { setSelectedServer } = useOpenAPI();

    useEffect(() => {
        async function verifyAuth() {
            if (!authentication) {
                setIsAuthenticated(true);
                setCheckingAuth(false);
                return;
            }

            try {
                const hasAccess = await checkAccess();
                setIsAuthenticated(hasAccess);
            } catch (err) {
                console.error('Error during access check:', err);
                setIsAuthenticated(false);
            } finally {
                setCheckingAuth(false);
            }
        }

        verifyAuth();
    }, [authentication]);

    useEffect(() => {
        if (spec.servers && spec.servers.length > 0) {
            setSelectedServer(spec.servers[0]);
        }

        const firstPath = Object.keys(spec.paths)[0];
        if (firstPath) {
            const pathItem = spec.paths[firstPath];
            const firstMethod = Object.keys(pathItem).find(key =>
                ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'trace'].includes(key)
            );
            if (firstMethod) {
                setSelectedPath(firstPath);
                setSelectedMethod(firstMethod as HttpMethod);
            }
        }
    }, [spec, setSelectedServer]);

    const getEndpointGroups = useCallback((): EndpointGroup[] => {
        const groups = new Map<string, EndpointGroup>();

        Object.entries(spec.paths).forEach(([path, pathItem]) => {
            const methods: HttpMethod[] = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'trace'];

            methods.forEach(method => {
                const operation = pathItem[method];
                if (!operation) return;

                const tags = operation.tags || ['default'];

                tags.forEach(tag => {
                    if (!groups.has(tag)) {
                        const tagObject = spec.tags?.find(t => t.name === tag);
                        groups.set(tag, {
                            tag,
                            description: tagObject?.description,
                            endpoints: [],
                        });
                    }

                    groups.get(tag)!.endpoints.push({
                        path,
                        method,
                        operation,
                        summary: operation.summary,
                    });
                });
            });
        });

        return Array.from(groups.values()).sort((a, b) => {
            if (a.tag === 'default') return 1;
            if (b.tag === 'default') return -1;
            return a.tag.localeCompare(b.tag);
        });
    }, [spec]);

    const handleSelectEndpoint = (path: string, method: string) => {
        setSelectedPath(path);
        setSelectedMethod(method as HttpMethod);
    };

    useEffect(() => {
        if (selectedPath && selectedMethod) {
            const operation = spec.paths[selectedPath]?.[selectedMethod as HttpMethod];
            const summary = operation?.summary || `${selectedMethod.toUpperCase()} ${selectedPath}`;
            document.title = `${summary} - ${spec.info.title}`;
        } else {
            document.title = `${spec.info.title} - API Docs`;
        }
    }, [selectedPath, selectedMethod, spec]);

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated && authentication) {
        return (
            <ProtectionGate
                fields={authentication.fields || []}
                onAuthenticated={() => setIsAuthenticated(true)}
            />
        );
    }

    const groups = getEndpointGroups();
    const selectedEndpointId = selectedPath && selectedMethod
        ? `${selectedMethod}-${selectedPath}`
        : null;

    return (
        <SidebarProvider>
            <AppSidebar
                groups={groups}
                selectedEndpoint={selectedEndpointId}
                onSelectEndpoint={handleSelectEndpoint}
                servers={spec.servers}
                info={spec.info}
                securitySchemes={spec.components?.securitySchemes}
                enabletheme={allowedThemes ? allowedThemes.length > 1 : true}
                allowedThemes={allowedThemes}
                schemas={schemas}
                currentSchemaId={currentSchemaId}
                projectHash={projectHash}
                projectName={projectName}
            />

            <SidebarInset>
                <Header
                    info={spec.info}
                    groups={groups}
                    onSelectEndpoint={handleSelectEndpoint}
                    theme={theme}
                    allowedThemes={allowedThemes}
                    projectHash={projectHash || ''}
                    schemaHash={schemas?.find(s => s.id === currentSchemaId)?.hash || ''}
                />

                <main className="flex-1 overflow-y-auto">
                    <ContentArea
                        spec={spec}
                        selectedPath={selectedPath}
                        selectedMethod={selectedMethod as HttpMethod | null}
                    />
                </main>
                <Footer
                    info={spec.info}
                />
            </SidebarInset>
        </SidebarProvider>
    );
}

export default function OpenAPIViewerContent(props: OpenAPIViewerContentProps) {
    return (
        <OpenAPIProvider>
            <OpenAPIViewerContentInner {...props} />
        </OpenAPIProvider>
    );
}
