"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type InstallerNavItemProps = {
  href: string;
  label: string;
  icon: ReactNode;
  onNavigate?: () => void;
};

function isPathActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function InstallerNavItem({
  href,
  label,
  icon,
  onNavigate,
}: InstallerNavItemProps) {
  const pathname = usePathname();
  const active = isPathActive(pathname, href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={[
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
        active
          ? "border border-white/10 bg-white/10 text-white"
          : "text-white/75 hover:bg-white/5 hover:text-white",
      ].join(" ")}
      aria-current={active ? "page" : undefined}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center text-white/75">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
