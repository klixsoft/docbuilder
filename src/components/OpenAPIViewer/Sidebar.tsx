import React, { useEffect } from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
} from '@/components/ui/sidebar';
import TeamSwitcher from './TeamSwitcher';
import MethodBadge from './MethodBadge';
import type { EndpointGroup, Server, InfoObject, ReferenceObject, SecuritySchemeObject } from './types';

interface AppSidebarProps {
    groups: EndpointGroup[];
    selectedEndpoint: string | null;
    onSelectEndpoint: (path: string, method: string) => void;
    servers: Server[] | undefined;
    info: InfoObject;
    securitySchemes?: Record<string, SecuritySchemeObject>;
    enabletheme: boolean;
    allowedThemes?: string[];
    schemas?: import('./types').SchemaVersion[];
    currentSchemaId?: string;
    projectHash?: string;
    projectName?: string;
}

export default function AppSidebar({
    groups,
    selectedEndpoint,
    onSelectEndpoint,
    servers,
    info,
    securitySchemes,
    enabletheme,
    allowedThemes,
    schemas,
    currentSchemaId,
    projectHash,
    projectName
}: AppSidebarProps) {

    useEffect(() => {
        if (selectedEndpoint) {
            const timer = setTimeout(() => {
                const element = document.getElementById(`sidebar-item-${selectedEndpoint}`);
                if (element) {
                    element.scrollIntoView({ block: 'center', behavior: 'smooth' });
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [selectedEndpoint]);

    return (
        <Sidebar>
            <SidebarHeader>
                <TeamSwitcher
                    info={info}
                    servers={servers}
                    securitySchemes={securitySchemes}
                    enabletheme={enabletheme}
                    schemas={schemas}
                    currentSchemaId={currentSchemaId}
                    projectHash={projectHash}
                    projectName={projectName}
                />
            </SidebarHeader>

            <SidebarContent>
                {groups.map((group) => (
                    <SidebarGroup key={group.tag}>
                        <SidebarGroupLabel className="text-xs uppercase font-semibold">
                            {group.tag.charAt(0).toUpperCase() + group.tag.slice(1)}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.endpoints.map((endpoint) => {
                                    const endpointId = `${endpoint.method}-${endpoint.path}`;
                                    const isActive = selectedEndpoint === endpointId;
                                    const displayText = endpoint.summary || endpoint.path;

                                    return (
                                        <SidebarMenuItem key={endpointId}>
                                            <SidebarMenuButton
                                                id={`sidebar-item-${endpointId}`}
                                                isActive={isActive}
                                                onClick={() => onSelectEndpoint(endpoint.path, endpoint.method)}
                                                className="h-auto py-2"
                                            >
                                                <div className="flex flex-col items-start w-full gap-1">
                                                    <div className="flex items-center gap-2 w-full">
                                                        <MethodBadge method={endpoint.method} />
                                                        <span className="text-sm truncate flex-1">
                                                            {displayText}
                                                        </span>
                                                    </div>
                                                </div>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
        </Sidebar>
    );
}