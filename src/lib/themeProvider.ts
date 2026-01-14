import { useEffect } from 'react';

const DEFAULT_PRIMARY_COLOR = '#10b981';

export function useTheme(primaryColor?: string) {
    useEffect(() => {
        const color = primaryColor || DEFAULT_PRIMARY_COLOR;
        const root = document.documentElement;

        const rgb = hexToRgb(color);
        if (rgb) {
            root.style.setProperty('--primary-color', color);
            root.style.setProperty('--primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);

            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            root.style.setProperty('--primary-h', String(hsl.h));
            root.style.setProperty('--primary-s', `${hsl.s}%`);
            root.style.setProperty('--primary-l', `${hsl.l}%`);
        }

        return () => {
            root.style.removeProperty('--primary-color');
            root.style.removeProperty('--primary-rgb');
            root.style.removeProperty('--primary-h');
            root.style.removeProperty('--primary-s');
            root.style.removeProperty('--primary-l');
        };
    }, [primaryColor]);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
}

export function getThemeColors(primaryColor: string = DEFAULT_PRIMARY_COLOR) {
    const rgb = hexToRgb(primaryColor);
    if (!rgb) return {};

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    return {
        primary: primaryColor,
        primaryLight: `hsl(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + 10, 95)}%)`,
        primaryDark: `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(hsl.l - 10, 10)}%)`,
        primaryFade: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 0.1)`,
    };
}