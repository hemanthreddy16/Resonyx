"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AlertOctagon,
  Network,
  Zap,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageSquareText,
} from "lucide-react";
import { ResonyxLogo } from "@/components/branding/ResonyxLogo";
import { cn } from "@/utils/cn";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: "Demo",
    href: "/demo",
    icon: Sparkles,
  },
  {
    name: "Ask Resonyx",
    href: "/ask",
    icon: MessageSquareText,
  },
  {
    name: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Incidents",
    href: "/incidents",
    icon: AlertOctagon,
  },
  {
    name: "Hindsight Memory",
    href: "/memory",
    icon: Zap,
  },
  {
    name: "Patterns",
    href: "/patterns",
    icon: Network,
  },
  {
    name: "Prevention",
    href: "/prevention",
    icon: ShieldCheck,
  },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  mobileOpen,
  onMobileClose,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  const navContent = (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-4">
          <ResonyxLogo collapsed={collapsed} showTagline={false} />
          <button
            onClick={onToggleCollapse}
            className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:flex"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sky-500/10 text-sky-300 font-semibold"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                )}
                title={collapsed ? item.name : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-sky-400" />
                )}

                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-sky-400" : "text-slate-400 group-hover:text-slate-200"
                  )}
                />

                {!collapsed && <span className="ml-3 truncate">{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Settings stays available as a small icon at the bottom */}
      <div className="border-t border-slate-800/80 p-3">
        <Link
          href="/settings"
          onClick={onMobileClose}
          className={cn(
            "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            collapsed ? "justify-center" : "",
            pathname.startsWith("/settings")
              ? "bg-sky-500/10 text-sky-300 font-semibold"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          )}
          title="Settings"
        >
          <Settings
            className={cn(
              "h-4 w-4 shrink-0",
              pathname.startsWith("/settings") ? "text-sky-400" : "text-slate-400"
            )}
          />
          {!collapsed && <span className="ml-3 truncate">Settings</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "sticky top-0 z-40 hidden h-screen shrink-0 border-r border-slate-800/80 bg-[#070b16] transition-all duration-300 lg:block",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          />

          <div className="relative z-10 w-72 max-w-[85vw] border-r border-slate-800 bg-[#070b16] shadow-2xl animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
