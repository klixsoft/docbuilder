"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ThemeToggleProps {
    className?: string;
    allowedThemes?: string[];
}

export function ThemeToggle({ className, allowedThemes }: ThemeToggleProps) {
    const { theme: currentTheme, setTheme } = useTheme();

    const allThemes = [
        { label: 'Light', value: 'light', icon: Sun },
        { label: 'Dark', value: 'dark', icon: Moon },
        { label: 'System', value: 'system', icon: Monitor },
    ];

    const filteredThemes = allowedThemes
        ? allThemes.filter(t => allowedThemes.includes(t.value))
        : allThemes;

    if (filteredThemes.length <= 1) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("h-9 w-9 p-0", className)}>
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {filteredThemes.map((theme) => (
                    <DropdownMenuItem
                        key={theme.value}
                        onClick={() => setTheme(theme.value)}
                        className={cn("gap-2", currentTheme === theme.value && "bg-accent")}
                    >
                        <theme.icon className="h-4 w-4" />
                        <span>{theme.label}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
