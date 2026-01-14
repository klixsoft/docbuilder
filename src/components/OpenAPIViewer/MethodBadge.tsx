import React from 'react';
import type { HttpMethod } from './types';

interface MethodBadgeProps {
    method: HttpMethod;
    size?: 'sm' | 'md' | 'lg';
}

export default function MethodBadge({ method, size = 'md' }: MethodBadgeProps) {
    const methodUpper = method.toUpperCase();

    const colors = {
        get: 'bg-green-100 text-green-700 border-green-300',
        post: 'bg-blue-100 text-blue-700 border-blue-300',
        put: 'bg-orange-100 text-orange-700 border-orange-300',
        delete: 'bg-red-100 text-red-700 border-red-300',
        patch: 'bg-purple-100 text-purple-700 border-purple-300',
        options: 'bg-gray-100 text-gray-700 border-gray-300',
        head: 'bg-gray-100 text-gray-700 border-gray-300',
        trace: 'bg-gray-100 text-gray-700 border-gray-300',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs min-w-[50px]',
        md: 'px-2.5 py-1 text-sm min-w-[60px]',
        lg: 'px-3 py-1.5 text-base min-w-[70px]',
    };

    return (
        <span
            className={`
        inline-flex items-center justify-center
        font-semibold rounded border
        ${colors[method]}
        ${sizes[size]}
      `}
        >
            {methodUpper}
        </span>
    );
}