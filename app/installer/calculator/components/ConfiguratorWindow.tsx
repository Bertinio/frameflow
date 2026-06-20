"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const WINDOW_TYPES = ["Draairaam", "Kipraam", "Schuifraam", "Deur"];
const COLORS = ["Wit", "Antraciet", "Zwart", "Naturel"];

export default function ConfiguratorWindow() {
  const router = useRouter();
  const [windowType, setWindowType] = useState(WINDOW_TYPES[0]);
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(1400);
  const [color, setColor] = useState(COLORS[0]);

  const canContinue = useMemo(() => width > 0 && height > 0, [width, height]);

  function handleStart() {
    if (!canContinue) {
      return;
    }

    const params = new URLSearchParams({
      type: windowType.toLowerCase(),
      width: String(width),
      height: String(height),
      color,
    });

    router.push(`/installer/calculator/glass?${params.toString()}`);
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-sm shadow-black/10">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Snel configureren</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Configurator Window</h2>
        <p className="mt-2 text-slate-400">
          Kies raamtype, breedte, hoogte en kleur om meteen te starten.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col">
          <span className="text-sm text-slate-300">Raamtype</span>
          <select
            value={windowType}
            onChange={(event) => setWindowType(event.target.value)}
            className="mt-2 rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white"
          >
            {WINDOW_TYPES.map((type) => (
              <option key={type} value={type} className="bg-slate-900 text-white">
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-slate-300">Kleur</span>
          <select
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className="mt-2 rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white"
          >
            {COLORS.map((itemColor) => (
              <option key={itemColor} value={itemColor} className="bg-slate-900 text-white">
                {itemColor}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-slate-300">Breedte (mm)</span>
          <input
            type="number"
            min={1}
            value={width}
            onChange={(event) => setWidth(Number(event.target.value || 0))}
            className="mt-2 rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-slate-300">Hoogte (mm)</span>
          <input
            type="number"
            min={1}
            value={height}
            onChange={(event) => setHeight(Number(event.target.value || 0))}
            className="mt-2 rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white"
          />
        </label>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={handleStart}
          disabled={!canContinue}
          className="rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-black transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Start configuratie
        </button>
      </div>
    </section>
  );
}
