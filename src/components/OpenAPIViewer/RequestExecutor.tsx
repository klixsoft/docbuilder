import React, { useState, useEffect } from 'react';
import { Play, Loader } from 'lucide-react';
import AuthenticationInput from './AuthenticationInput';
import ResponseViewer from './ResponseViewer';
import { executeAPIRequest, buildRequestURL, replacePathParams } from '@/lib/apiExecutor';
import type {
    OperationObject,
    ParameterObject,
    ServerObject,
    SecuritySchemeObject,
    AuthCredentials,
    APIResponse
} from './types';

interface RequestExecutorProps {
    path: string;
    method: string;
    operation: OperationObject;
    servers: ServerObject[];
    securitySchemes: Record<string, SecuritySchemeObject>;
}

export default function RequestExecutor({
    path,
    method,
    operation,
    servers,
    securitySchemes,
}: RequestExecutorProps) {
    const [paramValues, setParamValues] = useState<Record<string, unknown>>({});
    const [requestBody, setRequestBody] = useState<string>('{}');
    const [selectedServer, setSelectedServer] = useState(0);
    const [credentials, setCredentials] = useState<AuthCredentials | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [response, setResponse] = useState<APIResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const parameters = (operation.parameters || []) as ParameterObject[];
    const pathParams = parameters.filter(p => p.in === 'path');
    const queryParams = parameters.filter(p => p.in === 'query');
    const headerParams = parameters.filter(p => p.in === 'header');

    const hasRequestBody = !!operation.requestBody && '$ref' in operation.requestBody === false;
    const requiredSecurity = operation.security?.[0] ? Object.keys(operation.security[0]) : [];

    useEffect(() => {
        const initialValues: Record<string, unknown> = {};
        parameters.forEach(param => {
            if (param.schema && '$ref' in param.schema === false) {
                if (param.schema.default !== undefined) {
                    initialValues[param.name] = param.schema.default;
                } else if (param.example !== undefined) {
                    initialValues[param.name] = param.example;
                }
            }
        });
        setParamValues(initialValues);

        if (hasRequestBody && operation.requestBody && '$ref' in operation.requestBody === false) {
            const content = operation.requestBody.content['application/json'];
            if (content?.example) {
                setRequestBody(JSON.stringify(content.example, null, 2));
            } else if (content?.schema && '$ref' in content.schema === false && content.schema.example) {
                setRequestBody(JSON.stringify(content.schema.example, null, 2));
            }
        }
    }, [path, method]);

    const handleExecute = async () => {
        setIsExecuting(true);
        setError(null);
        setResponse(null);

        try {
            const baseUrl = servers[selectedServer]?.url || '';

            if (!baseUrl) {
                throw new Error('No server URL configured');
            }

            const pathParamValues: Record<string, unknown> = {};
            const queryParamValues: Record<string, unknown> = {};
            const headerValues: Record<string, string> = {};

            pathParams.forEach(param => {
                if (paramValues[param.name] !== undefined) {
                    pathParamValues[param.name] = paramValues[param.name];
                }
            });

            queryParams.forEach(param => {
                if (paramValues[param.name] !== undefined && paramValues[param.name] !== '') {
                    queryParamValues[param.name] = paramValues[param.name];
                }
            });

            headerParams.forEach(param => {
                if (paramValues[param.name] !== undefined && paramValues[param.name] !== '') {
                    headerValues[param.name] = String(paramValues[param.name]);
                }
            });

            const processedPath = replacePathParams(path, pathParamValues);
            const url = buildRequestURL(baseUrl, processedPath, queryParamValues);

            let body = undefined;
            if (hasRequestBody && method.toLowerCase() !== 'get') {
                try {
                    body = JSON.parse(requestBody);
                } catch {
                    throw new Error('Invalid JSON in request body');
                }
            }

            const apiResponse = await executeAPIRequest(
                {
                    url,
                    method: method.toUpperCase(),
                    headers: headerValues,
                    body,
                },
                credentials || undefined
            );

            setResponse(apiResponse);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsExecuting(false);
        }
    };

    const canExecute = servers.length > 0;

    if (!canExecute) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                    API execution is not available. No servers are defined in the OpenAPI specification.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-4">Try It Out</h3>

                {servers.length > 1 && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Server
                        </label>
                        <select
                            value={selectedServer}
                            onChange={(e) => setSelectedServer(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {servers.map((server, index) => (
                                <option key={index} value={index}>
                                    {server.url} {server.description && `- ${server.description}`}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {requiredSecurity.length > 0 && (
                    <div className="mb-4">
                        <AuthenticationInput
                            securitySchemes={securitySchemes}
                            requiredSecurity={requiredSecurity}
                            credentials={credentials}
                            onChange={setCredentials}
                        />
                    </div>
                )}

                {pathParams.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Path Parameters</h4>
                        <div className="space-y-3">
                            {pathParams.map((param) => (
                                <div key={param.name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {param.name}
                                        {param.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={(paramValues[param.name] as string | number) || ''}
                                        onChange={(e) => setParamValues(prev => ({ ...prev, [param.name]: e.target.value }))}
                                        placeholder={param.description || param.name}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {param.description && (
                                        <p className="text-xs text-gray-500 mt-1">{param.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {queryParams.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Query Parameters</h4>
                        <div className="space-y-3">
                            {queryParams.map((param) => (
                                <div key={param.name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {param.name}
                                        {param.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={(paramValues[param.name] as string | number) || ''}
                                        onChange={(e) => setParamValues(prev => ({ ...prev, [param.name]: e.target.value }))}
                                        placeholder={param.description || param.name}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {param.description && (
                                        <p className="text-xs text-gray-500 mt-1">{param.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {headerParams.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Headers</h4>
                        <div className="space-y-3">
                            {headerParams.map((param) => (
                                <div key={param.name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {param.name}
                                        {param.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={(paramValues[param.name] as string | number) || ''}
                                        onChange={(e) => setParamValues(prev => ({ ...prev, [param.name]: e.target.value }))}
                                        placeholder={param.description || param.name}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {param.description && (
                                        <p className="text-xs text-gray-500 mt-1">{param.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {hasRequestBody && (
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Request Body</h4>
                        <textarea
                            value={requestBody}
                            onChange={(e) => setRequestBody(e.target.value)}
                            rows={10}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter JSON request body"
                        />
                    </div>
                )}

                <button
                    onClick={handleExecute}
                    disabled={isExecuting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isExecuting ? (
                        <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Executing...
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4" />
                            Execute
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-2">Error</h4>
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {response && (
                <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Response</h3>
                    <ResponseViewer response={response} />
                </div>
            )}
        </div>
    );
}