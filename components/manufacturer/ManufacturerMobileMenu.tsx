"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import ManufacturerNavItem from "@/components/manufacturer/ManufacturerNavItem";
import { manufacturerNavItems } from "@/components/manufacturer/navItems";

type ManufacturerMobileMenuProps = {
  open: boolean;
  onClose: () => void;
  logoutAction: () => Promise<void>;
};

export default function ManufacturerMobileMenu({
  open,
  onClose,
  logoutAction,
}: ManufacturerMobileMenuProps) {
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
          "absolute left-0 top-0 h-full w-72 bg-gray-900 text-white shadow-2xl transition-transform",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-4">
          <p className="text-sm font-semibold">Navigatie</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-gray-800 p-1.5 text-gray-200 hover:bg-gray-700"
            aria-label="Sluit menu"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {manufacturerNavItems.map((item) => (
            <ManufacturerNavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              onNavigate={onClose}
            />
          ))}
        </nav>

        <div className="border-t border-gray-800 px-3 py-4">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-gray-100 hover:bg-gray-700"
            >
              Logout
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
