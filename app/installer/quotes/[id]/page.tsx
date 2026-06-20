import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import OfferteDetail from "@/app/installer/quotes/components/OfferteDetail";

type Props = {
  params: {
    id: string;
  };
};

export default async function QuoteDetailsPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "installer") {
    redirect("/login");
  }

  const quoteId = params.id;

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      items: true,
    },
  });

  if (!quote) {
    return (
      <div className="min-h-screen bg-[#030712] text-white px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-10 shadow-lg shadow-black/20">
          <h1 className="text-3xl font-semibold text-white">Offerte niet gevonden</h1>
          <p className="mt-4 text-slate-300">
            De opgevraagde offerte bestaat niet of is niet beschikbaar.
          </p>
          <Link
            href="/installer/quotes"
            className="mt-8 inline-flex rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Terug naar offertes
          </Link>
        </div>
      </div>
    );
  }

  if (quote.installerId !== session.user.id) {
    redirect("/installer/quotes");
  }

  return <OfferteDetail quote={quote} />;
}
