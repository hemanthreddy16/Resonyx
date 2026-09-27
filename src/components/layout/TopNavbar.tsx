"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Bell, Menu, Command, Sparkles } from "lucide-react";
import { SearchCommandModal } from "@/components/ui/SearchCommandModal";
import { NotificationsDrawer } from "@/components/ui/NotificationsDrawer";
import { HindsightStatusWidget } from "@/components/ui/HindsightStatusWidget";
import { AiStatusWidget } from "@/components/ui/AiStatusWidget";
import { UserProfileMenu } from "@/components/ui/UserProfileMenu";

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

          {/* Quick Search Launcher */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-3 rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-900 hover:text-slate-200 sm:w-72 md:w-80"
          >
            <Search className="h-4 w-4 text-sky-400" />
            <span className="truncate">Search incidents, patterns, Hindsight...</span>
            <span className="ml-auto hidden items-center gap-0.5 rounded border border-slate-800 bg-slate-950 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 sm:flex">
              <Command className="h-3 w-3" />K
            </span>
          </button>
        </div>

        {/* Right Section: START DEMO + Hackathon Demo Button + Hindsight Status + AI Status + Notifications + User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* 60s Start Demo Button */}
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-black text-white shadow-lg shadow-emerald-950/50 transition-all animate-pulse"
          >
            <Sparkles className="h-3.5 w-3.5 text-white" />
            <span>START DEMO (60s)</span>
          </Link>

          {/* Hackathon Demo Button */}
          <Link
            href="/difference"
            className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-gradient-to-r from-sky-950/60 to-indigo-950/60 px-3 py-1.5 text-xs font-bold text-sky-300 hover:border-sky-400 hover:text-white transition-all shadow-md shadow-sky-950/30"
          >
            <span>The Difference</span>
          </Link>
          {/* Hindsight Status */}
          <HindsightStatusWidget />

          {/* AI Status */}
          <AiStatusWidget />

          {/* Notifications Drawer Toggle */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative rounded-lg border border-slate-800/80 bg-slate-900/60 p-2 text-slate-400 transition-colors hover:border-slate-700 hover:bg-slate-800/80 hover:text-white"
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4" />
              {/* Active Alert Pip */}
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
            </button>
            <NotificationsDrawer
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
            />
          </div>

          <div className="h-5 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

          {/* Enterprise User Profile */}
          <UserProfileMenu />
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
