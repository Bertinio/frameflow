"use client";

import { useMemo, useState } from "react";
import { saveConfigurationAsQuoteDraft } from "@/app/installer/calculator/add/actions";
import { calculatePriceWithMargin, roundPrice } from "@/lib/pricing";

const WINDOW_TYPES = ["draairaam", "kipraam", "schuifraam", "deur"];
const COLORS = ["Wit", "Antraciet", "Zwart", "Naturel"];

type InitialConfig = {
  type: string;
  width: number;
  height: number;
  color: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function NewOfferDraftForm({ initialConfig }: { initialConfig?: InitialConfig }) {
  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const initialType = initialConfig?.type && WINDOW_TYPES.includes(initialConfig.type)
    ? initialConfig.type
    : "draairaam";
  const initialWidth = initialConfig?.width && initialConfig.width > 0 ? initialConfig.width : 1200;
  const initialHeight = initialConfig?.height && initialConfig.height > 0 ? initialConfig.height : 1400;
  const initialColor = initialConfig?.color && COLORS.includes(initialConfig.color)
    ? initialConfig.color
    : "Wit";

  const [type, setType] = useState(initialType);
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [color, setColor] = useState(initialColor);

  const pricing = useMemo(() => {
    const baseMap: Record<string, number> = {
      draairaam: 80,
      kipraam: 70,
      schuifraam: 120,
      deur: 150,
    };

    const colorMultiplierMap: Record<string, number> = {
      wit: 1,
      antraciet: 1.08,
      zwart: 1.1,
      naturel: 1.05,
    };

    const safeWidth = Number.isFinite(width) && width > 0 ? width : 0;
    const safeHeight = Number.isFinite(height) && height > 0 ? height : 0;
    const areaM2 = (safeWidth * safeHeight) / 1_000_000;

    const baseTypePrice = baseMap[type] ?? 60;
    const materialBase = areaM2 * 120;
    const colorMultiplier = colorMultiplierMap[color.toLowerCase()] ?? 1;
    const price = roundPrice(baseTypePrice + materialBase * colorMultiplier);
    const { margin, total } = calculatePriceWithMargin(price, 0.15);

    return { price, margin, total };
  }, [type, width, height, color]);

  const optionsPayload = useMemo(() => {
    const optionTags = [
      customerName ? `klant:${customerName}` : "",
      companyName ? `bedrijf:${companyName}` : "",
      customerEmail ? `email:${customerEmail}` : "",
      customerPhone ? `telefoon:${customerPhone}` : "",
    ].filter(Boolean);

    return JSON.stringify(optionTags);
  }, [customerName, companyName, customerEmail, customerPhone]);

  return (
    <form action={saveConfigurationAsQuoteDraft} className="grid gap-6 lg:grid-cols-3">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm shadow-black/10 lg:col-span-1">
        <h2 className="text-2xl font-semibold">Klantgegevens</h2>
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm text-slate-300">Naam</span>
            <input
              name="customerName"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white"
              placeholder="Jan Jansen"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Bedrijf</span>
            <input
              name="companyName"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white"
              placeholder="Jansen Bouw"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">E-mail</span>
            <input
              name="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white"
              placeholder="jan@voorbeeld.nl"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Telefoon</span>
            <input
              name="customerPhone"
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white"
              placeholder="+31 6 12345678"
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm shadow-black/10 lg:col-span-1">
        <h2 className="text-2xl font-semibold">Configuratie</h2>
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm text-slate-300">Raamtype</span>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white"
            >
              {WINDOW_TYPES.map((windowType) => (
                <option key={windowType} value={windowType} className="bg-slate-900 text-white">
                  {windowType}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Breedte (mm)</span>
            <input
              type="number"
              min={1}
              value={width}
              onChange={(event) => setWidth(Number(event.target.value || 0))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Hoogte (mm)</span>
            <input
              type="number"
              min={1}
              value={height}
              onChange={(event) => setHeight(Number(event.target.value || 0))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Kleur</span>
            <select
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white"
            >
              {COLORS.map((itemColor) => (
                <option key={itemColor} value={itemColor} className="bg-slate-900 text-white">
                  {itemColor}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm shadow-black/10 lg:col-span-1">
        <h2 className="text-2xl font-semibold">Prijs</h2>
        <div className="mt-5 space-y-3">
          <Row label="Prijs" value={formatCurrency(pricing.price)} />
          <Row label="Marge" value={formatCurrency(pricing.margin)} />
          <Row label="Totaal" value={formatCurrency(pricing.total)} highlight />
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="w-full rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-black transition hover:bg-sky-400"
          >
            Opslaan als offerteDraft
          </button>
        </div>
      </section>

      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="width" value={String(width)} />
      <input type="hidden" name="height" value={String(height)} />
      <input type="hidden" name="color" value={color} />
      <input type="hidden" name="glass" value="Dubbel glas" />
      <input type="hidden" name="options" value={optionsPayload} />
      <input type="hidden" name="unitPrice" value={pricing.price.toFixed(2)} />
      <input type="hidden" name="totalPrice" value={pricing.total.toFixed(2)} />
    </form>
  );
}

function Row({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${highlight ? "border-sky-300/40 bg-sky-500/10" : "border-white/10 bg-transparent"}`}>
      <span className="text-sm text-slate-300">{label}</span>
      <span className={`font-semibold ${highlight ? "text-white" : "text-slate-100"}`}>{value}</span>
    </div>
  );
}
