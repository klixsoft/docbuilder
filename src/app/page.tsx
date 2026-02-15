import { redirect } from 'next/navigation';
import { services } from '@/lib/services';

export default function Home() {
    if (services.length > 0) {
        redirect(`/${services[0].id}`);
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-muted-foreground">No services configured.</p>
        </div>
    );
}