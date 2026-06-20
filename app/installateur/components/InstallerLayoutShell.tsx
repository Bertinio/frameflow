"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import InstallerSidebar from "@/app/installer/components/InstallerSidebar";
import InstallerBreadcrumbs from "@/app/installateur/components/InstallerBreadcrumbs";

type SectionInfo = {
  title: string;
  subtitle: string;
};

const SECTION_MAP: Array<{ match: string; info: SectionInfo }> = [
  { match: "/installateur/dashboard", info: { title: "Dashboard", subtitle: "Overzicht van je dagelijkse werk" } },
  { match: "/installateur/offertes", info: { title: "Offertes", subtitle: "Beheer en verstuur je offertes" } },
  { match: "/installateur/bestellingen", info: { title: "Bestellingen", subtitle: "Volg de status van alle orders" } },
  { match: "/installateur/settings", info: { title: "Instellingen", subtitle: "Pas je account en marge aan" } },
];

function resolveSection(pathname: string): SectionInfo {
  const section = SECTION_MAP.find((item) => pathname.startsWith(item.match));
  return section?.info ?? { title: "Installateur", subtitle: "FrameFlow installateursomgeving" };
}

export default function InstallerLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/installateur/login") {
    return (
      <div className="min-h-screen bg-[#030712] text-white">
        <InstallerBreadcrumbs />
        {children}
      </div>
    );
  }

  const section = resolveSection(pathname ?? "");

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <InstallerSidebar />

      <div className="min-h-screen flex flex-col md:pl-64">
        <header className="sticky top-0 z-30 hidden border-b border-white/10 bg-[#030712]/95 backdrop-blur md:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Installer</p>
              <h1 className="text-lg font-semibold text-white">{section.title}</h1>
              <p className="text-sm text-slate-400">{section.subtitle}</p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/installateur/settings"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Instellingen
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/installateur/login" })}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Uitloggen
              </button>
            </div>
          </div>
        </header>

        <InstallerBreadcrumbs />

        <main className="flex-1 pt-16 md:pt-0">{children}</main>
      </div>
    </div>
  );
}
