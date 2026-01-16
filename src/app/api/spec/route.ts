import { NextRequest, NextResponse } from 'next/server';
import * as yaml from 'js-yaml';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const source = searchParams.get('source');

        if (!source) {
            return NextResponse.json(
                { error: 'Missing source parameter' },
                { status: 400 }
            );
        }

        let content: string;

        if (source.startsWith('http://') || source.startsWith('https://')) {
            const response = await fetch(source);
            if (!response.ok) {
                throw new Error(`Failed to fetch spec: ${response.statusText}`);
            }
            content = await response.text();
        } else {
            const filePath = join(process.cwd(), 'public', source.replace(/^\//, ''));
            content = await readFile(filePath, 'utf-8');
        }

        const parsed = yaml.load(content);

        return NextResponse.json(parsed, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        console.error('Error loading spec:', error);

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to load specification' },
            { status: 500 }
        );
    }
}
