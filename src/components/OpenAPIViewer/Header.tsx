import React, { useState } from 'react';
import { Search, Github, Book, Box } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '../ThemeToggle';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import type { InfoObject, EndpointGroup } from './types';
import { SidebarTrigger } from '../ui/sidebar';

import { usePathname } from 'next/navigation';

interface HeaderProps {
    info: InfoObject;
    groups: EndpointGroup[];
    onSelectEndpoint: (path: string, method: string) => void;
    theme: 'light' | 'dark' | 'system';
    allowedThemes?: string[];
    projectHash: string;
    schemaHash: string;
    schemas?: Record<string, import('./types').SchemaObject | import('./types').ReferenceObject>;
    onSelectSchema?: (name: string) => void;
    searchPlaceholder?: string;
}

export default function Header({ info, groups, onSelectEndpoint, theme, allowedThemes, projectHash, schemaHash, schemas, onSelectSchema, searchPlaceholder }: HeaderProps) {
    const [searchOpen, setSearchOpen] = useState(false);
    const pathname = usePathname();
    const isSchemaPage = pathname?.includes('/schema');

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setSearchOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    return (
        <>
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="flex h-14 items-center px-6 gap-4">
                    <div className="flex flex-1 items-center gap-2">
                        <SidebarTrigger />

                        <nav className="flex items-center gap-4 ml-2 mr-4">
                            <Link
                                href={`/p/${projectHash}/${schemaHash}`}
                                className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${!isSchemaPage ? 'text-primary' : 'text-muted-foreground'}`}
                            >
                                <Book className="h-4 w-4" />
                                API Reference
                            </Link>
                            <Link
                                href={`/p/${projectHash}/${schemaHash}/schema`}
                                className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${isSchemaPage ? 'text-primary' : 'text-muted-foreground'}`}
                            >
                                <Box className="h-4 w-4" />
                                Schemas
                            </Link>
                        </nav>

                        <Button
                            variant="outline"
                            className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-64 ml-2"
                            onClick={() => setSearchOpen(true)}
                        >
                            <Search className="mr-2 h-4 w-4" />
                            <span>{searchPlaceholder || "Search endpoints..."}</span>
                            <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </Button>
                    </div>


                    <nav className="flex items-center gap-2">
                        {info.contact?.url && (
                            <Button variant="ghost" size="icon" asChild>
                                <a href={info.contact.url} target="_blank" rel="noopener noreferrer">
                                    <Github className="h-5 w-5" />
                                    <span className="sr-only">GitHub</span>
                                </a>
                            </Button>
                        )}
                        <ThemeToggle allowedThemes={allowedThemes} />

                        <div className="hidden md:flex items-center ml-2 px-2 py-1 rounded-md bg-muted">
                            <span className="text-xs font-medium text-muted-foreground">
                                v{info.version}
                            </span>
                        </div>


                    </nav>
                </div>
            </header >

            <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
                <CommandInput placeholder={searchPlaceholder || "Search endpoints..."} />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    {schemas && onSelectSchema ? (
                        <CommandGroup heading="Schemas">
                            {Object.keys(schemas || {}).map((schemaName) => (
                                <CommandItem
                                    key={schemaName}
                                    value={schemaName}
                                    onSelect={() => {
                                        onSelectSchema(schemaName);
                                        setSearchOpen(false);
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <Book className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-mono text-sm">{schemaName}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ) : (
                        groups.map((group) => (
                            <CommandGroup key={group.tag} heading={group.tag.charAt(0).toUpperCase() + group.tag.slice(1)}>
                                {group.endpoints.map((endpoint) => {
                                    const endpointId = `${endpoint.method}-${endpoint.path}`;
                                    return (
                                        <CommandItem
                                            key={endpointId}
                                            value={`${endpoint.method} ${endpoint.path} ${endpoint.summary || ''}`}
                                            onSelect={() => {
                                                onSelectEndpoint(endpoint.path, endpoint.method);
                                                setSearchOpen(false);
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${endpoint.method === 'get' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                                                    endpoint.method === 'post' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                                        endpoint.method === 'put' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                                                            endpoint.method === 'delete' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                                                                'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                                                    }`}>
                                                    {endpoint.method.toUpperCase()}
                                                </span>
                                                <span className="font-mono text-sm">{endpoint.path}</span>
                                            </div>
                                            {endpoint.summary && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {endpoint.summary}
                                                </div>
                                            )}
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        ))
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}