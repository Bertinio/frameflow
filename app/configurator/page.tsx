"use client";

import { useState } from "react";
import WindowTypeSelector from "./components/WindowTypeSelector";
import DimensionsInput from "./components/DimensionInput";
import OptionsSelector from "./components/OptionsSelector";
import Summary from "./components/Summary";

const PRICE_PER_M2 = 120; // basisprijs per m²

const TYPE_MULTIPLIER: Record<string, number> = {
  single: 1,
  double: 1.2,
  triple: 1.35,
  door: 1.5,
};

export default function ConfiguratorPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [options, setOptions] = useState<string[]>([]);

  const area =
    width !== null && height !== null ? (width / 100) * (height / 100) : null;

  const price =
    area && selectedType
      ? area * PRICE_PER_M2 * TYPE_MULTIPLIER[selectedType]
      : null;

  const OPTION_PRICES: Record<string, number> = {
    color_black: 40,
    color_white: 25,
    glass_hr: 60,
    glass_triple: 120,
    profile_slim: 30,
  };

  const OPTION_LABELS: Record<string, string> = {
    color_black: "Zwart gelakt",
    color_white: "Wit gelakt",
    glass_hr: "Hoogrendementsglas",
    glass_triple: "Driedubbel glas",
    profile_slim: "Slank profiel",
  };

  const optionsTotal = options.reduce((sum, id) => sum + OPTION_PRICES[id], 0);

  const finalPrice = price ? price + optionsTotal : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-2xl w-[500px]">
        <h1 className="text-3xl font-bold mb-6">FrameFlow Configurator</h1>

        <p className="mb-4 text-gray-300">Stap 1: Kies je raamtype</p>

        
       
       
       
       
        <WindowTypeSelector value={selectedType} onChange={setSelectedType} />

        {selectedType && (
          <DimensionsInput
            width={width}
            height={height}
            onChange={(field, value) => {
              if (field === "width") setWidth(value);
              if (field === "height") setHeight(value);
            }}
          />
        )}

        {selectedType && (
          <OptionsSelector selected={options} onChange={setOptions} />
        )}

        {options.length > 0 && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/90">
            <p className="font-semibold text-white">Geselecteerde opties</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {options.map((id) => (
                <li key={id}>
                  {OPTION_LABELS[id] ?? id} + €{OPTION_PRICES[id]}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-yellow-300">
              Opties totaal: <strong>€{optionsTotal.toFixed(2)}</strong>
            </p>
          </div>
        )}

        {area && (
          <p className="mt-6 text-blue-400">
            Oppervlakte: <strong>{area.toFixed(2)} m²</strong>
          </p>
        )}

        {finalPrice && (
          <p className="mt-4 text-yellow-300">
            Totaalprijs: € <strong>{finalPrice.toFixed(2)}</strong>
          </p>
        )}

        <Summary
          type={selectedType}
          width={width}
          height={height}
          area={area}
          options={options}
          finalPrice={finalPrice}
        />

        {selectedType && (
          <p className="mt-6 text-green-400">
            Gekozen type: <strong>{selectedType}</strong>
          </p>
        )}
      </div>
    </div>
  );
}