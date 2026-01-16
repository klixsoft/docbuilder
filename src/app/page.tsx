import type { Metadata } from 'next';
import { fetchSpecOnServer } from '@/lib/serverSpec';
import OpenAPIViewer from '@/components/OpenAPIViewer';
import { notFound } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
    if (!process.env.OPENAI_SCHEMA_FILE) {
        return notFound();
    }

    try {
        const spec = await fetchSpecOnServer(process.env.OPENAI_SCHEMA_FILE);
        return {
            title: spec.info.title,
            description: spec.info.description || `API documentation for ${spec.info.title}`,
            openGraph: {
                title: spec.info.title,
                description: spec.info.description || `API documentation for ${spec.info.title}`,
                type: 'website'
            },
            twitter: {
                card: 'summary_large_image',
                title: spec.info.title,
                description: spec.info.description || `API documentation for ${spec.info.title}`
            }
        };
    } catch (error) {
        return {
            title: 'API Documentation',
            description: 'API documentation'
        };
    }
}

export default function Home() {
    if (!process.env.OPENAI_SCHEMA_FILE) {
        return notFound();
    }

    return (
        <OpenAPIViewer
            source={process.env.OPENAI_SCHEMA_FILE}
            authentication={{
                fields: [
                    { type: 'password', label: 'Password', placeholder: 'Enter your password' }
                ]
            }}
        />
    );
}