import type { APIRequest, APIResponse, AuthCredentials } from '@/components/OpenAPIViewer/types';

export async function executeAPIRequest(
    request: APIRequest,
    auth?: AuthCredentials
): Promise<APIResponse> {
    const startTime = performance.now();

    try {
        const headers = { ...request.headers };

        if (auth) {
            if (auth.type === 'bearer') {
                headers['Authorization'] = `Bearer ${auth.value}`;
            } else if (auth.type === 'apiKey') {
                if (auth.in === 'header' && auth.name) {
                    headers[auth.name] = auth.value;
                }
            }
        }

        let url = request.url;

        if (auth?.type === 'apiKey' && auth.in === 'query' && auth.name) {
            const urlObj = new URL(url);
            urlObj.searchParams.set(auth.name, auth.value);
            url = urlObj.toString();
        }

        const fetchOptions: RequestInit = {
            method: request.method,
            headers,
            mode: 'cors',
        };

        if (request.body && request.method !== 'GET' && request.method !== 'HEAD') {
            fetchOptions.body = typeof request.body === 'string'
                ? request.body
                : JSON.stringify(request.body);

            if (!headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }
        }

        const response = await fetch(url, fetchOptions);
        const endTime = performance.now();

        let data: any;
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

        return {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
            data,
            time: Math.round(endTime - startTime),
            size,
        };
    } catch (error) {
        const endTime = performance.now();

        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            throw new Error('Network error: Unable to reach the server. This might be a CORS issue or the server is unreachable.');
        }

        if (error instanceof Error) {
            throw new Error(`Request failed: ${error.message}`);
        }

        throw new Error('Unknown error occurred while executing request');
    }
}

export function buildRequestURL(
    baseUrl: string,
    path: string,
    queryParams: Record<string, any>
): string {
    let url = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    url += path.startsWith('/') ? path : `/${path}`;

    const validParams = Object.entries(queryParams).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ''
    );

    if (validParams.length > 0) {
        const searchParams = new URLSearchParams();
        validParams.forEach(([key, value]) => {
            searchParams.append(key, String(value));
        });
        url += `?${searchParams.toString()}`;
    }

    return url;
}

export function replacePathParams(path: string, params: Record<string, any>): string {
    let result = path;

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            result = result.replace(`{${key}}`, encodeURIComponent(String(value)));
        }
    });

    return result;
}

export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function getStatusColor(status: number): string {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-blue-600';
    if (status >= 400 && status < 500) return 'text-orange-600';
    if (status >= 500) return 'text-red-600';
    return 'text-gray-600';
}

export function getStatusBgColor(status: number): string {
    if (status >= 200 && status < 300) return 'bg-green-50 border-green-200';
    if (status >= 300 && status < 400) return 'bg-blue-50 border-blue-200';
    if (status >= 400 && status < 500) return 'bg-orange-50 border-orange-200';
    if (status >= 500) return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
}