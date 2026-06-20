"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { label: "Dashboard", href: "/installer/dashboard" },
  { label: "Offertes", href: "/installer/quotes" },
  { label: "Bestellingen", href: "/installer/orders" },
  { label: "Instellingen", href: "/installer/settings" },
];

export default function InstallerSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    return pathname?.startsWith(href);
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:h-screen md:fixed md:left-0 md:top-0 bg-[#0a0f1c] border-r border-white/10 p-4">
        <div className="mb-6 px-2">
          <div className="text-white text-lg font-semibold">FrameFlow</div>
          <div className="text-slate-400 text-sm">Installer</div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive(item.href) ? "bg-white/5 text-sky-300" : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-6 px-2">
          <button
            onClick={() => signOut({ callbackUrl: "/installateur/login" })}
            className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
          >
            Uitloggen
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#0a0f1c] border-b border-white/10 p-3 flex items-center justify-between">
        <div>
          <div className="text-white font-semibold">FrameFlow</div>
        </div>
        <div>
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/3 text-white"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-[#0a0f1c] border-r border-white/10 p-4">
            <div className="mb-6">
              <div className="text-white text-lg font-semibold">FrameFlow</div>
              <div className="text-slate-400 text-sm">Installer</div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive(item.href) ? "bg-white/5 text-sky-300" : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-6">
              <button
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/installateur/login" });
                }}
                className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
              >
                Uitloggen
              </button>
            </div>
          </div>

          <div className="flex-1" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
