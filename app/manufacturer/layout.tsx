import type { ReactNode } from "react";
import { logoutManufacturer } from "@/app/manufacturer/actions";
import { requireManufacturerContext } from "@/app/manufacturer/_lib";
import ManufacturerLayoutClient from "@/components/manufacturer/ManufacturerLayoutClient";

export default async function ManufacturerLayout({ children }: { children: ReactNode }) {
  const { manufacturer } = await requireManufacturerContext();

  return (
    <ManufacturerLayoutClient
      manufacturerName={manufacturer.name}
      logoutAction={logoutManufacturer}
    >
      {children}
    </ManufacturerLayoutClient>
  );
}
