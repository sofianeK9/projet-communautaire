import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SuiviEditForm } from "./SuiviEditForm";

export default async function SuiviEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const fiche = await prisma.ficheSuivi.findUnique({ where: { id } });
  if (!fiche) notFound();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-14 lg:pt-8 bg-slate-950">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <Link
              href={`/suivi/${id}`}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Modifier la fiche</h1>
              <p className="text-slate-500 text-sm">{fiche.prenom} {fiche.nom}</p>
            </div>
          </div>

          <SuiviEditForm
            fiche={{
              id: fiche.id,
              nom: fiche.nom,
              prenom: fiche.prenom,
              genre: fiche.genre,
              mosqueeAssidument: fiche.mosqueeAssidument,
              frequenceTaalim: fiche.frequenceTaalim,
              participationActivite: fiche.participationActivite,
              sortieHomme: fiche.sortieHomme,
              sortieFemme: fiche.sortieFemme,
              presenceTaalimNissa: fiche.presenceTaalimNissa,
              situationFamiliale: fiche.situationFamiliale,
              nombreEnfants: fiche.nombreEnfants,
              telephone: fiche.telephone,
              divers: fiche.divers,
              date: fiche.date.toISOString().slice(0, 10),
            }}
          />
        </div>
      </main>
    </div>
  );
}
