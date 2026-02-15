import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PublicProjectViewer from "@/components/public/PublicProjectViewer";
import { ShieldAlert } from "lucide-react";
import { OpenAPISpec, SchemaVersion } from "@/components/OpenAPIViewer/types";
import jsYaml from 'js-yaml';

import { Metadata } from "next";

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

    // We don't necessarily need the password for metadata unless the title itself is secret, 
    // but usually public pages show titles.
    // However, if the project doesn't exist, we return default.

    const project = await getProjectData(hash);

    if (!project) {
        return {
            title: "Project Not Found",
        };
    }

    const currentSchema = project.schemas.find((s) => s.hash === schemaHash);

    if (!currentSchema) {
        return {
            title: "Schema Not Found",
        };
    }

    let title = currentSchema.name;
    let description = "API Documentation";

    if (currentSchema.content) {
        try {
            let parsed: OpenAPISpec | undefined;
            try {
                parsed = JSON.parse(currentSchema.content) as OpenAPISpec;
            } catch {
                try {
                    parsed = jsYaml.load(currentSchema.content) as OpenAPISpec;
                } catch {

                }
            }

            if (parsed && typeof parsed === 'object') {
                if (parsed.info?.description) {
                    description = parsed.info.description.slice(0, 160);
                }
            }
        } catch (e) {
            console.error("Failed to parse schema for metadata", e);
        }
    }

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            type: 'website',
        },
        twitter: {
            card: 'summary',
            title: title,
            description: description,
        }
    };
}

export default async function PublicVersionedProjectPage({
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
            </div>
        );
    }

    const mappedSchemas: SchemaVersion[] = project.schemas.map((s) => {
        let version: string | undefined;
        if (s.content) {
            try {
                const parsed = JSON.parse(s.content) as OpenAPISpec;
                version = parsed.info?.version;
            } catch {
                try {
                    const parsed = jsYaml.load(s.content) as OpenAPISpec;
                    version = parsed.info?.version;
                } catch {

                }
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
        <PublicProjectViewer
            project={{
                ...project,
                schemas: mappedSchemas
            }}
            currentSchema={{
                id: currentSchema.id,
                hash: currentSchema.hash,
                name: currentSchema.name,
                content: currentSchema.content,
                url: currentSchema.url,
                version: mappedSchemas.find(s => s.id === currentSchema.id)?.version,
                updatedAt: currentSchema.updatedAt,
                createdAt: currentSchema.createdAt
            }}
            providedPw={providedPw}
        />
    );
}
