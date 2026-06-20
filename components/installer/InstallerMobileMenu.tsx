"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import InstallerNavItem from "@/components/installer/InstallerNavItem";
import { installerNavItems } from "@/components/installer/navItems";

type InstallerMobileMenuProps = {
  open: boolean;
  onClose: () => void;
  logoutAction: () => Promise<void>;
};

export default function InstallerMobileMenu({
  open,
  onClose,
  logoutAction,
}: InstallerMobileMenuProps) {
  return (
    <div
      className={[
        "fixed inset-0 z-50 md:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      aria-hidden={!open}
    >
      <div
        className={[
          "absolute inset-0 bg-black/50 transition-opacity",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onClose}
      />

      <aside
        className={[
          "absolute left-0 top-0 h-full w-72 border-r border-white/10 bg-black text-white shadow-2xl transition-transform",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <p className="text-sm font-semibold">Navigatie</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/10 bg-white/5 p-1.5 text-white/85 hover:bg-white/10"
            aria-label="Sluit menu"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {installerNavItems.map((item) => (
            <InstallerNavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              onNavigate={onClose}
            />
          ))}
        </nav>

        <div className="border-t border-white/10 px-3 py-4">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
            >
              Logout
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
