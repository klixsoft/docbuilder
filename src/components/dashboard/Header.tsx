'use client';

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "../ThemeToggle";

interface DashboardHeaderProps {
    user: {
        name?: string | null;
        email?: string | null;
        role: 'ADMIN' | 'USER';
    };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Welcome back,</span>
                    <span className="text-sm font-semibold">{user.name || user.email}</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />
            </div>
        </header>
    );
}
