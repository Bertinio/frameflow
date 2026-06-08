"use client";

import type { ReactNode } from "react";

type WindowType = {
  id: string;
  name: string;
  icon: ReactNode;
};

type Props = {
  value: string | null;
  onChange: (id: string) => void;
};

const windowTypes: WindowType[] = [
  {
    id: "single",
    name: "Enkel raam",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <line x1="12" y1="5" x2="12" y2="19" />
      </svg>
    ),
  },
  {
    id: "double",
    name: "Dubbel raam",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="6" y1="5" x2="6" y2="19" />
      </svg>
    ),
  },
  {
    id: "triple",
    name: "Driedelig raam",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="8" y1="5" x2="8" y2="19" />
        <line x1="16" y1="5" x2="16" y2="19" />
      </svg>
    ),
  },
  {
    id: "door",
    name: "Schuifdeur",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <line x1="12" y1="4" x2="12" y2="20" />
        <circle cx="16" cy="12" r="1" />
      </svg>
    ),
  },
];

export default function WindowTypeSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {windowTypes.map((type) => (
        <button
          key={type.id}
          onClick={() => onChange(type.id)}
          className={`p-4 rounded-xl border transition-all duration-200 transform
            ${
              value === type.id
                ? "bg-white text-black border-white scale-[1.03]"
                : "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:scale-[1.02]"
            }
          `}
        >
          <div className="text-white/90">{type.icon}</div>
          <div className="text-lg font-semibold">{type.name}</div>
        </button>
      ))}
    </div>
  );
}