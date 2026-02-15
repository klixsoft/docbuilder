'use client';

import { useState } from 'react';
import { updateSchema } from '@/app/actions/project';
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
import { Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EditSchemaDialogProps {
    schema: {
        id: string;
        name: string;
        content: string | null;
        url: string | null;
    };
}

export function EditSchemaDialog({ schema }: EditSchemaDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        formData.append('schemaId', schema.id);

        const result = await updateSchema(formData);

        setIsLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Schema updated successfully');
            setIsOpen(false);
            router.refresh();
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-muted">
                    <Edit2 className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Edit Schema Version</DialogTitle>
                    <DialogDescription>
                        Update the name or content of this schema version.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit}>
                    <div className="grid gap-6 py-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Version / Schema Name</Label>
                            <Input id="name" name="name" defaultValue={schema.name} required className="h-11" />
                        </div>

                        {schema.url ? (
                            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40">
                                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Remote Source</p>
                                <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1 font-mono break-all">{schema.url}</p>
                                <p className="text-xs text-blue-600/60 dark:text-blue-400/60 mt-2 italic">Remote schemas are refreshed automatically from their source URL. Only the name can be changed here.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                <Label htmlFor="content" className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Specification Content</Label>
                                <Textarea id="content" name="content" defaultValue={schema.content || ''} className="font-mono h-[350px] bg-muted/10 resize-none text-[13px] leading-relaxed border-border/60" required />
                            </div>
                        )}
                    </div>
                    <DialogFooter className="gap-3 sm:gap-0 border-t border-border/40 pt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="px-8 shadow-md">
                            {isLoading ? 'Saving Changes...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
