import { NextRequest, NextResponse } from 'next/server';

interface ProxyRequestBody {
    url: string;
    method: string;
    headers: Record<string, string>;
    requestBody?: unknown;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as ProxyRequestBody;
        const { url, method, headers, requestBody } = body;

        if (!url || !method) {
            return NextResponse.json(
                { error: 'Missing required fields: url and method' },
                { status: 400 }
            );
        }

        try {
            new URL(url);
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        const startTime = Date.now();

        const fetchOptions: RequestInit = {
            method: method.toUpperCase(),
            headers: {
                ...headers,
            },
        };

        if (requestBody && method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD') {
            fetchOptions.body = typeof requestBody === 'string'
                ? requestBody
                : JSON.stringify(requestBody);
        }

        const response = await fetch(url, fetchOptions);
        const endTime = Date.now();

        let data: unknown;
        const contentType = response.headers.get('content-type');

        try {
            if (contentType?.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }
        } catch {
            data = null;
        }

        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
        });

        const responseText = typeof data === 'string' ? data : JSON.stringify(data);
        const size = new Blob([responseText]).size;

        return NextResponse.json({
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
            data,
            time: endTime - startTime,
            size,
        });

    } catch (error) {
        console.error('Proxy error:', error);

        if (error instanceof TypeError && error.message.includes('fetch')) {
            return NextResponse.json(
                { error: 'Network error: Unable to reach the server' },
                { status: 502 }
            );
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred' },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
