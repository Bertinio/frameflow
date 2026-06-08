"use client";

type SummaryProps = {
  type: string | null;
  width: number | null;
  height: number | null;
  area: number | null;
  options: string[];
  finalPrice: number | null;
};

const OPTION_LABELS: Record<string, string> = {
  color_black: "Zwart gelakt",
  color_white: "Wit gelakt",
  glass_hr: "Hoogrendementsglas",
  glass_triple: "Driedubbel glas",
  profile_slim: "Slank profiel",
};

export default function Summary({
  type,
  width,
  height,
  area,
  options,
  finalPrice,
}: SummaryProps) {
  if (!type || !width || !height || !area || !finalPrice) return null;

  return (
    <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 text-white">
      <h2 className="text-xl font-semibold mb-4">Samenvatting</h2>

      <div className="space-y-2 text-sm">
        <p>
          <strong>Type:</strong> {type}
        </p>

        <p>
          <strong>Afmetingen:</strong> {width} cm × {height} cm
        </p>

        <p>
          <strong>Oppervlakte:</strong> {area.toFixed(2)} m²
        </p>

        {options.length > 0 && (
          <div>
            <p className="font-semibold">Opties:</p>
            <ul className="list-disc list-inside ml-4">
              {options.map((opt) => (
                <li key={opt}>{OPTION_LABELS[opt]}</li>
              ))}
            </ul>
          </div>
        )}

        <p>
          <strong>Totaalprijs:</strong> € {finalPrice.toFixed(2)}
        </p>
      </div>
    </section>
  );
}
