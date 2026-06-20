"use client";

import InstallerNavItem from "@/components/installer/InstallerNavItem";
import { installerNavItems } from "@/components/installer/navItems";

export default function InstallerSidebar() {
  return (
    <div className="flex h-full min-h-screen flex-col border-r border-white/10 bg-black text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-xs uppercase tracking-[0.25em] text-white/45">FrameFlow</p>
        <p className="mt-2 text-lg font-semibold">Navigatie</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {installerNavItems.map((item) => (
          <InstallerNavItem key={item.href} href={item.href} label={item.label} icon={item.icon} />
        ))}
      </nav>
    </div>
  );
}
