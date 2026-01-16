'use client';

import { ArrowLeft } from 'lucide-react';
import SchemaRenderer from '@/components/OpenAPIViewer/SchemaRenderer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { OpenAPISpec, SchemaObject } from '@/components/OpenAPIViewer/types';

interface SchemasViewProps {
    spec: OpenAPISpec;
}

export default function SchemasView({ spec }: SchemasViewProps) {
    const schemas = spec.components?.schemas || {};
    const schemaEntries = Object.entries(schemas);

    if (schemaEntries.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-14 items-center px-6">
                        <Link href="/">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to API Docs
                            </Button>
                        </Link>
                        <h1 className="ml-4 text-lg font-semibold">Schemas</h1>
                    </div>
                </header>
                <main className="container mx-auto px-6 py-8">
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No schemas defined in this API specification.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center px-6">
                    <Link href="/">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to API Docs
                        </Button>
                    </Link>
                    <h1 className="ml-4 text-lg font-semibold">{spec.info.title} - Schemas</h1>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 max-w-7xl">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">API Schemas</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Complete list of data models and schemas used in this API
                    </p>
                </div>

                <div className="space-y-6">
                    {schemaEntries.map(([name, schema]) => {
                        const schemaObj = '$ref' in schema ? null : schema as SchemaObject;
                        if (!schemaObj) return null;

                        return (
                            <div
                                key={name}
                                id={name}
                                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden scroll-mt-20"
                            >
                                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-mono">
                                        {name}
                                    </h3>
                                    {schemaObj.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                            {schemaObj.description}
                                        </p>
                                    )}
                                    {schemaObj.type && (
                                        <span className="inline-block mt-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded font-medium">
                                            {schemaObj.type}
                                        </span>
                                    )}
                                </div>
                                <div className="p-6">
                                    <SchemaRenderer schema={schemaObj} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
