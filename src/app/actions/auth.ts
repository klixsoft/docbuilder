'use server';

import { cookies } from 'next/headers';
import crypto from 'crypto';

const SECRET_KEY = process.env.AUTH_SECRET_KEY || 'your-secret-key-change-in-production';

function generateSignature(value: string): string {
    return crypto
        .createHmac('sha256', SECRET_KEY)
        .update(value)
        .digest('hex');
}

function createSignedValue(value: string): string {
    const signature = generateSignature(value);
    return `${value}.${signature}`;
}

function verifySignedValue(signedValue: string): string | null {
    const [value, signature] = signedValue.split('.');
    if (!value || !signature) return null;

    const expectedSignature = generateSignature(value);

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return value;
    }

    return null;
}

export async function validateAccess(submittedValues: string[]) {
    const envString = process.env.APP_PROTECTION_VALUES || "";
    const correctValues = envString.split(',').map(v => v.trim());

    const isValid = correctValues.length === submittedValues.length &&
        correctValues.every((val, index) => val === submittedValues[index]);

    if (isValid) {
        const timestamp = Date.now().toString();
        const signedValue = createSignedValue(timestamp);

        (await cookies()).set('app_access_granted', signedValue, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        return { success: true };
    }

    return { success: false, message: 'Invalid credentials provided.' };
}

export async function checkAccess(): Promise<boolean> {
    try {
        const cookieStore = await cookies();
        const accessCookie = cookieStore.get('app_access_granted');

        if (!accessCookie?.value) return false;

        const timestamp = verifySignedValue(accessCookie.value);

        if (!timestamp) return false;

        const cookieAge = Date.now() - parseInt(timestamp);
        const maxAge = 60 * 60 * 24 * 7 * 1000;

        return cookieAge < maxAge;
    } catch (err) {
        console.error('Error checking access:', err);
        return false;
    }
}

export async function clearAccess() {
    (await cookies()).delete('app_access_granted');
    return { success: true };
}