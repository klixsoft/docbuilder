import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    LayoutDashboard,
    FileCode,
    ExternalLink,
    Globe,
    Server,
    Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AddSchemaDialog } from "@/components/dashboard/projects/AddSchemaDialog";
import { TrafficGraph } from "@/components/dashboard/projects/TrafficGraph";
import yaml from 'js-yaml';
import { OpenAPISpec } from "@/components/OpenAPIViewer/types";
import { EditSchemaDialog } from "@/components/dashboard/projects/EditSchemaDialog";
import { DeleteSchemaDialog } from "@/components/dashboard/projects/DeleteSchemaDialog";
import { Schema as PrismaSchema } from "@prisma/client";

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }>; }) {
    const session = await getSession();

    if (!session.isLoggedIn) {
        redirect("/login");
    }

    const { id } = await params;
    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            schemas: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!project) {
        notFound();
    }

    let totalEndpoints = 0;
    const productionUrls = new Set<string>();
    const baseUrls = new Set<string>();

    project.schemas.forEach((schema: PrismaSchema) => {
        try {
            if (schema.content) {
                const parsed = yaml.load(schema.content) as OpenAPISpec;

                if (parsed.paths) {
                    totalEndpoints += Object.keys(parsed.paths).length;
                }

                if (parsed.servers && Array.isArray(parsed.servers)) {
                    parsed.servers.forEach((s) => {
                        if (s.url) productionUrls.add(s.url);
                    });
                }

                if ('host' in parsed && (parsed as { host?: string; schemes?: string[]; basePath?: string }).host) {
                    const legacy = parsed as { host?: string; schemes?: string[]; basePath?: string };
                    const protocol = legacy.schemes?.[0] || 'https';
                    const base = legacy.basePath || '';
                    baseUrls.add(`${protocol}://${legacy.host}${base}`);
                }
            }
        } catch (e) {
            console.error(`Failed to parse schema ${schema.id}:`, e);
        }
    });

    const analyticsData = [
        { date: 'Mon', value: 12 },
        { date: 'Tue', value: 18 },
        { date: 'Wed', value: 15 },
        { date: 'Thu', value: 25 },
        { date: 'Fri', value: 32 },
        { date: 'Sat', value: 45 },
        { date: 'Sun', value: 40 },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                    <p className="text-muted-foreground">{project.description || "No description provided."}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" asChild>
                        <a href={`/p/${project.hash}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="size-4 mr-2" />
                            View Docs
                        </a>
                    </Button>
                    <AddSchemaDialog projectId={project.id} projectName={project.name} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm border-border/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Aggregate APIs</CardTitle>
                        <Layers className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalEndpoints}</div>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-tighter">Total unique paths linked</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-border/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Traffic (7d)</CardTitle>
                        <LayoutDashboard className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">2,845</div>
                        <p className="text-[10px] text-green-600 mt-1 uppercase font-bold tracking-tighter">+12.5% from last week</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-border/40 md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Production URLs</CardTitle>
                        <Globe className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {productionUrls.size > 0 || baseUrls.size > 0 ? (
                                Array.from(new Set([...productionUrls, ...baseUrls])).map((url, i) => (
                                    <div key={i} className="flex items-center gap-2 px-3 py-1 rounded-lg bg-muted/50 border border-border/40 text-[11px] font-mono font-medium">
                                        <Server className="size-3 text-muted-foreground" />
                                        {url}
                                    </div>
                                ))
                            ) : (
                                <span className="text-sm text-muted-foreground italic">No servers identified in schemas.</span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <TrafficGraph data={analyticsData} />
                </div>
                <Card className="border-border/40 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Project Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Internal ID</span>
                            <span className="text-sm font-mono bg-muted px-2 py-1 rounded text-muted-foreground truncate">{project.id}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Public Hash</span>
                            <span className="text-sm font-mono bg-muted px-2 py-1 rounded text-muted-foreground">{project.hash}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Visibility</span>
                            <span className="text-sm">
                                {project.viewPassword ? (
                                    <span className="flex items-center gap-1.5 text-green-600 font-bold">
                                        Password Protected
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                                        Public Access
                                    </span>
                                )}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/40 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/40">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold">Schema Versions</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Manage multiple versions and sources of your API documentation.</p>
                        </div>
                        <AddSchemaDialog projectId={project.id} projectName={project.name} />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/10">
                                <TableHead className="w-[300px]">Version Name</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Last Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {project.schemas.length > 0 ? (
                                project.schemas.map((schema: PrismaSchema) => {
                                    const s = schema as unknown as {
                                        id: string;
                                        name: string;
                                        hash: string;
                                        url: string | null;
                                        updatedAt: Date;
                                        content: string | null;
                                    };
                                    return (
                                        <TableRow key={s.id} className="hover:bg-muted/10 transition-colors">
                                            <TableCell className="font-semibold">
                                                <div className="flex flex-col">
                                                    {s.name}
                                                    <span className="text-[10px] text-muted-foreground font-mono">{s.hash || s.id}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {s.url ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/40 w-fit">
                                                        <Globe className="size-3" />
                                                        Remote URL
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-xs text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full border border-purple-100 dark:border-purple-900/40 w-fit">
                                                        <FileCode className="size-3" />
                                                        Embedded
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(s.updatedAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" asChild title="View Public Docs">
                                                        <a href={`/p/${project.hash}/${s.hash || s.id}`} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="size-4" />
                                                        </a>
                                                    </Button>
                                                    <EditSchemaDialog schema={{
                                                        id: s.id,
                                                        name: s.name,
                                                        content: s.content,
                                                        url: s.url
                                                    }} />
                                                    <DeleteSchemaDialog schemaId={s.id} schemaName={s.name} />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (

                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                                        No schemas added yet. Use the button above to add one.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>

                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
