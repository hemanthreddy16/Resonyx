"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";

interface EnterpriseShellProps {
  children: React.ReactNode;
}

export function EnterpriseShell({ children }: EnterpriseShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-row selection:bg-sky-500/30 selection:text-white">
      {/* Persistent Responsive Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
        {/* Professional Top Navigation Bar */}
        <TopNavbar
          onToggleSidebar={() => setMobileSidebarOpen(true)}
          sidebarCollapsed={collapsed}
        />

        {/* Dynamic Page Viewport */}
        <main className="flex-1 p-4 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-[#070b16]/90 px-6 py-4 text-sm text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">RESONYX</span>
              <span className="text-slate-500">•</span>
              <span>Every Failure Becomes Intelligence.</span>
            </div>
            <span>Demo data is simulated.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
