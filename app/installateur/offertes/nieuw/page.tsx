import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import NewOfferDraftForm from "./NewOfferDraftForm";

export default async function NewInstallateurOfferPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/installateur/login");
  }

  return (
    <div className="min-h-screen bg-[#030712] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Offertes</p>
          <h1 className="mt-4 text-4xl font-semibold">Nieuwe offerte</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Vul klantgegevens in, configureer het raam en controleer de prijs voor je de offerte als draft opslaat.
          </p>
        </header>

        <NewOfferDraftForm />
      </div>
    </div>
  );
}
