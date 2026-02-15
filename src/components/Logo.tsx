import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
    const sizeClasses = {
        sm: 'h-6 w-auto',
        md: 'h-8 w-auto',
        lg: 'h-12 w-auto',
    };

    const docsSizes = {
        sm: 'text-[7px]',
        md: 'text-[9px]',
        lg: 'text-[12px]',
    };

    const docsOffsets = {
        sm: '-bottom-3 right-0',
        md: '-bottom-4 right-0',
        lg: '-bottom-6 right-0',
    };

    return (
        <div className={cn("relative inline-flex flex-col items-end", className)}>
            <div className={cn("relative", sizeClasses[size])}>
                <Image
                    src="/logo.svg"
                    alt="Klix Soft"
                    width={size === 'lg' ? 180 : size === 'md' ? 120 : 90}
                    height={size === 'lg' ? 48 : size === 'md' ? 32 : 24}
                    className="h-full w-auto object-contain"
                />
            </div>
            <span className={cn(
                "font-bold uppercase tracking-[0.2em] text-primary font-mono absolute leading-none",
                docsSizes[size],
                docsOffsets[size]
            )}>
                docs
            </span>
        </div>
    );
}
