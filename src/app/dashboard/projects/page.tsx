import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Project } from "@prisma/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CreateProjectDialog } from "@/components/dashboard/projects/CreateProjectDialog";
import { ShieldCheck, ShieldAlert, ChevronRight } from "lucide-react";
import { PublicLink } from "@/components/dashboard/projects/PublicLink";
import { ProjectActions } from "@/components/dashboard/projects/ProjectActions";
import Link from "next/link";

export default async function ProjectsPage() {
    const session = await getSession();

    if (!session.isLoggedIn) {
        redirect("/login");
    }

    const userId = session.userId;
    const userRole = session.role;

    const projects = await prisma.project.findMany({
        where: userRole !== 'ADMIN' ? { userId } : {},
        orderBy: { updatedAt: 'desc' },
        include: {
            user: {
                select: { name: true, email: true }
            },
            _count: {
                select: { schemas: true }
            }
        }
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your API documentation projects and access their detailed analytics.
                    </p>
                </div>
                <CreateProjectDialog />
            </div>

            <div className="rounded-xl border border-border/40 shadow-sm overflow-hidden bg-card">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead className="px-6 py-4">Project Name</TableHead>
                            <TableHead>Access</TableHead>
                            <TableHead>Public Link</TableHead>
                            {userRole === 'ADMIN' && <TableHead>Owner</TableHead>}
                            <TableHead>Last Activity</TableHead>
                            <TableHead className="text-right px-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.length > 0 ? (
                            projects.map((project: Project & { user: { name: string | null; email: string }; _count: { schemas: number } }) => (
                                <TableRow key={project.id} className="group hover:bg-muted/10 transition-colors">
                                    <TableCell className="px-6 py-4">
                                        <Link href={`/dashboard/projects/${project.id}`} className="flex flex-col group/link">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-foreground group-hover/link:text-primary transition-colors">
                                                    {project.name}
                                                </span>
                                                <ChevronRight className="size-3 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-all -translate-x-2 group-hover/link:translate-x-0" />
                                            </div>
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest mt-0.5">
                                                {project._count.schemas} schema{project._count.schemas !== 1 ? 's' : ''} linked
                                            </span>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {project.viewPassword ? (
                                            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 w-fit dark:bg-green-950/20 dark:border-green-900/40">
                                                <ShieldCheck className="size-3" />
                                                Protected
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 w-fit dark:bg-amber-950/20 dark:border-amber-900/40">
                                                <ShieldAlert className="size-3" />
                                                Public
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <PublicLink hash={project.hash} />
                                    </TableCell>
                                    {userRole === 'ADMIN' && (
                                        <TableCell>
                                            <span className="text-xs font-medium">{project.user.name || project.user.email}</span>
                                        </TableCell>
                                    )}
                                    <TableCell className="text-muted-foreground text-xs font-semibold">
                                        {new Date(project.updatedAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right px-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <ProjectActions project={project} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={userRole === 'ADMIN' ? 6 : 5} className="text-center h-48 text-muted-foreground italic">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                                            <ShieldAlert className="size-6 text-muted-foreground/40" />
                                        </div>
                                        <span>No projects found. Create your first one to get started!</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
