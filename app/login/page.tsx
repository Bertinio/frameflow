"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") || "/redirect";
  const initialError = useMemo(() => {
    if (searchParams.get("error")) {
      return "Inloggen mislukt. Controleer je e-mail en wachtwoord.";
    }
    return "";
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setIsLoading(false);

    if (!result || result.error) {
      setError("Inloggen mislukt. Controleer je e-mail en wachtwoord.");
      return;
    }

    router.push(result.url || callbackUrl);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-8">
          <header className="mb-8 text-center">
            <Image
              src="/frameflow-logo.png"
              alt="FrameFlow"
              width={420}
              height={112}
              priority
              className="mx-auto h-auto w-56 sm:w-72"
            />
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Inloggen
            </h1>
            <p className="mt-2 text-sm text-white/70 sm:text-base">
              Log in met je FrameFlow-account.
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            aria-label="Inlogformulier"
          >
            <div>
              <label htmlFor="email" className="mb-2 block text-sm text-white/80">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="naam@voorbeeld.nl"
                aria-label="E-mailadres"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white placeholder:text-white/40 outline-none ring-0 transition focus:border-white/30 focus:bg-black/50"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm text-white/80"
              >
                Wachtwoord
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Je wachtwoord"
                aria-label="Wachtwoord"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white placeholder:text-white/40 outline-none ring-0 transition focus:border-white/30 focus:bg-black/50"
              />
            </div>

            {error ? (
              <p
                className="rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
                role="alert"
                aria-live="polite"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              aria-label="Inloggen"
              className="w-full rounded-xl bg-white px-4 py-3 text-base font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Bezig met inloggen..." : "Inloggen"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link
              href="/register"
              className="text-sm text-white/75 underline decoration-white/40 underline-offset-4 transition hover:text-white"
              aria-label="Nog geen account? Registreren"
            >
              Nog geen account? Registreren
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
