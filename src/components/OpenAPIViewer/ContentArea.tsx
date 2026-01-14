import React from 'react';
import APIEndpoint from './APIEndpoint';
import type { OpenAPISpec, HttpMethod } from './types';

interface ContentAreaProps {
    spec: OpenAPISpec;
    selectedPath: string | null;
    selectedMethod: string | null;
}

export default function ContentArea({ spec, selectedPath, selectedMethod }: ContentAreaProps) {
    if (!selectedPath || !selectedMethod) {
        return (
            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl">
                    <div className="text-center py-16">
                        <div className="mb-6">
                            <svg
                                className="w-24 h-24 mx-auto text-gray-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {spec.info.title}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {spec.info.description || 'Select an endpoint from the sidebar to view its documentation'}
                        </p>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left max-w-2xl mx-auto">
                            <h3 className="font-semibold text-blue-900 mb-2">Getting Started</h3>
                            <ul className="space-y-2 text-sm text-blue-800">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5">•</span>
                                    <span>Select an endpoint from the sidebar to view detailed documentation</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5">•</span>
                                    <span>Use the &quot;Try It Out&quot; feature to test API calls directly</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5">•</span>
                                    <span>View request/response schemas and examples</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5">•</span>
                                    <span>Authenticate using API keys or bearer tokens where required</span>
                                </li>
                            </ul>
                        </div>

                        {spec.info.contact && (
                            <div className="mt-8 text-sm text-gray-600">
                                {spec.info.contact.name && <div>Contact: {spec.info.contact.name}</div>}
                                {spec.info.contact.email && (
                                    <div>
                                        Email: <a href={`mailto:${spec.info.contact.email}`} className="text-blue-600 hover:underline">
                                            {spec.info.contact.email}
                                        </a>
                                    </div>
                                )}
                                {spec.info.contact.url && (
                                    <div>
                                        <a href={spec.info.contact.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            Documentation Website
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        );
    }

    const pathItem = spec.paths[selectedPath];
    if (!pathItem) {
        return (
            <main className="flex-1 overflow-y-auto p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">Endpoint not found: {selectedPath}</p>
                </div>
            </main>
        );
    }

    const operation = pathItem[selectedMethod as HttpMethod];
    if (!operation) {
        return (
            <main className="flex-1 overflow-y-auto p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">
                        Method {selectedMethod.toUpperCase()} not found for path: {selectedPath}
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto p-8">
            <APIEndpoint
                path={selectedPath}
                method={selectedMethod as HttpMethod}
                operation={operation}
                servers={spec.servers || []}
                spec={spec}
            />
        </main>
    );
}