import { fetchSpecOnServer } from '@/lib/serverSpec';
import OpenAPIViewerContent from './OpenAPIViewerContent';
import type { OpenAPIViewerProps } from './types';

export default async function OpenAPIViewer({ source, authentication }: OpenAPIViewerProps) {
    const spec = await fetchSpecOnServer(source);

    return (
        <OpenAPIViewerContent
            spec={spec}
            authentication={authentication}
        />
    );
}