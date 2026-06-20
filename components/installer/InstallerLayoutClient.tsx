"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import InstallerSidebar from "@/components/installer/InstallerSidebar";
import InstallerTopbar from "@/components/installer/InstallerTopbar";
import InstallerMobileMenu from "@/components/installer/InstallerMobileMenu";

type InstallerLayoutClientProps = {
  installerName: string;
  logoutAction: () => Promise<void>;
  children: ReactNode;
};

export default function InstallerLayoutClient({
  installerName,
  logoutAction,
  children,
}: InstallerLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:block md:w-72">
        <InstallerSidebar />
      </aside>

      <div className="md:pl-72">
        <InstallerTopbar
          installerName={installerName}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          logoutAction={logoutAction}
        />

        <InstallerMobileMenu
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          logoutAction={logoutAction}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
