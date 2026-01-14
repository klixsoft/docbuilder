import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getStatusColor, getStatusBgColor, formatBytes } from '@/lib/apiExecutor';
import type { APIResponse } from './types';

interface ResponseViewerProps {
    response: APIResponse;
}

export default function ResponseViewer({ response }: ResponseViewerProps) {
    const [copied, setCopied] = useState(false);
    const [showHeaders, setShowHeaders] = useState(false);

    const handleCopy = async () => {
        const text = typeof response.data === 'string'
            ? response.data
            : JSON.stringify(response.data, null, 2);

        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatResponseData = () => {
        if (typeof response.data === 'string') {
            try {
                const parsed = JSON.parse(response.data);
                return JSON.stringify(parsed, null, 2);
            } catch {
                return response.data;
            }
        }
        return JSON.stringify(response.data, null, 2);
    };

    const isJson = () => {
        if (typeof response.data === 'object') return true;
        if (typeof response.data === 'string') {
            try {
                JSON.parse(response.data);
                return true;
            } catch {
                return false;
            }
        }
        return false;
    };

    return (
        <div className="border rounded-lg overflow-hidden">
            <div className={`px-4 py-3 border-b ${getStatusBgColor(response.status)}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className={`text-2xl font-bold ${getStatusColor(response.status)}`}>
                            {response.status}
                        </span>
                        <span className="text-sm text-gray-600">
                            {response.statusText}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{response.time}ms</span>
                        <span>{formatBytes(response.size)}</span>
                    </div>
                </div>
            </div>

            <div className="border-b">
                <button
                    onClick={() => setShowHeaders(!showHeaders)}
                    className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <span className="text-sm font-medium text-gray-700">Response Headers</span>
                    {showHeaders ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                </button>

                {showHeaders && (
                    <div className="px-4 py-3 bg-gray-50 border-t">
                        <div className="space-y-1">
                            {Object.entries(response.headers).map(([key, value]) => (
                                <div key={key} className="flex gap-2 text-sm">
                                    <span className="font-mono text-gray-600 min-w-[200px]">{key}:</span>
                                    <span className="font-mono text-gray-900">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                Copy
                            </>
                        )}
                    </button>
                </div>

                {isJson() ? (
                    <SyntaxHighlighter
                        language="json"
                        style={vscDarkPlus}
                        customStyle={{
                            margin: 0,
                            borderRadius: 0,
                            padding: '1rem',
                            fontSize: '0.875rem',
                        }}
                    >
                        {formatResponseData()}
                    </SyntaxHighlighter>
                ) : (
                    <pre className="p-4 bg-gray-900 text-gray-100 overflow-x-auto text-sm">
                        {String(response.data)}
                    </pre>
                )}
            </div>
        </div>
    );
}