import * as yaml from 'js-yaml';
import { readFile } from 'fs/promises';
import { join } from 'path';
import type { OpenAPISpec } from '@/components/OpenAPIViewer/types';

export async function fetchSpecOnServer(source: string): Promise<OpenAPISpec> {
    try {
        let content: string;

        if (source.startsWith('http://') || source.startsWith('https://')) {
            const response = await fetch(source, {
                next: { revalidate: 3600 }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch spec: ${response.statusText}`);
            }
            content = await response.text();
        } else {
            const filePath = join(process.cwd(), 'public', source.replace(/^\//, ''));
            content = await readFile(filePath, 'utf-8');
        }

        const parsed = yaml.load(content) as OpenAPISpec;

        if (!parsed || !parsed.info || !parsed.paths) {
            throw new Error('Invalid OpenAPI specification');
        }

        return parsed;
    } catch (error) {
        console.error('Error loading spec on server:', error);
        throw error;
    }
}
