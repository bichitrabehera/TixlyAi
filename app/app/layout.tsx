import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SessionCleanup } from "@/components/dashboard/SessionCleanup";
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
      <DashboardShell>
        <SessionCleanup />
        {children}
      </DashboardShell>
    </ThemeProvider>
  );
}
