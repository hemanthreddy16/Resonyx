"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AlertOctagon,
  Network,
  Zap,
  ShieldAlert,
  ShieldCheck,
  History,
  Terminal,
  Blocks,
  Settings,
  ChevronLeft,
  ChevronRight,
  Radio,
  Sparkles,
  Play,
} from "lucide-react";
import { ResonyxLogo } from "@/components/branding/ResonyxLogo";
import { cn } from "@/utils/cn";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeType?: "danger" | "warning" | "azure" | "success" | "neutral";
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  {
    name: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Incidents",
    href: "/incidents",
    icon: AlertOctagon,
    badge: "5",
    badgeType: "neutral",
  },
  {
    name: "Pattern Intelligence",
    href: "/patterns",
    icon: Network,
    badge: "14",
    badgeType: "azure",
  },
  {
    name: "Hindsight Memory",
    href: "/hindsight",
    icon: Zap,
    badge: "14.8K",
    badgeType: "azure",
  },
  {
    name: "Risk Detection",
    href: "/risk-detection",
    icon: ShieldAlert,
    badge: "3 Crit",
    badgeType: "danger",
  },
  {
    name: "Prevention Center",
    href: "/prevention",
    icon: ShieldCheck,
    badge: "38 Blocked",
    badgeType: "success",
  },
  {
    name: "Learning Timeline",
    href: "/timeline",
    icon: History,
  },
  {
    name: "AI Command Center",
    href: "/ai-command",
    icon: Terminal,
    badge: "Synthesizer",
    badgeType: "azure",
  },
  {
    name: "START DEMO",
    href: "/demo",
    icon: Sparkles,
    badge: "60s Demo",
    badgeType: "success",
  },
  {
    name: "The Difference",
    href: "/difference",
    icon: Sparkles,
    badge: "Judges",
    badgeType: "warning",
  },
  {
    name: "Simulator",
    href: "/simulator",
    icon: Play,
    badge: "Interactive",
    badgeType: "azure",
  },
];

const SECONDARY_NAV_ITEMS: NavItem[] = [
  {
    name: "Integrations",
    href: "/integrations",
    icon: Blocks,
    badge: "8 Connected",
    badgeType: "neutral",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
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

  const getBadgeClass = (type?: string) => {
    switch (type) {
      case "danger":
        return "bg-red-500/20 text-red-300 border-red-500/30 font-bold";
      case "warning":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "success":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "azure":
        return "bg-sky-500/20 text-sky-300 border-sky-500/30 font-mono";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between">
      {/* Top Header & Brand */}
      <div>
        <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-4">
          <ResonyxLogo collapsed={collapsed} showTagline={false} />
          {/* Collapse button for desktop */}
          <button
            onClick={onToggleCollapse}
            className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:flex"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Primary Navigation Links */}
        <div className="mt-4 px-3 space-y-1">
          {!collapsed && (
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Intelligence Platform
            </div>
          )}

          {PRIMARY_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "group relative flex items-center rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-sky-500/10 text-sky-300 font-semibold ring-1 ring-sky-500/30 shadow-sm shadow-sky-950/40"
                    : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
                )}
                title={collapsed ? item.name : undefined}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-sky-400" />
                )}

                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive
                      ? "text-sky-400"
                      : "text-slate-400 group-hover:text-slate-200"
                  )}
                />

                {!collapsed && (
                  <span className="ml-3 truncate">{item.name}</span>
                )}

                {!collapsed && item.badge && (
                  <span
                    className={cn(
                      "ml-auto rounded border px-1.5 py-0.5 text-[10px] shrink-0",
                      getBadgeClass(item.badgeType)
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Secondary Navigation Links */}
        <div className="mt-6 px-3 space-y-1">
          {!collapsed && (
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Management & Ops
            </div>
          )}

          {SECONDARY_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "group relative flex items-center rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-sky-500/10 text-sky-300 font-semibold ring-1 ring-sky-500/30"
                    : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
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
                {!collapsed && item.badge && (
                  <span
                    className={cn(
                      "ml-auto rounded border px-1.5 py-0.5 text-[10px] shrink-0",
                      getBadgeClass(item.badgeType)
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Status Panel (Hindsight Sentinel Status) */}
      <div className="p-3 border-t border-slate-800/80">
        {!collapsed ? (
          <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-3 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span className="text-[11px] font-semibold text-slate-200">
                  Hindsight Sentinel
                </span>
              </div>
              <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                LIVE
              </span>
            </div>

            <p className="mt-1.5 text-[11px] text-slate-400 leading-snug">
              Continuous failure telemetry ingested from 18 clusters.
            </p>

            <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Failure Recall:</span>
              <span className="text-sky-300 font-semibold">99.4% SLA</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Hindsight Sentinel: LIVE">
            <div className="relative p-2 text-emerald-400">
              <Radio className="h-4 w-4 animate-pulse" />
            </div>
          </div>
        )}
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
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          />

          {/* Drawer panel */}
          <div className="relative z-10 w-72 max-w-[85vw] border-r border-slate-800 bg-[#070b16] shadow-2xl animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
