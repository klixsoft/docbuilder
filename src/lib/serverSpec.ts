import * as yaml from 'js-yaml';
// import { readFile } from 'fs/promises'; // Removed for Cloudflare compatibility
// import { join } from 'path';
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
            // Cloudflare Workers: Use fetch for local assets.
            // We need a base URL. Fallback to NEXTAUTH_URL or assume localhost if not set (which might fail in prod if not set).
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
            const url = new URL(source.startsWith('/') ? source : `/${source}`, baseUrl).toString();

            const response = await fetch(url, {
                next: { revalidate: 3600 }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch local spec from ${url}: ${response.statusText}`);
            }
            content = await response.text();
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
