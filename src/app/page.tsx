import OpenAPIViewer from '@/components/OpenAPIViewer';

export default function Home() {
    return (
        <OpenAPIViewer
            source="/api.yaml"
            authentication={{
                fields: [
                    { type: 'password', label: 'Password', placeholder: 'Enter your password' }
                ]
            }}
        />
    );
}