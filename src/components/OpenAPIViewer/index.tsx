'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from './Sidebar';
import Header from './Header';
import ContentArea from './ContentArea';
import { fetchAndParseYML } from '@/lib/ymlParser';
import type { OpenAPIViewerProps, OpenAPISpec, EndpointGroup, HttpMethod } from './types';
import { OpenAPIProvider, useOpenAPI } from '@/context/OpenAIContext';
import { ProtectionGate } from './ProtectionGate';
import { checkAccess } from '@/app/actions/auth';

function OpenAPIViewerContent({ source, authentication }: OpenAPIViewerProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    const [spec, setSpec] = useState<OpenAPISpec | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
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
        async function loadSpec() {
            if (checkingAuth) return;

            if (authentication && !isAuthenticated) return;

            try {
                setLoading(true);
                setError(null);
                const parsedSpec = await fetchAndParseYML(source);
                setSpec(parsedSpec);

                if (parsedSpec.servers && parsedSpec.servers.length > 0) {
                    setSelectedServer(parsedSpec.servers[0]);
                }

                const firstPath = Object.keys(parsedSpec.paths)[0];
                if (firstPath) {
                    const pathItem = parsedSpec.paths[firstPath];
                    const firstMethod = Object.keys(pathItem).find(key =>
                        ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'trace'].includes(key)
                    );
                    if (firstMethod) {
                        setSelectedPath(firstPath);
                        setSelectedMethod(firstMethod as HttpMethod);
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load OpenAPI specification');
            } finally {
                setLoading(false);
            }
        }

        loadSpec();
    }, [source, setSelectedServer, checkingAuth, isAuthenticated, authentication]);

    const getEndpointGroups = (): EndpointGroup[] => {
        if (!spec) return [];

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
    };

    const handleSelectEndpoint = (path: string, method: string) => {
        setSelectedPath(path);
        setSelectedMethod(method as HttpMethod);
    };

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading API documentation...</p>
                </div>
            </div>
        );
    }

    if (error || !spec) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="max-w-md w-full bg-card border border-destructive/50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="w-8 h-8 text-destructive" />
                        <h2 className="text-xl font-bold text-destructive-foreground">Failed to Load API Specification</h2>
                    </div>
                    <p className="text-destructive-foreground mb-4">{error}</p>
                    <div className="bg-destructive/20 border border-destructive/30 rounded p-3">
                        <p className="text-sm text-destructive-foreground">
                            <strong>Source:</strong> {typeof source === 'string' ? source : 'Custom source'}
                        </p>
                    </div>
                </div>
            </div>
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
            />
            <SidebarInset>
                <Header
                    info={spec.info}
                    groups={groups}
                    onSelectEndpoint={handleSelectEndpoint}
                />
                <main className="flex-1 overflow-y-auto">
                    <ContentArea
                        spec={spec}
                        selectedPath={selectedPath}
                        selectedMethod={selectedMethod as HttpMethod | null}
                    />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}

export default function OpenAPIViewer(props: OpenAPIViewerProps) {
    return (
        <OpenAPIProvider>
            <OpenAPIViewerContent {...props} />
        </OpenAPIProvider>
    );
}