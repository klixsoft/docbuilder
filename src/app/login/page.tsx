'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Logo } from '@/components/Logo';


export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            setIsLoading(false);

            if (!response.ok || result.error) {
                toast.error(result.error || 'Invalid email or password');
            } else {
                toast.success('Login successful!');
                router.push('/dashboard');
                router.refresh();
            }
        } catch (error) {
            setIsLoading(false);
            toast.error('Something went wrong');
        }
    }


    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40 px-4">
            <Card className="w-full max-w-md shadow-xl border-border/40">
                <CardHeader className="space-y-4 text-center">
                    <div className="flex justify-center mb-2">
                        <Logo size="lg" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your workspace
                        </CardDescription>
                    </div>
                </CardHeader>

                <form onSubmit={onSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
