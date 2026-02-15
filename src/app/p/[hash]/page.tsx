import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default async function PublicProjectPage({
    params,
}: {
    params: Promise<{ hash: string }>;
}) {
    const { hash } = await params;
    const project = await prisma.project.findUnique({
        where: { hash } as { hash: string },
        include: {
            schemas: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        }
    });

    if (!project) {
        notFound();
    }

    if (project.schemas.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <ShieldAlert className="size-12 text-amber-500 mb-4" />
                <h1 className="text-2xl font-bold">No Schema Found</h1>
                <p className="text-muted-foreground mt-2">This project exists but has no associated API schema yet.</p>
            </div>
        );
    }

    redirect(`/p/${hash}/${project.schemas[0].hash}`);
}


