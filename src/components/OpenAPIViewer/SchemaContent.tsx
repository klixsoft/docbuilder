import React from 'react';
import type { OpenAPISpec, SchemaObject } from './types';
import SchemaRenderer from './SchemaRenderer';
import { dereferenceSchema } from '@/lib/ymlParser';

interface SchemaContentProps {
    spec: OpenAPISpec;
    selectedSchemaName: string | null;
}

export default function SchemaContent({ spec, selectedSchemaName }: SchemaContentProps) {
    if (!selectedSchemaName) {
        return (
            <main className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <p>Select a schema to view details</p>
                </div>
            </main>
        );
    }

    const schemaEntry = spec.components?.schemas?.[selectedSchemaName];
    if (!schemaEntry) {
        return (
            <main className="flex-1 overflow-y-auto p-8">
                <div className="text-red-500">Schema not found: {selectedSchemaName}</div>
            </main>
        );
    }

    const schema = ('$ref' in schemaEntry
        ? dereferenceSchema(spec, schemaEntry)
        : schemaEntry) as SchemaObject;


    return (
        <div className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-black dark:to-black">
            <div className="border-b bg-white/80 dark:bg-black/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between border-gray-200 dark:border-neutral-800">
                <div className="px-6 py-6 w-full">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-mono">MODEL</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{selectedSchemaName}</h1>
                    {schema.description && (
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
                            {schema.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="bg-white dark:bg-neutral-950 rounded-lg border border-gray-200 dark:border-neutral-800 p-6">
                    <SchemaRenderer schema={schema} />
                </div>
            </div>
        </div>
    );
}
