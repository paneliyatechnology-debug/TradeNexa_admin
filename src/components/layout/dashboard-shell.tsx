"use client";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/context/sidebar-context";

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardShell({ children, title }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0 min-h-0 overflow-hidden">
          <Navbar title={title} />
          <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6">
            <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
