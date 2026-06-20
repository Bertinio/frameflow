"use client";

import ManufacturerNavItem from "@/components/manufacturer/ManufacturerNavItem";
import { manufacturerNavItems } from "@/components/manufacturer/navItems";

export default function ManufacturerSidebar() {
  return (
    <div className="flex h-full min-h-screen flex-col border-r border-gray-800 bg-gray-900 text-white">
      <div className="border-b border-gray-800 px-5 py-5">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Manufacturer</p>
        <p className="mt-2 text-lg font-semibold">FrameFlow</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {manufacturerNavItems.map((item) => (
          <ManufacturerNavItem key={item.href} href={item.href} label={item.label} icon={item.icon} />
        ))}
      </nav>
    </div>
  );
}
