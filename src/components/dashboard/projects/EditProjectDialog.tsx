'use client';

import { useState } from 'react';
import { updateProject } from '@/app/actions/project';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { Project } from "@prisma/client";

interface EditProjectDialogProps {
    project: Project;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditProjectDialog({ project, open, onOpenChange }: EditProjectDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedThemes, setSelectedThemes] = useState<string[]>(project.themes || ['system', 'light', 'dark']);
    const router = useRouter();

    const toggleTheme = (theme: string) => {
        setSelectedThemes(prev =>
            prev.includes(theme)
                ? prev.filter(t => t !== theme)
                : [...prev, theme]
        );
    };

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (selectedThemes.length === 0) {
            toast.error('Please select at least one supported theme');
            return;
        }

        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        formData.append('projectId', project.id);
        selectedThemes.forEach(theme => formData.append('themes', theme));

        const result = await updateProject(formData);

        setIsLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Project updated successfully');
            onOpenChange(false);
            router.refresh();
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Project</DialogTitle>
                    <DialogDescription>
                        Update the project details and documentation settings.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit}>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input id="edit-name" name="name" defaultValue={project.name} placeholder="E-commerce API v1" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea id="edit-description" name="description" defaultValue={project.description || ''} placeholder="Internal documentation for the main e-commerce services." />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="viewPassword">View Password (Optional)</Label>
                            <Input id="edit-viewPassword" name="viewPassword" type="password" defaultValue={project.viewPassword || ''} placeholder="Set a password for public access" />
                            <p className="text-xs text-muted-foreground">If set, visitors must enter this password to view the documentation.</p>
                        </div>

                        <div className="grid gap-4">
                            <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Supported Themes</Label>
                            <div className="flex flex-wrap gap-6 p-4 rounded-lg bg-muted/30 border border-border/40">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="edit-theme-system"
                                        checked={selectedThemes.includes('system')}
                                        onCheckedChange={() => toggleTheme('system')}
                                    />
                                    <Label htmlFor="edit-theme-system" className="text-sm font-medium">System</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="edit-theme-light"
                                        checked={selectedThemes.includes('light')}
                                        onCheckedChange={() => toggleTheme('light')}
                                    />
                                    <Label htmlFor="edit-theme-light" className="text-sm font-medium">Light</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="edit-theme-dark"
                                        checked={selectedThemes.includes('dark')}
                                        onCheckedChange={() => toggleTheme('dark')}
                                    />
                                    <Label htmlFor="edit-theme-dark" className="text-sm font-medium">Dark</Label>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">Select the themes allowed for this documentation.</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? 'Updating Project...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
