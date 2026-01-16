import type { Metadata } from 'next';
import { fetchSpecOnServer } from '@/lib/serverSpec';
import SchemasView from '@/components/SchemasView';

export async function generateMetadata(): Promise<Metadata> {
    try {
        const spec = await fetchSpecOnServer('/api.yaml');
        return {
            title: `${spec.info.title} - Schemas`,
            description: `Complete list of data models and schemas used in ${spec.info.title}`,
            openGraph: {
                title: `${spec.info.title} - Schemas`,
                description: `Complete list of data models and schemas used in ${spec.info.title}`,
                type: 'website'
            }
        };
    } catch (error) {
        return {
            title: 'API Schemas',
            description: 'API data models and schemas'
        };
    }
}

export default async function SchemasPage() {
    const spec = await fetchSpecOnServer('/api.yaml');

    return <SchemasView spec={spec} />;
}
