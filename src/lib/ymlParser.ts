import { OpenAPISpec } from '@/components/OpenAPIViewer/types';

export async function fetchAndParseYML(source: string): Promise<OpenAPISpec> {
    try {
        const apiUrl = `/api/spec?source=${encodeURIComponent(source)}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch spec: ${response.statusText}`);
        }

        const parsed = await response.json() as OpenAPISpec;

        validateOpenAPISpec(parsed);

        return parsed;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Spec loading error: ${error.message}`);
        }
        throw new Error('Unknown error occurred while loading specification');
    }
}

function validateOpenAPISpec(spec: unknown): asserts spec is OpenAPISpec {
    const specObj = spec as Record<string, unknown>;

    if (!spec) {
        throw new Error('Empty or invalid OpenAPI specification');
    }

    if (!specObj.openapi && !specObj.swagger) {
        throw new Error('Missing openapi or swagger version field');
    }

    if (!specObj.info) {
        throw new Error('Missing required "info" field');
    }

    const info = specObj.info as Record<string, unknown>;
    if (!info.title) {
        throw new Error('Missing required "info.title" field');
    }

    if (!info.version) {
        throw new Error('Missing required "info.version" field');
    }

    if (!specObj.paths) {
        throw new Error('Missing required "paths" field');
    }

    if (typeof specObj.paths !== 'object' || Object.keys(specObj.paths as object).length === 0) {
        throw new Error('Paths object is empty or invalid');
    }
}

export function resolveReference(spec: OpenAPISpec, ref: string): unknown {
    if (!ref.startsWith('#/')) {
        throw new Error(`Invalid reference format: ${ref}`);
    }

    const parts = ref.substring(2).split('/');
    let current: unknown = spec;

    for (const part of parts) {
        if (current === undefined || current === null) {
            throw new Error(`Cannot resolve reference: ${ref}`);
        }
        current = (current as Record<string, unknown>)[part];
    }

    if (current === undefined) {
        throw new Error(`Reference not found: ${ref}`);
    }

    return current;
}

export function isReference(obj: unknown): obj is { $ref: string } {
    return obj !== null && typeof obj === 'object' && '$ref' in obj;
}

export function dereferenceSchema(spec: OpenAPISpec, schema: unknown, visited = new Set<string>()): unknown {
    if (!schema) return schema;

    if (isReference(schema)) {
        const ref = schema.$ref;

        if (visited.has(ref)) {
            return { type: 'object', description: 'Circular reference' };
        }

        visited.add(ref);
        const resolved = resolveReference(spec, ref);
        return dereferenceSchema(spec, resolved, visited);
    }

    if (typeof schema !== 'object') {
        return schema;
    }

    const result: Record<string, unknown> | unknown[] = Array.isArray(schema) ? [] : {};

    for (const [key, value] of Object.entries(schema)) {
        if (Array.isArray(value)) {
            (result as Record<string, unknown>)[key] = value.map(item => dereferenceSchema(spec, item, new Set(visited)));
        } else if (typeof value === 'object' && value !== null) {
            (result as Record<string, unknown>)[key] = dereferenceSchema(spec, value, new Set(visited));
        } else {
            (result as Record<string, unknown>)[key] = value;
        }
    }

    return result;
}