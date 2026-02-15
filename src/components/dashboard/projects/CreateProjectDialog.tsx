'use client';

import { useState } from 'react';
import { createProject } from '@/app/actions/project';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CreateProjectDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedThemes, setSelectedThemes] = useState<string[]>(['system', 'light', 'dark']);
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
        selectedThemes.forEach(theme => formData.append('themes', theme));

        const result = await createProject(formData);

        setIsLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Project created successfully');
            setIsOpen(false);
            setSelectedThemes(['system', 'light', 'dark']);
            router.refresh();
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="size-4 mr-2" />
                    New Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Documentation Project</DialogTitle>
                    <DialogDescription>
                        Set up a new API documentation project with a unique access link.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit}>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input id="name" name="name" placeholder="E-commerce API v1" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea id="description" name="description" placeholder="Internal documentation for the main e-commerce services." />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="viewPassword">View Password (Optional)</Label>
                            <Input id="viewPassword" name="viewPassword" type="password" placeholder="Set a password for public access" />
                            <p className="text-xs text-muted-foreground">If set, visitors must enter this password to view the documentation.</p>
                        </div>

                        <div className="grid gap-4">
                            <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Supported Themes</Label>
                            <div className="flex flex-wrap gap-6 p-4 rounded-lg bg-muted/30 border border-border/40">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="theme-system"
                                        checked={selectedThemes.includes('system')}
                                        onCheckedChange={() => toggleTheme('system')}
                                    />
                                    <Label htmlFor="theme-system" className="text-sm font-medium">System</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="theme-light"
                                        checked={selectedThemes.includes('light')}
                                        onCheckedChange={() => toggleTheme('light')}
                                    />
                                    <Label htmlFor="theme-light" className="text-sm font-medium">Light</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="theme-dark"
                                        checked={selectedThemes.includes('dark')}
                                        onCheckedChange={() => toggleTheme('dark')}
                                    />
                                    <Label htmlFor="theme-dark" className="text-sm font-medium">Dark</Label>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">Select the themes allowed for this documentation. If only one is selected, the theme toggle will be hidden for visitors.</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? 'Creating Project...' : 'Create Project'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
