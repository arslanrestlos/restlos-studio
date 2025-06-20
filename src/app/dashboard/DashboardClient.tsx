'use client';

import React, { ReactNode, useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { UserNav } from '@/components/dashboard/UserNav';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface DashboardClientProps {
  children: ReactNode;
  session: any; // Session ist garantiert vorhanden
}

export default function DashboardClient({
  children,
  session,
}: DashboardClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div
          className={`hidden lg:flex lg:flex-col transition-all duration-300 ${
            sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
          }`}
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menü öffnen</span>
              </Button>

              {/* Page Title */}
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold">Restlos Studio</h1>
              </div>
            </div>

            {/* UserNav - Session ist garantiert verfügbar */}
            <UserNav />
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
