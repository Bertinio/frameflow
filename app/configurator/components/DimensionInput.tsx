"use client";

type Props = {
  width: number | null;
  height: number | null;
  onChange: (field: "width" | "height", value: number) => void;
};

export default function DimensionsInput({ width, height, onChange }: Props) {
  return (
    <div className="mt-8">
      <p className="mb-4 text-gray-300">Stap 2: Afmetingen</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm text-gray-400">Breedte (cm)</label>
          <input
            type="number"
            value={width ?? ""}
            onChange={(e) => onChange("width", Number(e.target.value))}
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-400">Hoogte (cm)</label>
          <input
            type="number"
            value={height ?? ""}
            onChange={(e) => onChange("height", Number(e.target.value))}
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
          />
        </div>
      </div>
    </div>
  );
}
