import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import MethodBadge from './MethodBadge';
import SchemaRenderer from './SchemaRenderer';
import { executeAPIRequest, buildRequestURL, replacePathParams } from '@/lib/apiExecutor';
import type {
    OperationObject,
    ParameterObject,
    ServerObject,
    AuthCredentials,
    APIResponse,
    HttpMethod,
    SchemaObject,
    OpenAPISpec
} from './types';

import { dereferenceSchema } from '@/lib/ymlParser';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const CodeExecution = dynamic(() => import('./CodeExecution'), {
    loading: () => <div className="p-4 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>,
    ssr: false
});

interface APIEndpointProps {
    path: string;
    method: HttpMethod;
    summary?: string;
    onClick?: () => void;
    operation: OperationObject;
    servers: ServerObject[];
    spec: OpenAPISpec;
}


export default function APIEndpoint({ path, method, operation, servers, spec }: APIEndpointProps) {
    const [paramValues, setParamValues] = useState<Record<string, unknown>>({});
    const [requestBody, setRequestBody] = useState<string>('{}');
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
            const baseUrl = servers[0]?.url || '';

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

            let body: unknown = undefined;
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

    const renderRequestBody = () => {
        if (!hasRequestBody || !operation.requestBody) return null;

        const requestBodyObj = '$ref' in operation.requestBody ? null : operation.requestBody;
        if (!requestBodyObj) return null;

        const jsonContent = requestBodyObj.content['application/json'];
        if (!jsonContent || !jsonContent.schema) return null;

        const schema = ('$ref' in jsonContent.schema
            ? dereferenceSchema(spec, jsonContent.schema)
            : jsonContent.schema) as SchemaObject;

        return (
            <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-green-500 dark:bg-green-400 rounded-full"></div>
                    Request Body
                </h2>
                <div className="bg-white dark:bg-neutral-950 rounded-lg border border-gray-200 dark:border-neutral-800 p-4">
                    {requestBodyObj.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{requestBodyObj.description}</p>
                    )}
                    {requestBodyObj.required && (
                        <span className="inline-block text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded font-medium mb-3">
                            required
                        </span>
                    )}
                    <SchemaRenderer schema={schema} />
                </div>
            </section>
        );
    };

    const renderResponses = () => {
        const responses = operation.responses;
        if (!responses) return null;

        return (
            <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-purple-500 dark:bg-purple-400 rounded-full"></div>
                    Responses
                </h2>
                <div className="space-y-3">
                    {Object.entries(responses).map(([statusCode, resp]) => {
                        if ('$ref' in resp) return null;

                        const jsonContent = resp.content?.['application/json'];
                        const schema = jsonContent?.schema
                            ? (('$ref' in jsonContent.schema
                                ? dereferenceSchema(spec, jsonContent.schema)
                                : jsonContent.schema) as SchemaObject)
                            : null;

                        return (
                            <div key={statusCode} className="bg-white dark:bg-neutral-950 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
                                <div className="bg-gray-50 dark:bg-neutral-900 px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
                                    <div className="flex items-center gap-3">
                                        <span className={`font-mono font-bold ${statusCode.startsWith('2')
                                            ? 'text-green-600 dark:text-green-400'
                                            : statusCode.startsWith('4') || statusCode.startsWith('5')
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {statusCode}
                                        </span>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{resp.description}</span>
                                    </div>
                                </div>
                                {schema && (
                                    <div className="p-4">
                                        <SchemaRenderer schema={schema} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
        );
    };

    const renderParameters = (paramType: string) => {
        const filtered = parameters.filter(p => p.in === paramType);
        if (filtered.length === 0) return null;

        const copyParams = (text: string) => {
            try {
                navigator.clipboard.writeText(text);
                toast(<div><strong>{text}</strong> copied to clipboard</div>);
            } catch {

            }
        }

        return (
            <div className="bg-white dark:bg-neutral-950 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
                <div className="bg-gray-50 dark:bg-neutral-900 px-4 py-2 border-b border-gray-200 dark:border-neutral-800">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-neutral-300 capitalize">{paramType} Parameters</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-neutral-800">
                    {filtered.map((param) => {
                        const schema = param.schema && '$ref' in param.schema === false ? param.schema : undefined;

                        return (
                            <div key={param.name} className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">{param.name}</span>
                                    {param.required && (
                                        <span className="text-[10px] bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-semibold">REQUIRED</span>
                                    )}
                                    {param.deprecated && (
                                        <span className="text-[10px] bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded font-semibold">DEPRECATED</span>
                                    )}
                                    {schema && (
                                        <span className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                                            {schema.type}
                                            {schema.format && ` (${schema.format})`}
                                        </span>
                                    )}
                                </div>

                                {param.description && <p className="text-sm text-gray-600 dark:text-gray-400">{param.description}</p>}

                                {schema && schema.enum && (
                                    <div className="mt-2">
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Possible values:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {schema.enum.map((value, i) => (
                                                <code key={i} onClick={() => copyParams(value)} className="text-xs cursor-pointer bg-gray-100 dark:bg-neutral-900 text-gray-800 dark:text-neutral-200 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors border border-transparent dark:border-neutral-800">
                                                    {value}
                                                </code>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {schema && schema.default !== undefined && (
                                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                        Default: <code className="bg-gray-100 dark:bg-neutral-900 text-gray-800 dark:text-neutral-200 px-1.5 py-0.5 rounded border border-transparent dark:border-neutral-800">{JSON.stringify(schema.default)}</code>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-black dark:to-black">
            <div className="border-b bg-white/80 dark:bg-black/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between border-gray-200 dark:border-neutral-800">
                <div className="px-6 py-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                            <MethodBadge method={method} />
                            <code className="text-lg font-mono text-gray-800 dark:text-neutral-200 bg-gray-100 dark:bg-neutral-900 px-3 py-1 rounded-md border border-gray-200 dark:border-neutral-800">
                                {path}
                            </code>
                        </div>
                    </div>

                    {operation.summary && (
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{operation.summary}</h1>
                    )}

                    {operation.description && (
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{operation.description}</p>
                    )}

                    {operation.deprecated && (
                        <div className="mt-3 flex items-center gap-2 text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 px-3 py-2 rounded-lg">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-medium">This endpoint is deprecated</span>
                        </div>
                    )}

                    {operation.operationId && (
                        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                            Operation ID: <code className="bg-gray-100 dark:bg-neutral-900 text-gray-800 dark:text-neutral-200 px-2 py-1 rounded border border-transparent dark:border-neutral-800">{operation.operationId}</code>
                        </div>
                    )}
                </div>

                <CodeExecution
                    servers={servers}
                    method={method}
                    path={path}
                    paramValues={paramValues}
                    setParamValues={setParamValues}
                    requestBody={requestBody}
                    setRequestBody={setRequestBody}
                    credentials={credentials}
                    setCredentials={setCredentials}
                    hasRequestBody={hasRequestBody}
                    handleExecute={handleExecute}
                    isExecuting={isExecuting}
                    response={response}
                    error={error}
                    requiredSecurity={requiredSecurity}
                    parameters={parameters}
                />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="space-y-8">
                    {(pathParams.length > 0 || queryParams.length > 0 || headerParams.length > 0) && (
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <div className="w-1 h-5 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                                Parameters
                            </h2>
                            <div className="space-y-3">
                                {renderParameters('path')}
                                {renderParameters('query')}
                                {renderParameters('header')}
                            </div>
                        </section>
                    )}

                    {renderRequestBody()}
                    {renderResponses()}
                </div>
            </div>
        </div>
    );
}