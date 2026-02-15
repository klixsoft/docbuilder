import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
    text: string;
    className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
    const [hasCopied, setHasCopied] = useState(false);

    const onCopy = () => {
        navigator.clipboard.writeText(text);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

    return (
        <Button
            size="icon"
            variant="secondary"
            className={cn("h-6 w-6 shadow-sm hover:bg-neutral-200 dark:hover:bg-neutral-800", className)}
            onClick={onCopy}
        >
            {hasCopied ? (
                <Check className="h-3 w-3 text-green-500" />
            ) : (
                <Copy className="h-3 w-3 text-neutral-500" />
            )}
            <span className="sr-only">Copy</span>
        </Button>
    );
}
