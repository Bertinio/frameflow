import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import NewOfferDraftForm from "../NewOfferDraftForm";

type Props = {
  params: {
    draftId: string;
  };
};

export default async function NewInstallateurOfferFromDraftPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/installateur/login");
  }

  const draftId = String(params.draftId ?? "").trim();

  if (!draftId) {
    redirect("/installateur/offertes/nieuw");
  }

  const draft = await prisma.configDraft.findFirst({
    where: {
      id: draftId,
      installerId: session.user.id,
    },
    select: {
      id: true,
      type: true,
      width: true,
      height: true,
      color: true,
    },
  });

  if (!draft) {
    redirect("/installateur/offertes/nieuw");
  }

  return (
    <div className="min-h-screen bg-[#030712] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Offertes</p>
          <h1 className="mt-4 text-4xl font-semibold">Nieuwe offerte uit draft</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Draft {draft.id.slice(0, 8)} geladen. Controleer en vul alle velden in het formulier aan.
          </p>
        </header>

        <NewOfferDraftForm
          initialConfig={{
            type: draft.type,
            width: draft.width,
            height: draft.height,
            color: draft.color,
          }}
        />
      </div>
    </div>
  );
}
