'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export function PublicLink({ hash }: { hash: string }) {
    const [isCopied, setIsCopied] = useState(false);
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = `${baseUrl}/p/${hash}`;

    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setIsCopied(true);
            toast.success('Link copied to clipboard');
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy link');
        }
    }

    return (
        <div className="flex items-center gap-2 max-w-[280px]">
            <div className="relative flex-1">
                <Input
                    readOnly
                    value={`/p/${hash}`}
                    className="h-8 text-xs font-mono pr-8 bg-muted/50"
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-8 w-8 hover:bg-transparent"
                    onClick={copyToClipboard}
                >
                    {isCopied ? (
                        <Check className="size-3 text-green-500" />
                    ) : (
                        <Copy className="size-3 text-muted-foreground" />
                    )}
                </Button>
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                <a href={`/p/${hash}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-3.5" />
                </a>
            </Button>
        </div>
    );
}
