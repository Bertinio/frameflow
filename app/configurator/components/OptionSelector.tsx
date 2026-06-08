type Option = {
  id: string;
  label: string;
  price: number; // extra prijs in €
};

type Props = {
  selected: string[];
  onChange: (newSelected: string[]) => void;
};

const OPTIONS: Option[] = [
  { id: "color_black", label: "Zwart gelakt", price: 40 },
  { id: "color_white", label: "Wit gelakt", price: 25 },
  { id: "glass_hr", label: "Hoogrendementsglas", price: 60 },
  { id: "glass_triple", label: "Driedubbel glas", price: 120 },
  { id: "profile_slim", label: "Slank profiel", price: 30 },
];

export default function OptionsSelector({ selected, onChange }: Props) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="mt-8">
      <p className="mb-4 text-gray-300">Stap 3: Extra opties</p>

      <div className="grid grid-cols-1 gap-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => toggle(opt.id)}
            className={`p-4 rounded-xl border transition-all duration-200 text-left
              ${
                selected.includes(opt.id)
                  ? "bg-white text-black border-white scale-[1.02]"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }
            `}
          >
            <div className="font-semibold">{opt.label}</div>
            <div className="text-sm opacity-70">+ €{opt.price}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
