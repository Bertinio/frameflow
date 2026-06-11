"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

 async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  await signIn("credentials", {
    email,
    password,
    redirect: true,
    callbackUrl: "/redirect",
  });
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000]">
      <div
        className="relative w-full max-w-md p-8 rounded-2xl backdrop-blur-md"
        style={{
          backgroundColor: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow:
            "0 8px 30px rgba(0,0,0,0.6), 0 2px 18px rgba(59,169,255,0.06)",
        }}
      >
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <img
            src="/logo-frameflow.svg"
            alt="FrameFlow"
            className="h-12 w-auto filter brightness-0 invert"
          />

          <h1 className="text-white text-2xl font-semibold">Installer Login</h1>

          <form className="w-full mt-2" onSubmit={handleLogin}>
            <label className="block text-sm text-white/70 mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-white/10 placeholder-white/50 text-white py-3 px-4 rounded-md transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-[#3BA9FF] hover:scale-[1.01]"
              placeholder="naam@voorbeeld.nl"
            />

            <label className="block text-sm text-white/70 mt-4 mb-2">Wachtwoord</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border border-white/10 placeholder-white/50 text-white py-3 px-4 rounded-md transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-[#3BA9FF] hover:scale-[1.01]"
              placeholder="••••••••"
            />

            <button
              type="submit"
              className="w-full mt-6 py-3 rounded-md bg-white text-black font-semibold shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5"
            >
              Inloggen
            </button>
          </form>

          <p className="text-white/70 text-sm mt-3">
            Nog geen account? {" "}
            <Link href="/register" className="text-[#3BA9FF] hover:underline">
              Account aanvragen
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
