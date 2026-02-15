import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, Users, ShieldCheck, Clock } from "lucide-react";
import { Project, User } from "@prisma/client";

export default async function DashboardPage() {
    const session = await getSession();
    const userRole = session.role;
    const userId = session.userId;

    const stats = [
        {
            title: "Total Projects",
            value: await prisma.project.count({
                where: userRole !== 'ADMIN' ? { userId } : {}
            }),
            icon: FolderKanban,
            color: "text-blue-500",
        },
    ];

    if (userRole === 'ADMIN') {
        stats.push({
            title: "Total Users",
            value: await prisma.user.count(),
            icon: Users,
            color: "text-green-500",
        });
    }

    const recentProjects = await prisma.project.findMany({
        where: userRole !== 'ADMIN' ? { userId } : {},
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: { user: true },
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome back! Here&apos;s an overview of your documentation projects.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`size-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentProjects.length > 0 ? (
                                recentProjects.map((project: Project & { user: User }) => (
                                    <div key={project.id} className="flex items-center">
                                        <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {project.name.charAt(0)}
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{project.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                By {project.user.name} • {new Date(project.updatedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="ml-auto flex items-center gap-2">
                                            {project.viewPassword && <ShieldCheck className="size-4 text-green-500" />}
                                            <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                                                {project.hash.substring(0, 8)}...
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No projects found yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-1">Documentation</p>
                            <a href="#" className="text-sm hover:underline text-primary">How to upload a schema</a>
                            <a href="#" className="text-sm hover:underline text-primary">Managing public links</a>
                            <a href="#" className="text-sm hover:underline text-primary">Adding password protection</a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
