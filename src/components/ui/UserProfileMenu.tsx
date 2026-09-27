"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Building2, Shield, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export function UserProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [environment, setEnvironment] = useState<"Production" | "Staging">("Production");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-900/60 p-1.5 pr-2.5 transition-colors hover:border-slate-700 hover:bg-slate-800/80 focus:outline-none"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-tr from-sky-600 to-blue-800 text-xs font-bold text-white shadow-sm ring-1 ring-white/20">
          AV
        </div>
        <div className="hidden text-left sm:block">
          <div className="text-xs font-semibold text-slate-200">Alex Vance</div>
          <div className="text-[10px] text-slate-400">Principal SRE</div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-slate-700/80 bg-[#0d1525] shadow-2xl shadow-black/80 ring-1 ring-white/10 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Tenant Header */}
          <div className="border-b border-slate-800 bg-slate-900/80 p-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-sky-400" />
              <div className="truncate">
                <div className="text-xs font-semibold text-white">Contoso Enterprise</div>
                <div className="text-[10px] text-slate-400">Tenant: US-EAST-RESONYX-09</div>
              </div>
            </div>

            {/* Environment Selector */}
            <div className="mt-3 flex rounded-lg border border-slate-800 bg-slate-950 p-1">
              <button
                onClick={() => setEnvironment("Production")}
                className={`flex-1 rounded py-1 text-[11px] font-medium transition-colors ${
                  environment === "Production"
                    ? "bg-red-500/20 text-red-300 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                PROD
              </button>
              <button
                onClick={() => setEnvironment("Staging")}
                className={`flex-1 rounded py-1 text-[11px] font-medium transition-colors ${
                  environment === "Staging"
                    ? "bg-sky-500/20 text-sky-300 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                STAGING
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="p-1.5 space-y-0.5 text-xs text-slate-300">
            <div className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-slate-400">
              <span className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-sky-400" />
                Security Access Level:
              </span>
              <span className="font-semibold text-sky-300">Tier-0 Global</span>
            </div>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-md px-2.5 py-2 hover:bg-slate-800/60 hover:text-white transition-colors"
            >
              <Settings className="h-3.5 w-3.5 text-slate-400" />
              <span>Workspace Settings</span>
            </Link>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-red-400 hover:bg-red-500/10 transition-colors text-left"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out of Tenant</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
