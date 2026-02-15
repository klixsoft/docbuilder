'use client';

import React from 'react';

interface TrafficGraphProps {
    data: { date: string; value: number }[];
    title?: string;
}

export function TrafficGraph({ data, title = "Traffic Analytics" }: TrafficGraphProps) {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value), 10);
    const chartHeight = 200;
    const chartWidth = 600;
    const padding = 40;

    const points = data.map((d, i) => {
        const x = padding + (i * (chartWidth - 2 * padding) / (data.length - 1));
        const y = chartHeight - padding - (d.value / maxValue * (chartHeight - 2 * padding));
        return { x, y };
    });

    const pathData = points.reduce((acc, point, i) => {
        return i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
    }, "");

    const areaData = `${pathData} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;

    return (
        <div className="w-full bg-card rounded-xl border border-border/40 p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg tracking-tight">{title}</h3>
                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                        <div className="size-2 rounded-full bg-primary" />
                        <span>Visitors</span>
                    </div>
                </div>
            </div>

            <div className="relative h-[200px] w-full">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full" preserveAspectRatio="none">
                    {/* Grids */}
                    {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                        const y = chartHeight - padding - (p * (chartHeight - 2 * padding));
                        return (
                            <line
                                key={i}
                                x1={padding}
                                y1={y}
                                x2={chartWidth - padding}
                                y2={y}
                                stroke="currentColor"
                                strokeOpacity="0.05"
                                strokeDasharray="4 4"
                            />
                        );
                    })}

                    {/* Gradient */}
                    <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Area */}
                    <path d={areaData} fill="url(#gradient)" />

                    {/* Line */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-[0_4px_8px_rgba(var(--primary-rgb),0.3)]"
                    />

                    {/* Points */}
                    {points.map((p, i) => (
                        <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r="4"
                            className="fill-background stroke-primary stroke-[2px] transition-all duration-300 hover:r-6"
                        />
                    ))}
                </svg>
            </div>

            <div className="flex items-center justify-between mt-4 px-10">
                {data.map((d, i) => (
                    <span key={i} className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-tighter">
                        {d.date}
                    </span>
                ))}
            </div>
        </div>
    );
}
