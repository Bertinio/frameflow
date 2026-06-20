"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import ManufacturerSidebar from "@/components/manufacturer/ManufacturerSidebar";
import ManufacturerTopbar from "@/components/manufacturer/ManufacturerTopbar";
import ManufacturerMobileMenu from "@/components/manufacturer/ManufacturerMobileMenu";

type ManufacturerLayoutClientProps = {
  manufacturerName: string;
  logoutAction: () => Promise<void>;
  children: ReactNode;
};

export default function ManufacturerLayoutClient({
  manufacturerName,
  logoutAction,
  children,
}: ManufacturerLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:block md:w-72">
        <ManufacturerSidebar />
      </aside>

      <div className="md:pl-72">
        <ManufacturerTopbar
          manufacturerName={manufacturerName}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          logoutAction={logoutAction}
        />

        <ManufacturerMobileMenu
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          logoutAction={logoutAction}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
