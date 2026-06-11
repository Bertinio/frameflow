"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type AllParams = {
  quoteId?: string;
  type: string;
  width: number;
  height: number;
  color?: string;
  glass?: string;
  options?: string[] | string;
  unitPrice?: number;
  totalPrice?: number;
};

export default function AddToQuoteButton({ allParams }: { allParams: AllParams }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/quotes/add-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allParams),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Add to quote failed:", text);
        alert("Kon raam niet toevoegen aan offerte");
        setLoading(false);
        return;
      }

      // redirect to current quote page
      router.push("/installer/quotes/current");
    } catch (err) {
      console.error(err);
      alert("Fout bij toevoegen aan offerte");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-3xl bg-sky-500 px-6 py-4 text-lg font-semibold text-black transition hover:bg-sky-400"
    >
      {loading ? "Toevoegen..." : "Raam toevoegen aan offerte"}
    </button>
  );
}
