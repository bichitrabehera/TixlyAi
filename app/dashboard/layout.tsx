import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SessionCleanup } from "@/components/dashboard/SessionCleanup";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

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
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var k='theme';var t=localStorage.getItem(k);var d=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;if(d){r.classList.add('dark');r.style.colorScheme='dark';}else{r.classList.remove('dark');r.style.colorScheme='light';}}catch(e){}})();`,
        }}
      />
      <DashboardShell>
        <SessionCleanup />
        {children}
      </DashboardShell>
      <Toaster />
    </ThemeProvider>
  );
}
