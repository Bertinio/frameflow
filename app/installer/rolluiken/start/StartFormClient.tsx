"use client";

import { useMemo, useState } from "react";
import { createRolluikDraft } from "./actions";

type LamelTypeOption = {
  id: string;
  name: string;
  pricePerM2: number;
};

type ColorCategoryOption = {
  id: string;
  name: string;
  surchargeType: string;
  surchargeValue: number;
};

type MotorOption = {
  id: string;
  type: string;
  price: number;
};

type Props = {
  lamelTypes: LamelTypeOption[];
  colorCategories: ColorCategoryOption[];
  motors: MotorOption[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function StartFormClient({ lamelTypes, colorCategories, motors }: Props) {
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(1400);
  const [lamelTypeId, setLamelTypeId] = useState(lamelTypes[0]?.id ?? "");
  const [colorId, setColorId] = useState(colorCategories[0]?.id ?? "");
  const [motorId, setMotorId] = useState(motors[0]?.id ?? "");

  const livePricing = useMemo(() => {
    const safeWidth = Number.isFinite(width) && width > 0 ? width : 0;
    const safeHeight = Number.isFinite(height) && height > 0 ? height : 0;
    const oppervlakte = (safeWidth * safeHeight) / 1_000_000;

    const lamel = lamelTypes.find((item) => item.id === lamelTypeId);
    const color = colorCategories.find((item) => item.id === colorId);
    const motor = motors.find((item) => item.id === motorId);

    const basis = oppervlakte * (lamel?.pricePerM2 ?? 0);
    const motorPrijs = motor?.price ?? 0;
    const colorBase = basis + motorPrijs;

    let kleurToeslag = 0;
    if (color) {
      kleurToeslag =
        color.surchargeType === "percent"
          ? colorBase * (color.surchargeValue / 100)
          : color.surchargeValue;
    }

    const fabrikantIndicatie = basis + motorPrijs + kleurToeslag;

    return {
      oppervlakte,
      fabrikantIndicatie,
    };
  }, [width, height, lamelTypeId, colorId, motorId, lamelTypes, colorCategories, motors]);

  return (
    <form action={createRolluikDraft} className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-300">Breedte (mm)</span>
          <input
            name="width"
            type="number"
            min={1}
            value={width}
            onChange={(event) => setWidth(Number(event.target.value || 0))}
            className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none ring-blue-400 focus:ring"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-300">Hoogte (mm)</span>
          <input
            name="height"
            type="number"
            min={1}
            value={height}
            onChange={(event) => setHeight(Number(event.target.value || 0))}
            className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none ring-blue-400 focus:ring"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-300">Lameltype</span>
          <select
            name="lamelTypeId"
            value={lamelTypeId}
            onChange={(event) => setLamelTypeId(event.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none ring-blue-400 focus:ring"
            required
          >
            {lamelTypes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-300">Kleur</span>
          <select
            name="colorId"
            value={colorId}
            onChange={(event) => setColorId(event.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none ring-blue-400 focus:ring"
            required
          >
            {colorCategories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-gray-300">Motor</span>
          <select
            name="motorId"
            value={motorId}
            onChange={(event) => setMotorId(event.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none ring-blue-400 focus:ring"
            required
          >
            {motors.map((item) => (
              <option key={item.id} value={item.id}>
                {item.type}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-3 rounded-xl border border-gray-700 bg-gray-800 p-4 text-sm text-gray-300 md:grid-cols-2">
        <p>
          <span className="font-semibold text-white">Live oppervlakte:</span>{" "}
          {livePricing.oppervlakte.toFixed(2)} m2
        </p>
        <p>
          <span className="font-semibold text-white">Indicatieve fabrikantprijs:</span>{" "}
          {formatCurrency(livePricing.fabrikantIndicatie)}
        </p>
      </div>

      <p className="mt-4 text-sm text-gray-300">Alle velden zijn verplicht.</p>

      <button
        type="submit"
        className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Naar opties
      </button>
    </form>
  );
}
