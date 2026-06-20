"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Crumb = {
  label: string;
  href: string;
  current?: boolean;
};

const LABELS: Record<string, string> = {
  installateur: "Installateur",
  dashboard: "Dashboard",
  offertes: "Offertes",
  nieuw: "Nieuw",
  bestellingen: "Bestellingen",
  settings: "Instellingen",
  login: "Login",
};

function toLabel(segment: string) {
  return LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

export default function InstallerBreadcrumbs() {
  const pathname = usePathname();

  if (!pathname) {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);
  const installateurIndex = segments.indexOf("installateur");
  const crumbs: Crumb[] = [];

  if (installateurIndex !== -1) {
    const baseHref = "/installateur";
    crumbs.push({ label: "Installateur", href: baseHref });

    let currentHref = baseHref;

    segments.slice(installateurIndex + 1).forEach((segment, index, arr) => {
      currentHref += `/${segment}`;
      crumbs.push({
        label: toLabel(segment),
        href: currentHref,
        current: index === arr.length - 1,
      });
    });
  }

  if (crumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumbs" className="border-b border-white/10 bg-[#030712]/70 px-6 py-3 backdrop-blur md:px-8">
      <ol className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 text-sm text-slate-400">
        {crumbs.map((crumb, index) => (
          <li key={`${crumb.href}-${crumb.label}`} className="flex items-center gap-2">
            {index > 0 ? <span className="text-slate-600">/</span> : null}
            {crumb.current ? (
              <span className="font-semibold text-white">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="transition hover:text-white">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
