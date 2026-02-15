'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getSession } from "@/lib/session";
import { cookies } from "next/headers";

const userSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['ADMIN', 'USER']),
    projectsLimit: z.number().min(1).max(100),
});

export async function checkAccess(hash?: string) {
    const session = await getSession();
    if (session.isLoggedIn) return true;

    if (hash) {
        const project = await prisma.project.findUnique({
            where: { hash },
            select: { viewPassword: true }
        });

        if (!project?.viewPassword) return true;

        const cookieStore = await cookies();
        const authCookie = cookieStore.get(`auth_${hash}`)?.value;
        return authCookie === project.viewPassword;
    }

    return true;
}

export async function validateAccess(values: string[], hash?: string) {
    const userInput = values[0];

    if (hash) {
        const project = await prisma.project.findUnique({
            where: { hash },
            select: { viewPassword: true }
        });

        if (project?.viewPassword === userInput) {
            const cookieStore = await cookies();
            cookieStore.set(`auth_${hash}`, userInput, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7
            });
            return { success: true };
        }
    }

    return { success: false };
}


export async function createUser(formData: FormData) {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as 'ADMIN' | 'USER';
    const projectsLimitStr = formData.get('projectsLimit') as string;
    const projectsLimit = parseInt(projectsLimitStr) || 3;

    const validatedFields = userSchema.safeParse({
        name,
        email,
        password,
        role,
        projectsLimit,
    });

    if (!validatedFields.success) {
        return { error: 'Invalid fields' };
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: 'Email already exists' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                projectsLimit,
            } as unknown as { name: string | null; email: string; password: string; role: 'ADMIN' | 'USER'; projectsLimit: number },
        });




        return { success: true };
    } catch (error) {
        console.error('Create user error:', error);
        return { error: 'Something went wrong' };
    }
}