import { OpenAPISpec } from '@/components/OpenAPIViewer/types';
import yaml from 'js-yaml';

export async function fetchAndParseYML(source: string): Promise<OpenAPISpec> {
    try {
        let ymlContent: string;

        if (source.startsWith('http://') || source.startsWith('https://')) {
            const response = await fetch(source);

            if (!response.ok) {
                throw new Error(`Failed to fetch YML: ${response.status} ${response.statusText}`);
            }

            ymlContent = await response.text();
        } else {
            const response = await fetch(source);

            if (!response.ok) {
                throw new Error(`Failed to load local YML file: ${source}`);
            }

            ymlContent = await response.text();
        }

        const parsed = yaml.load(ymlContent) as OpenAPISpec;

        validateOpenAPISpec(parsed);

        return parsed;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`YML parsing error: ${error.message}`);
        }
        throw new Error('Unknown error occurred while parsing YML');
    }
}

function validateOpenAPISpec(spec: any): asserts spec is OpenAPISpec {
    if (!spec) {
        throw new Error('Empty or invalid OpenAPI specification');
    }

    if (!spec.openapi && !spec.swagger) {
        throw new Error('Missing openapi or swagger version field');
    }

    if (!spec.info) {
        throw new Error('Missing required "info" field');
    }

    if (!spec.info.title) {
        throw new Error('Missing required "info.title" field');
    }

    if (!spec.info.version) {
        throw new Error('Missing required "info.version" field');
    }

    if (!spec.paths) {
        throw new Error('Missing required "paths" field');
    }

    if (typeof spec.paths !== 'object' || Object.keys(spec.paths).length === 0) {
        throw new Error('Paths object is empty or invalid');
    }
}

export function resolveReference(spec: OpenAPISpec, ref: string): any {
    if (!ref.startsWith('#/')) {
        throw new Error(`Invalid reference format: ${ref}`);
    }

    const parts = ref.substring(2).split('/');
    let current: any = spec;

    for (const part of parts) {
        if (current === undefined || current === null) {
            throw new Error(`Cannot resolve reference: ${ref}`);
        }
        current = current[part];
    }

    if (current === undefined) {
        throw new Error(`Reference not found: ${ref}`);
    }

    return current;
}

export function isReference(obj: any): obj is { $ref: string } {
    return obj && typeof obj === 'object' && '$ref' in obj;
}

export function dereferenceSchema(spec: OpenAPISpec, schema: any, visited = new Set<string>()): any {
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

    const result: any = Array.isArray(schema) ? [] : {};

    for (const [key, value] of Object.entries(schema)) {
        if (Array.isArray(value)) {
            result[key] = value.map(item => dereferenceSchema(spec, item, new Set(visited)));
        } else if (typeof value === 'object' && value !== null) {
            result[key] = dereferenceSchema(spec, value, new Set(visited));
        } else {
            result[key] = value;
        }
    }

    return result;
}