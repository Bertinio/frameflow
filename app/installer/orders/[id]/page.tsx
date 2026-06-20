import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import OrderDetail from "@/app/installer/orders/components/OrderDetail";

type Props = {
  params: {
    id: string;
  };
};

export default async function OrderDetailsPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "installer") {
    redirect("/installateur/login");
  }

  const orderId = params.id;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      installer: true,
      items: true,
    },
  });

  if (!order) {
    return (
      <div className="min-h-screen bg-[#030712] text-white px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-10 shadow-lg shadow-black/20">
          <h1 className="text-3xl font-semibold text-white">Order niet gevonden</h1>
          <p className="mt-4 text-slate-300">
            De opgevraagde order bestaat niet of is niet beschikbaar.
          </p>
          <Link
            href="/installer/dashboard"
            className="mt-8 inline-flex rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Terug naar dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <OrderDetail order={order} />;
}
