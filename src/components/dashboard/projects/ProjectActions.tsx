'use client';

import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash, ExternalLink } from "lucide-react";
import { deleteProject } from "@/app/actions/project";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Project } from "@prisma/client";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { ProjectActions as ProjectActionsType } from "@/components/dashboard/projects/ProjectActions";
import { EditProjectDialog } from './EditProjectDialog';

export function ProjectActions({ project }: { project: Project }) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();


    async function onDelete() {
        setIsDeleting(true);
        const result = await deleteProject(project.id);
        setIsDeleting(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Project deleted successfully');
            setIsDeleteDialogOpen(false);
            router.refresh();
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/projects/${project.id}`)}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(`/p/${project.hash}`, '_blank')}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Live
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Project
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Project
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditProjectDialog
                project={project}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>

                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the project &quot;{project.name}&quot; and all associated documentation schemas. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={onDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Project'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
