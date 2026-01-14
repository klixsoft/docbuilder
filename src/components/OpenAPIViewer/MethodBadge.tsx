import React from 'react';
import type { HttpMethod } from './types';

interface MethodBadgeProps {
    method: HttpMethod;
}

export default function MethodBadge({ method }: MethodBadgeProps) {
    const methodUpper = method.toUpperCase();

    const colors = {
        get: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        post: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
        put: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
        delete: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
        patch: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        options: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
        head: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
        trace: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
    };

    return (
        <span
            className={`
                inline-flex items-center justify-center
                font-medium text-[10px] px-1.5 py-0.5 rounded border
                ${colors[method]}
            `}
        >
            {methodUpper}
        </span>
    );
}