"use client";

import Link from "next/link";
import { useState } from "react";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("installer");
  const [message, setMessage] = useState("");

  async function createUser(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json();
    setMessage(data.message);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000] p-6">
      <div className="w-full max-w-xl bg-white/5 rounded-2xl p-8 backdrop-blur-md border border-white/10 shadow-lg">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-white text-2xl font-semibold">Admin Panel</h2>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Ga naar Dashboard
          </Link>
        </div>

        <form onSubmit={createUser} className="space-y-4">
          <div>
            <label className="block text-white/70 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-white/10 text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3BA9FF]"
              required
            />
          </div>

          <div>
            <label className="block text-white/70 mb-2">Wachtwoord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border border-white/10 text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3BA9FF]"
              required
            />
          </div>

          <div>
            <label className="block text-white/70 mb-2">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-transparent border border-white/10 text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3BA9FF]"
            >
              <option value="installer">Installer</option>
              <option value="importer">Importer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button className="w-full py-3 rounded-md bg-white text-black font-semibold">Gebruiker aanmaken</button>
        </form>

        {message && (
          <div className="mt-4 p-3 bg-white/6 rounded-md text-white">{message}</div>
        )}
      </div>
    </div>
  );
}
