'use client';

import { useState } from 'react';
import { deleteSchema } from '@/app/actions/project';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from 'next/navigation';

interface DeleteSchemaDialogProps {
    schemaId: string;
    schemaName: string;
}

export function DeleteSchemaDialog({ schemaId, schemaName }: DeleteSchemaDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function onDelete() {
        setIsLoading(true);
        const result = await deleteSchema(schemaId);
        setIsLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Schema version deleted successfully');
            router.refresh();
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="size-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the schema version <strong>{schemaName}</strong>.
                        This action cannot be undone and will break links to this specific version.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onDelete();
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Deleting...' : 'Delete Version'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
