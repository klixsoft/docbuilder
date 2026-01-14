import React from 'react';
import { AlertCircle } from 'lucide-react';
import MethodBadge from './MethodBadge';
import SchemaRenderer from './SchemaRenderer';
import RequestExecutor from './RequestExecutor';
import { dereferenceSchema } from '@/lib/ymlParser';
import type {
    OperationObject,
    ParameterObject,
    ServerObject,
    OpenAPISpec,
    HttpMethod
} from './types';

interface APIEndpointProps {
    path: string;
    method: HttpMethod;
    operation: OperationObject;
    servers: ServerObject[];
    spec: OpenAPISpec;
}

export default function APIEndpoint({
    path,
    method,
    operation,
    servers,
    spec,
}: APIEndpointProps) {
    const parameters = (operation.parameters || []) as ParameterObject[];
    const hasRequestBody = !!operation.requestBody && '$ref' in operation.requestBody === false;

    const securitySchemes = spec.components?.securitySchemes || {};

    const renderParameters = (paramType: string) => {
        const filtered = parameters.filter(p => p.in === paramType);

        if (filtered.length === 0) return null;

        return (
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 capitalize">
                    {paramType} Parameters
                </h3>
                <div className="border rounded-lg overflow-hidden">
                    {filtered.map((param, index) => {
                        const schema = param.schema && '$ref' in param.schema === false
                            ? param.schema
                            : undefined;

                        return (
                            <div
                                key={param.name}
                                className={`p-4 ${index !== filtered.length - 1 ? 'border-b' : ''}`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-mono font-semibold text-gray-900">
                                        {param.name}
                                    </span>
                                    {param.required && (
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">
                                            required
                                        </span>
                                    )}
                                    {param.deprecated && (
                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-medium">
                                            deprecated
                                        </span>
                                    )}
                                    {schema && (
                                        <span className="text-sm text-blue-600 font-mono">
                                            {schema.type}
                                            {schema.format && ` (${schema.format})`}
                                        </span>
                                    )}
                                </div>

                                {param.description && (
                                    <p className="text-sm text-gray-600 mb-2">{param.description}</p>
                                )}

                                {schema && schema.enum && (
                                    <div className="mt-2">
                                        <span className="text-xs font-medium text-gray-700">Possible values:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {schema.enum.map((value, i) => (
                                                <code key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                    {JSON.stringify(value)}
                                                </code>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {schema && schema.default !== undefined && (
                                    <div className="mt-2 text-xs text-gray-600">
                                        Default: <code className="bg-gray-100 px-1 py-0.5 rounded">{JSON.stringify(schema.default)}</code>
                                    </div>
                                )}

                                {param.example !== undefined && (
                                    <div className="mt-2 text-xs text-gray-600">
                                        Example: <code className="bg-gray-100 px-1 py-0.5 rounded">{JSON.stringify(param.example)}</code>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderRequestBody = () => {
        if (!hasRequestBody || !operation.requestBody) return null;

        const requestBody = '$ref' in operation.requestBody ? null : operation.requestBody;
        if (!requestBody) return null;

        const jsonContent = requestBody.content['application/json'];
        if (!jsonContent || !jsonContent.schema) return null;

        const schema = '$ref' in jsonContent.schema
            ? dereferenceSchema(spec, jsonContent.schema)
            : jsonContent.schema;

        return (
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Request Body</h3>
                {requestBody.description && (
                    <p className="text-sm text-gray-600 mb-3">{requestBody.description}</p>
                )}
                {requestBody.required && (
                    <span className="inline-block text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium mb-3">
                        required
                    </span>
                )}
                <div className="border rounded-lg p-4 bg-gray-50">
                    <SchemaRenderer schema={schema} />
                </div>
            </div>
        );
    };

    const renderResponses = () => {
        const responses = operation.responses;
        if (!responses) return null;

        return (
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Responses</h3>
                <div className="space-y-4">
                    {Object.entries(responses).map(([statusCode, response]) => {
                        if ('$ref' in response) return null;

                        const jsonContent = response.content?.['application/json'];
                        const schema = jsonContent?.schema
                            ? ('$ref' in jsonContent.schema
                                ? dereferenceSchema(spec, jsonContent.schema)
                                : jsonContent.schema)
                            : null;

                        return (
                            <div key={statusCode} className="border rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-3 border-b">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-bold text-gray-900">{statusCode}</span>
                                        <span className="text-sm text-gray-600">{response.description}</span>
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
            </div>
        );
    };

    return (
        <div className="max-w-5xl">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <MethodBadge method={method} size="lg" />
                    <code className="text-lg font-mono text-gray-900">{path}</code>
                </div>

                {operation.summary && (
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{operation.summary}</h2>
                )}

                {operation.description && (
                    <p className="text-gray-600">{operation.description}</p>
                )}

                {operation.deprecated && (
                    <div className="mt-3 flex items-center gap-2 text-orange-700 bg-orange-50 border border-orange-200 px-3 py-2 rounded-lg">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">This endpoint is deprecated</span>
                    </div>
                )}

                {operation.operationId && (
                    <div className="mt-3 text-sm text-gray-500">
                        Operation ID: <code className="bg-gray-100 px-2 py-1 rounded">{operation.operationId}</code>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {renderParameters('path')}
                {renderParameters('query')}
                {renderParameters('header')}
                {renderParameters('cookie')}
                {renderRequestBody()}
                {renderResponses()}

                <div className="border-t pt-6">
                    <RequestExecutor
                        path={path}
                        method={method}
                        operation={operation}
                        servers={servers}
                        securitySchemes={securitySchemes}
                    />
                </div>
            </div>
        </div>
    );
}