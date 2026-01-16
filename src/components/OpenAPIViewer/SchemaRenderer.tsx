import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { SchemaObject } from './types';

interface SchemaRendererProps {
    schema: SchemaObject;
    name?: string;
    level?: number;
    required?: boolean;
}

export default function SchemaRenderer({
    schema,
    name,
    level = 0,
    required = false
}: SchemaRendererProps) {
    const [isExpanded, setIsExpanded] = useState(level < 2);

    const hasProperties = schema.properties && Object.keys(schema.properties).length > 0;
    const hasItems = schema.items;
    const isExpandable = hasProperties || hasItems;

    const indent = level * 24;

    const renderType = () => {
        let typeText = schema.type || 'any';

        if (schema.format) {
            typeText += ` (${schema.format})`;
        }

        if (schema.enum) {
            typeText += ` enum`;
        }

        return (
            <span className="text-blue-600 font-mono text-sm">
                {typeText}
            </span>
        );
    };

    const renderConstraints = () => {
        const constraints: string[] = [];

        if (schema.minLength !== undefined) constraints.push(`min: ${schema.minLength}`);
        if (schema.maxLength !== undefined) constraints.push(`max: ${schema.maxLength}`);
        if (schema.minimum !== undefined) constraints.push(`min: ${schema.minimum}`);
        if (schema.maximum !== undefined) constraints.push(`max: ${schema.maximum}`);
        if (schema.pattern) constraints.push(`pattern: ${schema.pattern}`);
        if (schema.minItems !== undefined) constraints.push(`minItems: ${schema.minItems}`);
        if (schema.maxItems !== undefined) constraints.push(`maxItems: ${schema.maxItems}`);

        if (constraints.length === 0) return null;

        return (
            <span className="text-xs text-gray-500 ml-2">
                ({constraints.join(', ')})
            </span>
        );
    };

    return (
        <div>
            <div
                className="flex items-start gap-2 py-1.5 hover:bg-gray-50 rounded px-2 -mx-2"
                style={{ paddingLeft: `${indent + 8}px` }}
            >
                {isExpandable && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-1 text-gray-400 hover:text-gray-600"
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </button>
                )}

                {!isExpandable && <div className="w-4" />}

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        {name && (
                            <span className="font-mono text-sm font-medium text-gray-900">
                                {name}
                            </span>
                        )}

                        {required && (
                            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">
                                required
                            </span>
                        )}

                        {schema.deprecated && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">
                                deprecated
                            </span>
                        )}

                        {renderType()}
                        {renderConstraints()}
                    </div>

                    {schema.description && (
                        <p className="text-sm text-gray-600 mt-1">
                            {schema.description}
                        </p>
                    )}

                    {schema.default !== undefined && (
                        <div className="text-xs text-gray-500 mt-1">
                            Default: <code className="bg-gray-100 px-1 py-0.5 rounded">{JSON.stringify(schema.default)}</code>
                        </div>
                    )}

                    {schema.enum && (
                        <div className="text-xs text-gray-500 mt-1">
                            Enum: {schema.enum.map((v, i) => (
                                <code key={i} className="bg-gray-100 px-1 py-0.5 rounded mr-1">
                                    {JSON.stringify(v)}
                                </code>
                            ))}
                        </div>
                    )}

                    {schema.example !== undefined && (
                        <div className="text-xs text-gray-500 mt-1">
                            Example: <code className="bg-gray-100 px-1 py-0.5 rounded">{JSON.stringify(schema.example)}</code>
                        </div>
                    )}
                </div>
            </div>

            {isExpanded && hasProperties && (
                <div className="border-l-2 border-gray-200 ml-2">
                    {Object.entries(schema.properties!).map(([propName, propSchema]) => {
                        const isRequired = schema.required?.includes(propName) || false;
                        const resolvedSchema = '$ref' in propSchema ? {} : propSchema;

                        return (
                            <SchemaRenderer
                                key={propName}
                                name={propName}
                                schema={resolvedSchema as SchemaObject}
                                level={level + 1}
                                required={isRequired}
                            />
                        );
                    })}
                </div>
            )}

            {isExpanded && hasItems && schema.type === 'array' && schema.items && (
                <div className="border-l-2 border-gray-200 ml-2">
                    <SchemaRenderer
                        name="items"
                        schema={'$ref' in schema.items ? {} : schema.items as SchemaObject}
                        level={level + 1}
                    />
                </div>
            )}
        </div>
    );
}