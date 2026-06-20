"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type ManufacturerNavItemProps = {
  href: string;
  label: string;
  icon: ReactNode;
  onNavigate?: () => void;
};

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function ManufacturerNavItem({
  href,
  label,
  icon,
  onNavigate,
}: ManufacturerNavItemProps) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={[
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
        active
          ? "bg-gray-700 text-white"
          : "text-gray-300 hover:bg-gray-800 hover:text-white",
      ].join(" ")}
      aria-current={active ? "page" : undefined}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center text-gray-300">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
