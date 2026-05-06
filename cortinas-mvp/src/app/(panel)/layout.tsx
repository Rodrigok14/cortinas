import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { requireAuth } from "@/lib/auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();

  return (
    <div className="lg:flex">
      <Sidebar role={user.role} />
      <main className="min-h-screen flex-1 p-4 md:p-6">
        <Topbar email={user.email} role={user.role} name={user.fullName} />
        {children}
      </main>
    </div>
  );
}
