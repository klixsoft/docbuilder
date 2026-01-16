import React, { useState } from 'react';
import { ChevronsUpDown, Settings } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from 'next-themes';
import type { InfoObject, SecuritySchemeObject, Server } from './types';
import { useOpenAPI } from '@/context/OpenAIContext';
import { cn } from '@/lib/utils';

interface TeamSwitcherProps {
    info: InfoObject;
    servers: Server[] | undefined;
    securitySchemes?: Record<string, SecuritySchemeObject>;
    enabletheme: boolean;
}

export default function TeamSwitcher({ info, servers, securitySchemes, enabletheme }: TeamSwitcherProps) {
    const { theme, setTheme } = useTheme();
    const { selectedServer, setSelectedServer, securityConfig, updateSecurityValue } = useOpenAPI();
    const [settingsOpen, setSettingsOpen] = useState(false);

    const firstLetter = info.title?.charAt(0).toUpperCase() || 'A';

    const handleServerChange = (serverUrl: string) => {
        const server = servers?.find((s) => s.url === serverUrl);
        if (server) {
            setSelectedServer(server);
        }
    };

    const renderSecurityInput = (schemeName: string, scheme: SecuritySchemeObject) => {
        const value = securityConfig[schemeName] || '';

        switch (scheme.type) {
            case 'http':
                if (scheme.scheme === 'bearer') {
                    return (
                        <div key={schemeName} className="space-y-2">
                            <Label htmlFor={schemeName}>
                                Bearer Token
                                {scheme.bearerFormat && (
                                    <span className="text-xs text-muted-foreground ml-1">
                                        ({scheme.bearerFormat})
                                    </span>
                                )}
                            </Label>
                            {scheme.description && (
                                <p className="text-xs text-muted-foreground">{scheme.description}</p>
                            )}
                            <Input
                                id={schemeName}
                                type="password"
                                placeholder="Enter bearer token"
                                value={value}
                                onChange={(e) => updateSecurityValue(schemeName, e.target.value)}
                            />
                        </div>
                    );
                } else if (scheme.scheme === 'basic') {
                    return (
                        <div key={schemeName} className="space-y-2">
                            <Label htmlFor={schemeName}>Basic Auth</Label>
                            {scheme.description && (
                                <p className="text-xs text-muted-foreground">{scheme.description}</p>
                            )}
                            <Input
                                id={schemeName}
                                type="password"
                                placeholder="username:password"
                                value={value}
                                onChange={(e) => updateSecurityValue(schemeName, e.target.value)}
                            />
                        </div>
                    );
                }
                break;

            case 'apiKey':
                return (
                    <div key={schemeName} className="space-y-2">
                        <Label htmlFor={schemeName}>
                            {scheme.name || 'API Key'}
                            {scheme.in && (
                                <span className="text-xs text-muted-foreground ml-1">
                                    (in {scheme.in})
                                </span>
                            )}
                        </Label>
                        {scheme.description && (
                            <p className="text-xs text-muted-foreground">{scheme.description}</p>
                        )}
                        <Input
                            id={schemeName}
                            type="password"
                            placeholder={`Enter ${scheme.name || 'API key'}`}
                            value={value}
                            onChange={(e) => updateSecurityValue(schemeName, e.target.value)}
                        />
                    </div>
                );

            case 'oauth2':
                return (
                    <div key={schemeName} className="space-y-2">
                        <Label htmlFor={schemeName}>OAuth2 Token</Label>
                        {scheme.description && (
                            <p className="text-xs text-muted-foreground">{scheme.description}</p>
                        )}
                        <Input
                            id={schemeName}
                            type="password"
                            placeholder="Enter OAuth2 access token"
                            value={value}
                            onChange={(e) => updateSecurityValue(schemeName, e.target.value)}
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <span className="text-sm font-semibold">{firstLetter}</span>
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{info.title}</span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        v{info.version}
                                    </span>
                                </div>
                                <ChevronsUpDown className="ml-auto" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                            align="start"
                            side="bottom"
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                                API Information
                            </DropdownMenuLabel>
                            <DropdownMenuItem className="gap-2 p-2" disabled>
                                <div className="flex size-6 items-center justify-center rounded-sm border bg-background">
                                    <span className="text-xs font-semibold">{firstLetter}</span>
                                </div>
                                <div className="font-medium text-muted-foreground">{info.title}</div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="gap-2 p-2"
                                onSelect={(e) => {
                                    e.preventDefault();
                                    setSettingsOpen(true);
                                }}
                            >
                                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                    <Settings className="size-4" />
                                </div>
                                <div className="font-medium">Settings</div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>

            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>API Settings</DialogTitle>
                        <DialogDescription>
                            Configure server, authentication, and preferences
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="server" className="w-full">
                        <TabsList className={cn(
                            "grid w-full grid-cols-3",
                            !enabletheme && "grid-cols-2"
                        )}>
                            <TabsTrigger value="server">Server</TabsTrigger>
                            <TabsTrigger value="auth">Authentication</TabsTrigger>
                            {enabletheme && <TabsTrigger value="theme">Theme</TabsTrigger>}
                        </TabsList>

                        <TabsContent value="server" className="space-y-4 mt-4">
                            {servers && servers.length > 0 ? (
                                <div className="space-y-2">
                                    <Label htmlFor="server">Select Server</Label>
                                    <Select
                                        value={selectedServer?.url}
                                        onValueChange={handleServerChange}
                                    >
                                        <SelectTrigger id="server" className="w-full !h-14">
                                            <SelectValue placeholder="Select a server" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {servers.map((server) => (
                                                <SelectItem key={server.url} value={server.url} className="p-2">
                                                    <div className="text-left">
                                                        <div className="font-medium">
                                                            {server.description || 'Default Server'}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {server.url}
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    No servers defined in the API specification
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="auth" className="space-y-4 mt-4">
                            {securitySchemes && Object.keys(securitySchemes).length > 0 ? (
                                <>
                                    <div className="text-sm text-muted-foreground mb-4">
                                        Configure authentication credentials for API requests
                                    </div>
                                    {Object.entries(securitySchemes).map(([name, scheme]) =>
                                        renderSecurityInput(name, scheme)
                                    )}
                                </>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    No authentication schemes defined in the API specification
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="theme" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="theme">Appearance</Label>
                                <Select value={theme} onValueChange={setTheme}>
                                    <SelectTrigger id="theme" className="w-full">
                                        <SelectValue placeholder="Select theme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Light</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                        <SelectItem value="system">System</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Choose how the documentation should appear
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </>
    );
}