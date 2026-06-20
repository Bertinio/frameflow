"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";

type ManufacturerTopbarProps = {
  manufacturerName: string;
  onOpenMobileMenu: () => void;
  logoutAction: () => Promise<void>;
};

export default function ManufacturerTopbar({
  manufacturerName,
  onOpenMobileMenu,
  logoutAction,
}: ManufacturerTopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="rounded-md border border-gray-300 p-2 text-gray-700 hover:bg-gray-100 md:hidden"
            aria-label="Open manufacturer menu"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          <p className="text-sm font-medium text-gray-700">Fabrikant: {manufacturerName}</p>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
