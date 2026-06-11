"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Actions({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function submitQuote() {
    setLoading(true);
    const res = await fetch("/api/quotes/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteId }),
    });
    setLoading(false);
    if (res.ok) {
      router.push(`/installer/quotes/${quoteId}`);
    } else {
      alert("Kon offerte niet opslaan");
    }
  }

  async function createOrder() {
    setLoading(true);
    const res = await fetch("/api/orders/create-from-quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteId }),
    });
    setLoading(false);
    if (res.ok) {
      const json = await res.json();
      router.push(`/installer/orders/${json.orderId}`);
    } else {
      alert("Kon order niet aanmaken");
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => router.push("/installer/calculator/type")}
        className="inline-flex items-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-sky-400"
      >
        Nog een raam toevoegen
      </button>

      <button
        onClick={submitQuote}
        disabled={loading}
        className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
      >
        Offerte opslaan
      </button>

      <button
        onClick={createOrder}
        disabled={loading}
        className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
      >
        Order aanmaken
      </button>
    </div>
  );
}
