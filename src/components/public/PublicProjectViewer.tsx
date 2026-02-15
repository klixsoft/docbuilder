import OpenAPIViewer from "@/components/OpenAPIViewer";
import { ShieldAlert, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cookies } from "next/headers";
import Link from "next/link";
import { OpenAPISpec, SchemaVersion } from "@/components/OpenAPIViewer/types";
import jsYaml from 'js-yaml';

interface PublicProjectViewerProps {
    project: {
        id: string;
        hash: string;
        name: string;
        viewPassword: string | null;
        themes: string[];
        schemas: SchemaVersion[];
    };
    currentSchema: SchemaVersion;
    providedPw?: string;
    theme?: string;
}

export default async function PublicProjectViewer({
    project,
    currentSchema,
    providedPw,
    theme
}: PublicProjectViewerProps) {

    if (project.viewPassword) {
        const cookieStore = await cookies();
        const authCookie = cookieStore.get(`auth_${project.hash}`)?.value;

        const isAuthorized = authCookie === project.viewPassword || providedPw === project.viewPassword;

        if (!isAuthorized) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-muted/40 px-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mx-auto size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <Lock className="size-6 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Protected Document</CardTitle>
                            <CardDescription>
                                This documentation is password protected. Please enter the password to view it.
                            </CardDescription>
                        </CardHeader>
                        <form action={async (formData: FormData) => {
                            'use server';
                            const pw = formData.get('password');
                            if (pw === project.viewPassword) {
                                (await cookies()).set(`auth_${project.hash}`, pw as string, { httpOnly: true, secure: true });
                            }
                        }}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        name="password"
                                        type="password"
                                        placeholder="Enter password"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <Button className="w-full" type="submit">
                                    Unlock Documentation
                                </Button>
                            </CardContent>
                        </form>
                    </Card>
                </div>
            );
        }
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
                <Link href={`/p/${project.hash}`} className="mt-4 text-sm text-primary hover:underline">Try again</Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
            <OpenAPIViewer
                spec={spec}
                company="Sunbi"
                theme={((theme) || project.themes[0] || 'system') as 'system' | 'light' | 'dark'}
                allowedThemes={project.themes}
                schemas={project.schemas}
                currentSchemaId={currentSchema.id}
                projectHash={project.hash}
                projectName={currentSchema.name}
            />
        </main>
    );
}
