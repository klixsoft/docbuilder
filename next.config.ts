import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactCompiler: true,
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
                port: '',
                pathname: '/**',
            }
        ]
    },
    webpack: (config, { isServer, dev }) => {
        if (isServer && !dev) {
            config.resolve.alias['@prisma/client'] = '@prisma/client/wasm';
        }
        return config;
    }
};

export default nextConfig;
