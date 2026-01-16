import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./providers";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
    title: {
        default: "API Documentation",
        template: "%s | API Documentation"
    },
    description: "Comprehensive API documentation with interactive endpoints, schemas, and code samples",
    keywords: ["API", "Documentation", "REST API", "OpenAPI", "Swagger"],
    authors: [{ name: "Your Organization" }],
    openGraph: {
        type: "website",
        locale: "en_US",
        title: "API Documentation",
        description: "Comprehensive API documentation with interactive endpoints",
        siteName: "API Documentation"
    },
    twitter: {
        card: "summary_large_image",
        title: "API Documentation",
        description: "Comprehensive API documentation with interactive endpoints"
    },
    robots: {
        index: true,
        follow: true
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
