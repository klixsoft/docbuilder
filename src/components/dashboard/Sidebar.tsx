'use client';

import * as React from "react";
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    Settings,
    FileCode,
    Sparkles,
    Command,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { TeamSwitcher } from "@/components/dashboard/TeamSwitcher";
import { NavUser } from "@/components/dashboard/NavUser";

interface DashboardSidebarProps {
    user: {
        name?: string | null;
        email?: string | null;
        role: 'ADMIN' | 'USER';
        avatar?: string;
    };
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
    const pathname = usePathname();

    const mainNav = [
        {
            title: "Dashboard",
            icon: LayoutDashboard,
            href: "/dashboard",
        },
        {
            title: "Projects",
            icon: FolderKanban,
            href: "/dashboard/projects",
        },
    ];


    const adminNav = [
        {
            title: "User Management",
            icon: Users,
            href: "/dashboard/users",
        },
        {
            title: "System Settings",
            icon: Settings,
            href: "/dashboard/settings",
        },
    ];

    // Mock teams data for the switcher
    const teams = [
        {
            name: "KlixSoft Docs",
            logo: Command,
            plan: "Enterprise",
        },
        {
            name: "Internal APIs",
            logo: Sparkles,
            plan: "Professional",
        }
    ];

    return (
        <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 mb-8 pb-0">
                    <Logo size="md" />
                </div>
            </SidebarHeader>


            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="uppercase tracking-widest font-bold text-[10px] text-muted-foreground/60">Platform</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainNav.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.href}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="size-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {user.role === 'ADMIN' && (
                    <>
                        <SidebarSeparator />
                        <SidebarGroup>
                            <SidebarGroupLabel className="uppercase tracking-widest font-bold text-[10px] text-muted-foreground/60">Admin Console</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {adminNav.map((item) => (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={pathname === item.href}
                                                tooltip={item.title}
                                            >
                                                <Link href={item.href}>
                                                    <item.icon className="size-4" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>

        </Sidebar>
    );
}
