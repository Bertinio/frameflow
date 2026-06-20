"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";

type InstallerTopbarProps = {
  installerName: string;
  onOpenMobileMenu: () => void;
  logoutAction: () => Promise<void>;
};

export default function InstallerTopbar({
  installerName,
  onOpenMobileMenu,
  logoutAction,
}: InstallerTopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black shadow">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="rounded-md border border-white/10 bg-white/5 p-2 text-white/85 hover:bg-white/10 md:hidden"
            aria-label="Open menu"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">FrameFlow</p>
            <p className="text-sm font-semibold text-white">{installerName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p className="hidden text-sm font-medium text-white/70 sm:block">
            Account: {installerName}
          </p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/85 hover:bg-white/10"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
