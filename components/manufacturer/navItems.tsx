import {
  HomeIcon,
  ArrowUpTrayIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import type { ReactNode } from "react";

export type ManufacturerNavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

export const manufacturerNavItems: ManufacturerNavItem[] = [
  {
    href: "/manufacturer/dashboard",
    label: "Dashboard",
    icon: <HomeIcon className="h-5 w-5" />,
  },
  {
    href: "/manufacturer/products",
    label: "Producten",
    icon: <Squares2X2Icon className="h-5 w-5" />,
  },
  {
    href: "/manufacturer/products/import",
    label: "Importeren",
    icon: <ArrowUpTrayIcon className="h-5 w-5" />,
  },
];
