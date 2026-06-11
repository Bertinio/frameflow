"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function InstallerNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b border-white/10 bg-[#030712]/95 text-white backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sky-300">
            IF
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Installer</p>
            <h1 className="text-lg font-semibold">FrameFlow</h1>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <NavLink href="/installer/dashboard" label="Dashboard" />
          <NavLink href="/installer/quotes" label="Offertes" />
          <NavLink href="/installer/orders" label="Orders" />
          <NavLink href="/installer/calculator" label="Calculator" />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Uitloggen
          </button>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10 md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Open navigatie"
        >
          <span className="block h-0.5 w-5 bg-white"></span>
          <span className="mt-1 block h-0.5 w-5 bg-white"></span>
          <span className="mt-1 block h-0.5 w-5 bg-white"></span>
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-white/10 bg-[#030712]/95 px-4 py-4 md:hidden">
          <div className="space-y-3">
            <MobileNavLink href="/installer/dashboard" label="Dashboard" onClick={() => setIsOpen(false)} />
            <MobileNavLink href="/installer/quotes" label="Offertes" onClick={() => setIsOpen(false)} />
            <MobileNavLink href="/installer/orders" label="Orders" onClick={() => setIsOpen(false)} />
            <MobileNavLink href="/installer/calculator" label="Calculator" onClick={() => setIsOpen(false)} />
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Uitloggen
            </button>
          </div>
        </div>
      ) : null}
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-transparent bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/10 hover:bg-white/10"
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
    >
      {label}
    </Link>
  );
}
