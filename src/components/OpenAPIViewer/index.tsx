'use client';

import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';
import ContentArea from './ContentArea';
import { fetchAndParseYML } from '@/lib/ymlParser';
import type { OpenAPIViewerProps, OpenAPISpec, EndpointGroup, HttpMethod, Server } from './types';

export default function OpenAPIViewer({ source, branding }: OpenAPIViewerProps) {
    const [spec, setSpec] = useState<OpenAPISpec | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPath, setSelectedPath] = useState<string | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [selectedServer, setSelectedServer] = useState<Server | null>(null);

    useEffect(() => {
        async function loadSpec() {
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
    }, [source]);

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
                            <strong>Source:</strong> {source}
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
        <div className="min-h-screen bg-background text-foreground flex">
            <Sidebar
                branding={branding}
                groups={groups}
                selectedEndpoint={selectedEndpointId}
                onSelectEndpoint={handleSelectEndpoint}
                servers={spec.servers}
                selectedServer={selectedServer}
                onSelectServer={setSelectedServer}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header info={spec.info} />
                <main className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <ContentArea
                        spec={spec}
                        selectedPath={selectedPath}
                        selectedMethod={selectedMethod as HttpMethod | null}
                    />
                </main>
            </div>
        </div>
    );
}