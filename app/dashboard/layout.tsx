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
    redirect("/sign-in");
  }

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-(--bg)">
        <Sidebar />
        <main className="flex-1 bg-(--bg)">{children}</main>
      </div>
    </ThemeProvider>
  );
}