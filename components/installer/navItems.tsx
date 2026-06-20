import {
  Cog6ToothIcon,
  CubeTransparentIcon,
  HomeIcon,
  QueueListIcon,
} from "@heroicons/react/24/outline";
import type { ReactNode } from "react";

export type InstallerNavConfig = {
  href: string;
  label: string;
  icon: ReactNode;
};

export const installerNavItems: InstallerNavConfig[] = [
  {
    href: "/installer/dashboard",
    label: "Dashboard",
    icon: <HomeIcon className="h-5 w-5" />,
  },
  {
    href: "/installer/orders",
    label: "Offertes & orders",
    icon: <QueueListIcon className="h-5 w-5" />,
  },
  {
    href: "/installer/calculator",
    label: "Productconfigurator",
    icon: <CubeTransparentIcon className="h-5 w-5" />,
  },
  {
    href: "/installer/settings",
    label: "Instellingen",
    icon: <Cog6ToothIcon className="h-5 w-5" />,
  },
];
