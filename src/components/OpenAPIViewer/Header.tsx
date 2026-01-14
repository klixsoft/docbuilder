import React from 'react';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '../ThemeToggle';
import type { InfoObject } from './types';
import { Button } from '../ui/button';
import { Github } from 'lucide-react';

interface HeaderProps {
    info: InfoObject;
}

export default function Header({ info }: HeaderProps) {
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="md:w-64"
                        />
                    </div>
                    <nav className="flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                        >
                            <a href="https://github.com" target="_blank" aria-label="GitHub">
                                <Github className="h-5 w-5" />
                            </a>
                        </Button>
                        <ThemeToggle />
                        <span className="text-sm text-muted-foreground ml-4">
                            v{info.version}
                        </span>
                    </nav>
                </div>
            </div>
        </header>
    );
}