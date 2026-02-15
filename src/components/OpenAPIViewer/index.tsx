import { fetchSpecOnServer } from '@/lib/serverSpec';
import OpenAPIViewerContent from './OpenAPIViewerContent';
import type { OpenAPIViewerProps, OpenAPISpec } from './types';

export default async function OpenAPIViewer(props: OpenAPIViewerProps) {
    const { source, spec: providedSpec, authentication, company, theme, allowedThemes, schemas, currentSchemaId, projectHash, projectName } = props;

    const spec = providedSpec || (source ? await fetchSpecOnServer(source) : null);

    if (!spec) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">No API specification provided or found.</p>
            </div>
        );
    }

    return (
        <OpenAPIViewerContent
            spec={spec as OpenAPISpec}
            authentication={authentication}
            company={company}
            theme={theme}
            allowedThemes={allowedThemes}
            schemas={schemas}
            currentSchemaId={currentSchemaId}
            projectHash={projectHash}
            projectName={projectName}
        />
    );
}