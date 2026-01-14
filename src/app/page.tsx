import OpenAPIViewer from '@/components/OpenAPIViewer';

export default function Home() {
    return (
        <OpenAPIViewer
            source="/api.yaml"
            branding={{
                logo: "https://mediisha.app/navbar/mediisha-logo.svg",
                title: "Mediisha API Documentation",
                primaryColor: "#10b981"
            }}
        />
    );
}