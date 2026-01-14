'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { validateAccess } from '@/app/actions/auth';
import { ProtectionGateProps } from './types';

export function ProtectionGate({ fields, onAuthenticated = () => { } }: ProtectionGateProps) {
    const [formValues, setFormValues] = useState<string[]>(new Array(fields.length).fill(''));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (index: number, value: string) => {
        const newValues = [...formValues];
        newValues[index] = value;
        setFormValues(newValues);

        if (error) {
            setError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await validateAccess(formValues);
        if (result.success) {
            onAuthenticated();
        } else {
            setError('Credentials do not match.');
        }
        setLoading(false);
    };

    return (
        <Dialog open={true}>
            <DialogContent className="sm:max-w-[400px]" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader className="items-center">
                    <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-xl mb-2 text-primary-foreground">
                        <ShieldCheck size={28} />
                    </div>
                    <DialogTitle className="text-xl">Protected Documentation</DialogTitle>
                    <p className="text-sm text-muted-foreground text-center">
                        This API documentation is restricted. Please provide your credentials.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {fields.map((field, idx) => (
                        <div key={idx} className="space-y-1.5">
                            <label className="text-xs font-semibold capitalize tracking-wider text-muted-foreground">
                                {field.label}
                            </label>
                            <Input
                                type={field.type}
                                placeholder={field.placeholder}
                                value={formValues[idx]}
                                onChange={(e) => handleInputChange(idx, e.target.value)}
                                className={error ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''}
                                required
                            />
                            {error && (
                                <p className="text-xs text-destructive font-medium">{error}</p>
                            )}
                        </div>
                    ))}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Verifying..." : "Access Documentation"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}