import React, { useState } from 'react';
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
    SidebarInput,
} from '@/components/ui/sidebar';
import TeamSwitcher from './TeamSwitcher';
import { Box, Search } from 'lucide-react';
import type { InfoObject, SchemaObject, ReferenceObject, Server, SecuritySchemeObject, SchemaVersion } from './types';

interface SchemaSidebarProps {
    schemas: Record<string, SchemaObject | ReferenceObject>;
    selectedSchema: string | null;
    onSelectSchema: (name: string) => void;

    // TeamSwitcher props
    info: InfoObject;
    servers?: Server[];
    securitySchemes?: Record<string, SecuritySchemeObject>;
    enabletheme: boolean;
    allowedThemes?: string[];
    schemaVersions?: SchemaVersion[];
    currentSchemaId?: string;
    projectHash?: string;
    projectName?: string;
}

export default function SchemaSidebar({
    schemas,
    selectedSchema,
    onSelectSchema,
    info,
    servers,
    securitySchemes,
    enabletheme,
    schemaVersions,
    currentSchemaId,
    projectHash,
    projectName
}: SchemaSidebarProps) {

    // Auto-scroll to selected schema
    React.useEffect(() => {
        if (selectedSchema) {
            const element = document.getElementById(`schema-${selectedSchema}`);
            if (element) {
                element.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
        }
    }, [selectedSchema]);

    const schemaNames = Object.keys(schemas).sort();

    return (
        <Sidebar>
            <SidebarHeader>
                <TeamSwitcher
                    info={info}
                    servers={servers}
                    securitySchemes={securitySchemes}
                    enabletheme={enabletheme}
                    schemas={schemaVersions}
                    currentSchemaId={currentSchemaId}
                    projectHash={projectHash}
                    projectName={projectName}
                />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Models</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {schemaNames.length === 0 ? (
                                <div className="p-4 text-xs text-muted-foreground text-center">
                                    No schemas found
                                </div>
                            ) : (
                                schemaNames.map(name => (
                                    <SidebarMenuItem key={name} id={`schema-${name}`}>
                                        <SidebarMenuButton
                                            isActive={selectedSchema === name}
                                            onClick={() => onSelectSchema(name)}
                                            className="h-auto py-2"
                                        >
                                            <div className="flex items-center gap-2 w-full">
                                                <Box className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm truncate flex-1">{name}</span>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
