import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/Header";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session.isLoggedIn) {
        redirect("/login");
    }

    const user = {
        id: session.userId as string,
        email: session.email as string,
        name: session.name as string,
        role: session.role as 'ADMIN' | 'USER',
    } as const;


    return (
        <SidebarProvider>
            <DashboardSidebar user={user} />
            <SidebarInset>
                <DashboardHeader user={user} />

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
