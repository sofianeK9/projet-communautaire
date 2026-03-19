import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";
import { SuiviManager } from "./SuiviManager";

const LIMIT = 30;

export default async function SuiviPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const search = params.search || "";
  const skip = (page - 1) * LIMIT;

  const where = search
    ? {
        OR: [
          { nom: { contains: search, mode: "insensitive" as const } },
          { prenom: { contains: search, mode: "insensitive" as const } },
          { telephone: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [fiches, total] = await Promise.all([
    prisma.ficheSuivi.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take: LIMIT,
      select: {
        id: true,
        nom: true,
        prenom: true,
        genre: true,
        mosqueeAssidument: true,
        frequenceTaalim: true,
        participationActivite: true,
        sortieHomme: true,
        sortieFemme: true,
        presenceTaalimNissa: true,
        situationFamiliale: true,
        nombreEnfants: true,
        telephone: true,
        divers: true,
        date: true,
      },
    }),
    prisma.ficheSuivi.count({ where }),
  ]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-14 lg:pt-8 bg-slate-950">
        <SuiviManager
          fiches={fiches.map((f) => ({ ...f, date: f.date.toISOString() }))}
          total={total}
          page={page}
          limit={LIMIT}
          search={search}
        />
      </main>
    </div>
  );
}
