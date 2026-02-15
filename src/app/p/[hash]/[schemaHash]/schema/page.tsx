import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { OpenAPISpec, SchemaVersion } from "@/components/OpenAPIViewer/types";
import jsYaml from 'js-yaml';
import { Metadata } from 'next';
import SchemaViewer from "@/components/OpenAPIViewer/SchemaViewer";

async function getProjectData(hash: string) {
    return await prisma.project.findUnique({
        where: { hash },
        include: {
            schemas: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });
}

export async function generateMetadata({
    params,
    searchParams,
}: {
    params: Promise<{ hash: string; schemaHash: string }>;
    searchParams: Promise<{ pw?: string; s?: string }>;
}): Promise<Metadata> {
    const { hash, schemaHash } = await params;
    const project = await getProjectData(hash);

    if (!project) return { title: "Project Not Found" };
    const currentSchema = project.schemas.find((s) => s.hash === schemaHash);
    if (!currentSchema) return { title: "Schema Not Found" };

    return {
        title: `${currentSchema.name} - Schemas`,
        description: `Data models and schemas for ${project.name}`,
    };
}

export default async function PublicSchemaPage({
    params,
    searchParams,
}: {
    params: Promise<{ hash: string; schemaHash: string }>;
    searchParams: Promise<{ pw?: string; s?: string }>;
}) {
    const { hash, schemaHash } = await params;
    const { pw: providedPw } = await searchParams;

    const project = await getProjectData(hash);

    if (!project) {
        notFound();
    }

    const currentSchema = project.schemas.find((s) => s.hash === schemaHash);

    if (!currentSchema) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <ShieldAlert className="size-12 text-destructive mb-4" />
                <h1 className="text-2xl font-bold">Schema Not Found</h1>
                <p className="text-muted-foreground mt-2">The requested API schema version could not be found.</p>
                <div className="mt-6">
                    <a href={`/p/${project.hash}`} className="text-primary hover:underline font-medium">
                        Back to API Reference
                    </a>
                </div>
            </div>
        );
    }

    let spec: OpenAPISpec | null = null;
    if (currentSchema.url) {
        try {
            const res = await fetch(currentSchema.url);
            if (res.ok) {
                const text = await res.text();
                try {
                    spec = jsYaml.load(text) as OpenAPISpec;
                } catch {
                    try {
                        spec = JSON.parse(text) as OpenAPISpec;
                    } catch {
                        console.error('Failed to parse as JSON or YAML');
                    }
                }
            }
        } catch (e) {
            console.error('Error fetching schema from URL:', e);
        }
    } else if (currentSchema.content) {
        try {
            spec = jsYaml.load(currentSchema.content) as OpenAPISpec;
        } catch {
            try {
                spec = JSON.parse(currentSchema.content as string) as OpenAPISpec;
            } catch (e) {
                console.error('Error parsing schema content:', e);
            }
        }
    }

    if (!spec) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <ShieldAlert className="size-12 text-destructive mb-4" />
                <h1 className="text-2xl font-bold">Failed to Load Schema</h1>
                <p className="text-muted-foreground mt-2">The API schema could not be retrieved or parsed.</p>
                <div className="mt-6">
                    <a href={`/p/${project.hash}`} className="text-primary hover:underline font-medium">
                        Back to API Reference
                    </a>
                </div>
            </div>
        );
    }

    const mappedSchemas: SchemaVersion[] = project.schemas.map((s) => {
        let version: string | undefined;
        if (s.content) {
            try {
                const parsed = JSON.parse(s.content);
                version = parsed.info?.version;
            } catch {
                try {
                    const parsed = jsYaml.load(s.content) as OpenAPISpec;
                    version = parsed.info?.version;
                } catch { }
            }
        }
        return {
            id: s.id,
            hash: s.hash,
            name: s.name,
            content: s.content,
            url: s.url,
            version,
            updatedAt: s.updatedAt,
            createdAt: s.createdAt
        };
    });

    return (
        <SchemaViewer
            spec={spec}
            company="Sunbi"
            theme={project.themes[0] || 'system'}
            allowedThemes={project.themes}
            schemas={mappedSchemas}
            currentSchemaId={currentSchema.id} // Keep ID for TeamSwitcher internal logic if needed
            currentSchemaHash={currentSchema.hash} // Pass Hash for Header
            projectHash={project.hash}
            projectName={project.name}
            viewPassword={project.viewPassword}
            providedPw={providedPw}
        />
    );
}
