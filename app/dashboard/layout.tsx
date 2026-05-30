import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar (fixed) */}
        <div className="w-64 shrink-0 border-r border-[var(--border)] bg-[var(--card)]">
          <Sidebar />
        </div>

        {/* Main */}
        <main className="flex-1 flex flex-col bg-[var(--bg)]">
          {/* Top content (scrollable only here) */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="max-w-8xl mx-auto">{children}</div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
