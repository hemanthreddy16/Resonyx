"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Bell, Menu, Command, Sparkles } from "lucide-react";
import { SearchCommandModal } from "@/components/ui/SearchCommandModal";
import { NotificationsDrawer } from "@/components/ui/NotificationsDrawer";
import { HindsightStatusWidget } from "@/components/ui/HindsightStatusWidget";

interface TopNavbarProps {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

export function TopNavbar({ onToggleSidebar }: TopNavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-[#080d1a]/80 px-4 backdrop-blur-md transition-all lg:px-6">
        {/* Left Section: Mobile Toggle & Quick Search Button */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800/60 hover:text-white lg:hidden"
              aria-label="Toggle Navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-3 rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-1.5 text-sm text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-900 hover:text-slate-200 sm:w-72 md:w-80"
          >
            <Search className="h-4 w-4 text-sky-400" />
            <span className="truncate">Search incidents, patterns, memory...</span>
            <span className="ml-auto hidden items-center gap-0.5 rounded border border-slate-800 bg-slate-950 px-1.5 py-0.5 text-sm font-mono text-slate-400 sm:flex">
              <Command className="h-3 w-3" />K
            </span>
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-sky-500"
          >
            <Sparkles className="h-4 w-4" />
            <span>Demo</span>
          </Link>

          {/* Hindsight Memory status, read from the real health check */}
          <HindsightStatusWidget />

          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative rounded-lg border border-slate-800/80 bg-slate-900/60 p-2 text-slate-400 transition-colors hover:border-slate-700 hover:bg-slate-800/80 hover:text-white"
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
            <NotificationsDrawer
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
            />
          </div>
        </div>
      </header>

      {/* Global Command Search Modal */}
      <SearchCommandModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
