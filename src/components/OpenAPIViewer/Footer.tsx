import React from 'react';
import { InfoObject } from './types';

interface FooterProps {
    info: InfoObject;
}

export default function Footer({ info }: FooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0">
            <div className="container flex h-14 items-center justify-between px-4">
                <p className="text-sm text-muted-foreground">
                    v{info.version}
                </p>
                <p className="text-sm text-muted-foreground">
                    © {currentYear} {info.title}. All rights reserved.
                </p>
            </div>
        </footer>
    );
}