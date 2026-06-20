"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function titleCase(segment: string) {
  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function segmentLabel(segment: string) {
  const map: Record<string, string> = {
    installer: "Installer",
    rolluiken: "Rolluiken",
    rolluik: "Rolluiken",
    summary: "Summary",
    settings: "Instellingen",
    pricing: "Pricing",
    quotes: "Offertes",
    start: "Start",
  };

  return map[segment] ?? titleCase(segment);
}

export default function InstallerBreadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  const crumbs = parts.map((segment, index) => {
    const href = `/${parts.slice(0, index + 1).join("/")}`;
    return {
      label: segmentLabel(segment),
      href,
    };
  });

  if (crumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-500">
      <ol className="flex flex-wrap items-center gap-2">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <li key={crumb.href} className="flex items-center gap-2">
              {isLast ? (
                <span className="font-medium text-gray-700">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-gray-700">
                  {crumb.label}
                </Link>
              )}
              {!isLast ? <span>/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
