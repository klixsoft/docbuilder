'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { customAlphabet } from 'nanoid';
import { z } from 'zod';

const alphabet = 'abcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 10);

const generateSchemaHash = () => {
    const a = customAlphabet(alphabet, 3);
    return `${a()}-${a()}-${a()}`;
};

interface UserWithMetadata {
    id: string;
    email: string;
    projectsLimit: number;
}

interface ProjectWithMetadata {
    id: string;
    name: string;
    description: string | null;
    viewPassword: string | null;
    hash: string;
    themes: string[];
    userId: string;
}

interface SchemaWithRelations {
    id: string;
    hash: string;
    project: {
        id: string;
        hash: string;
        userId: string;
    };
}

const projectSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    viewPassword: z.string().optional(),
});

export async function updateProject(formData: FormData) {
    const session = await getSession();
    if (!session.isLoggedIn) return { error: 'Unauthorized' };

    const projectId = formData.get('projectId') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const viewPassword = formData.get('viewPassword') as string;
    const themes = formData.getAll('themes') as string[];

    if (!projectId || !name) {
        return { error: 'Invalid fields' };
    }

    try {
        const userId = session.userId as string;
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { userId: true, hash: true }
        });

        if (!project) return { error: 'Project not found' };
        if (session.role !== 'ADMIN' && project.userId !== userId) {
            return { error: 'Unauthorized' };
        }

        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                name,
                description,
                viewPassword: viewPassword || null,
                themes: themes.length > 0 ? themes : ['system', 'light', 'dark'],
            }
        }) as unknown as ProjectWithMetadata;



        revalidatePath(`/dashboard/projects`);
        revalidatePath(`/dashboard/projects/${projectId}`);
        revalidatePath(`/p/${project.hash}`);

        return { success: true, project: updatedProject };
    } catch (error) {
        console.error('Update project error:', error);
        return { error: 'Something went wrong while updating the project' };
    }
}

export async function createProject(formData: FormData) {

    const session = await getSession();
    if (!session.isLoggedIn) return { error: 'Unauthorized' };

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const viewPassword = formData.get('viewPassword') as string;

    const validatedFields = projectSchema.safeParse({
        name,
        description,
        viewPassword: viewPassword || undefined,
    });

    if (!validatedFields.success) {
        return { error: 'Invalid fields' };
    }

    try {
        const userId = session.userId as string;

        const user = await prisma.user.findUnique({
            where: { id: userId },
        }) as unknown as UserWithMetadata;

        if (!user) return { error: 'User not found' };

        const currentProjectCount = await prisma.project.count({
            where: { userId }
        });

        const projectsLimit = user.projectsLimit;

        if (currentProjectCount >= projectsLimit) {
            return { error: `Project limit reached (${projectsLimit}). Please contact admin.` };
        }

        const themes = formData.getAll('themes') as string[];

        const project = await prisma.project.create({
            data: {
                name,
                description,
                viewPassword: viewPassword || null,
                themes: themes.length > 0 ? themes : ['system', 'light', 'dark'],
                hash: nanoid(),
                userId,
            }
        }) as unknown as ProjectWithMetadata;




        return { success: true, project };
    } catch (error) {
        console.error('Create project error:', error);
        return { error: 'Something went wrong' };
    }
}

export async function deleteProject(projectId: string) {
    const session = await getSession();
    if (!session.isLoggedIn) return { error: 'Unauthorized' };

    const userId = session.userId;
    const userRole = session.role;

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) return { error: 'Project not found' };
        if (project.userId !== userId && userRole !== 'ADMIN') {
            return { error: 'Unauthorized' };
        }

        await prisma.schema.deleteMany({
            where: { projectId }
        });

        await prisma.project.delete({
            where: { id: projectId },
        });

        return { success: true };
    } catch (error) {
        console.error('Delete project error:', error);
        return { error: 'Something went wrong' };
    }
}

export async function addSchema(formData: FormData) {
    const session = await getSession();

    if (!session.isLoggedIn) {
        return { error: 'Unauthorized' };
    }

    const projectId = formData.get('projectId') as string;
    const name = formData.get('name') as string;
    const schemaSource = formData.get('schemaSource') as 'URL' | 'CONTENT';
    const schemaUrl = formData.get('schemaUrl') as string;
    let schemaContent = formData.get('schemaContent') as string;

    if (!projectId || !name) {
        return { error: 'Missing required fields' };
    }

    try {
        if (schemaSource === 'URL' && schemaUrl) {
            try {
                const response = await fetch(schemaUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch from URL: ${response.statusText}`);
                }
                schemaContent = await response.text();
            } catch (fetchError) {
                const message = fetchError instanceof Error ? fetchError.message : 'Unknown error';
                return { error: `Failed to fetch schema: ${message}` };
            }
        }

        if (!schemaContent) {
            return { error: 'Schema content is empty' };
        }

        const schema = await prisma.schema.create({
            data: {
                name,
                hash: generateSchemaHash(),
                content: schemaContent,
                url: schemaSource === 'URL' ? schemaUrl : null,
                projectId,
            },
            include: {
                project: {
                    select: { id: true, hash: true }
                }
            }
        }) as unknown as SchemaWithRelations;



        revalidatePath(`/dashboard/projects/${projectId}`);
        revalidatePath(`/p/${schema.project.hash}`);
        return { success: true, schema };
    } catch (error) {
        console.error('Add schema error:', error);
        return { error: 'Something went wrong while adding the schema' };
    }
}

export async function updateSchema(formData: FormData) {
    const session = await getSession();
    if (!session.isLoggedIn) return { error: 'Unauthorized' };

    const schemaId = formData.get('schemaId') as string;
    const name = formData.get('name') as string;
    const content = formData.get('content') as string;

    if (!schemaId || !name) return { error: 'Missing required fields' };

    try {
        const schema = await prisma.schema.findUnique({
            where: { id: schemaId },
            include: { project: true }
        }) as unknown as SchemaWithRelations;

        if (!schema) return { error: 'Schema not found' };
        if (session.role !== 'ADMIN' && schema.project.userId !== session.userId) {
            return { error: 'Unauthorized' };
        }

        const updatedSchema = await prisma.schema.update({
            where: { id: schemaId },
            data: { name, content },
            include: { project: { select: { hash: true, id: true } } }
        }) as unknown as SchemaWithRelations;

        revalidatePath(`/dashboard/projects/${updatedSchema.project.id}`);
        revalidatePath(`/p/${updatedSchema.project.hash}`);
        revalidatePath(`/p/${updatedSchema.project.hash}/${schema.hash}`);

        return { success: true, schema: updatedSchema };
    } catch (error) {
        console.error('Update schema error:', error);
        return { error: 'Something went wrong' };
    }
}

export async function deleteSchema(schemaId: string) {
    const session = await getSession();
    if (!session.isLoggedIn) return { error: 'Unauthorized' };

    try {
        const schema = await prisma.schema.findUnique({
            where: { id: schemaId },
            include: { project: true }
        }) as unknown as SchemaWithRelations;

        if (!schema) return { error: 'Schema not found' };
        if (session.role !== 'ADMIN' && schema.project.userId !== session.userId) {
            return { error: 'Unauthorized' };
        }

        await prisma.schema.delete({
            where: { id: schemaId }
        });

        revalidatePath(`/dashboard/projects/${schema.project.id}`);
        revalidatePath(`/p/${schema.project.hash}`);

        return { success: true };
    } catch (error) {
        console.error('Delete schema error:', error);
        return { error: 'Something went wrong' };
    }
}

