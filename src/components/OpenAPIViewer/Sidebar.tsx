import React from 'react';
import Image from 'next/image';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import MethodBadge from './MethodBadge';
import type { BrandingConfig, EndpointGroup, Server } from './types';
import { Button } from '../ui/button';

interface SidebarProps {
    branding?: BrandingConfig;
    groups: EndpointGroup[];
    selectedEndpoint: string | null;
    onSelectEndpoint: (path: string, method: string) => void;
    servers: Server[] | undefined;
    selectedServer: Server | null;
    onSelectServer: (server: Server) => void;
}

export default function Sidebar({
    branding,
    groups,
    selectedEndpoint,
    onSelectEndpoint,
    servers,
    selectedServer,
    onSelectServer,
}: SidebarProps) {
    const title = branding?.title || 'API Reference';
    const logo = branding?.logo;

    return (
        <aside className="w-80 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col h-screen">
            <div className="p-6 border-b border-gray-700">
                <a className="flex items-center space-x-2" href="/">
                    {logo && (
                        <div className="relative h-8 w-8 flex-shrink-0">
                            <Image
                                src={logo}
                                alt="Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    )}
                    <span className="font-bold text-lg">{title}</span>
                </a>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <Accordion
                    type="multiple"
                    defaultValue={groups.map((group) => group.tag)}
                    className="w-full"
                >
                    {groups.map((group) => (
                        <AccordionItem value={group.tag} key={group.tag}>
                            <AccordionTrigger className="text-sm font-medium hover:text-gray-300">
                                {group.tag}
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-col space-y-1">
                                    {group.endpoints.map((endpoint) => {
                                        const endpointId = `${endpoint.method}-${endpoint.path}`;
                                        const isActive = selectedEndpoint === endpointId;

                                        return (
                                            <Button
                                                key={endpointId}
                                                variant={isActive ? 'secondary' : 'ghost'}
                                                className="w-full justify-start h-auto py-2 text-white hover:bg-gray-700"
                                                onClick={() =>
                                                    onSelectEndpoint(
                                                        endpoint.path,
                                                        endpoint.method
                                                    )
                                                }
                                            >
                                                <div className="flex flex-col items-start">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <MethodBadge
                                                            method={endpoint.method}
                                                        />
                                                        <span className="text-xs font-mono">
                                                            {endpoint.path}
                                                        </span>
                                                    </div>
                                                    {endpoint.summary && (
                                                        <div className="text-xs text-gray-400 text-left line-clamp-2">
                                                            {endpoint.summary}
                                                        </div>
                                                    )}
                                                </div>
                                            </Button>
                                        );
                                    })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

            {servers && servers.length > 0 && (
                <div className="p-4 border-t border-gray-700">
                    <label className="text-xs text-gray-400 mb-2 block">Server</label>
                    <Select
                        value={selectedServer?.url}
                        onValueChange={(value) => {
                            const server = servers.find((s) => s.url === value);
                            if (server) {
                                onSelectServer(server);
                            }
                        }}
                    >
                        <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Select a server" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600 text-white">
                            {servers.map((server) => (
                                <SelectItem key={server.url} value={server.url}>
                                    {server.description || server.url}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </aside>
    );
}