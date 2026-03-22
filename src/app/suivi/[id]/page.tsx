import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

function Badge({ value, yes = "Oui", no = "Non" }: { value: boolean; yes?: string; no?: string }) {
  return value ? (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-600/20 text-emerald-400 border border-emerald-600/30">
      ✓ {yes}
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/60 text-slate-400">
      — {no}
    </span>
  );
}

function FreqBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-slate-500">—</span>;
  const color =
    value === "Quotidien" ? "bg-emerald-600/20 text-emerald-400 border-emerald-600/30" :
    value === "Plusieurs fois/semaine" ? "bg-blue-600/20 text-blue-400 border-blue-600/30" :
    value === "Hebdomadaire" ? "bg-violet-600/20 text-violet-400 border-violet-600/30" :
    value === "Occasionnel" ? "bg-amber-600/20 text-amber-400 border-amber-600/30" :
    "bg-red-600/20 text-red-400 border-red-600/30";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
      {value}
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-slate-800 gap-4">
      <span className="text-slate-500 text-sm shrink-0">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h2 className="text-slate-300 text-xs font-semibold uppercase tracking-widest mb-1">{title}</h2>
      <div>{children}</div>
    </div>
  );
}

export default async function SuiviDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const fiche = await prisma.ficheSuivi.findUnique({ where: { id } });
  if (!fiche) notFound();

  const date = fiche.date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const isFemme = fiche.genre === "Femme";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-14 lg:pt-8 bg-slate-950">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/suivi"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">{fiche.prenom} {fiche.nom}</h1>
              <p className="text-slate-500 text-sm">Fiche du {date}</p>
            </div>
          </div>
          <Link
            href={`/suivi/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition"
          >
            <Pencil className="w-4 h-4" />
            <span className="hidden sm:inline">Modifier</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
          {/* Identité */}
          <Section title="Identité">
            <Row label="Nom complet">
              <span className="text-white font-medium">{fiche.prenom} {fiche.nom}</span>
            </Row>
            <Row label="Genre">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${isFemme ? "bg-pink-600/20 text-pink-400 border-pink-600/30" : "bg-blue-600/20 text-blue-400 border-blue-600/30"}`}>
                {fiche.genre}
              </span>
            </Row>
            <Row label="Téléphone">
              {fiche.telephone
                ? <a href={`tel:${fiche.telephone}`} className="text-emerald-400 hover:underline text-sm">{fiche.telephone}</a>
                : <span className="text-slate-500">—</span>
              }
            </Row>
            <Row label="Date de suivi">
              <span className="text-slate-300 text-sm">{date}</span>
            </Row>
          </Section>

          {/* Situation familiale */}
          <Section title="Situation familiale">
            <Row label="Situation">
              <span className="text-slate-300 text-sm">{fiche.situationFamiliale ?? "—"}</span>
            </Row>
            <Row label="Avec enfant(s)">
              {fiche.nombreEnfants != null
                ? <span className="text-white font-medium">{fiche.nombreEnfants} enfant{fiche.nombreEnfants !== 1 ? "s" : ""}</span>
                : <span className="text-slate-500">Non</span>
              }
            </Row>
          </Section>

          {/* Pratique religieuse */}
          <Section title="Pratique religieuse">
            <Row label="Fréquente la mosquée assidûment">
              <Badge value={fiche.mosqueeAssidument} />
            </Row>
            <Row label="Fréquence du ta'alim">
              <FreqBadge value={fiche.frequenceTaalim} />
            </Row>
            <Row label="Présence ta'alim nissa">
              <Badge value={fiche.presenceTaalimNissa} />
            </Row>
          </Section>

          {/* Activités */}
          <Section title="Activités & Sorties">
            <Row label="Participe à une activité">
              <Badge value={fiche.participationActivite} />
            </Row>
            <Row label="Sortie homme">
              <Badge value={fiche.sortieHomme} />
            </Row>
            <Row label="Sortie femme">
              <Badge value={fiche.sortieFemme} />
            </Row>
          </Section>

          {/* Divers */}
          <div className="lg:col-span-2">
            <Section title="Divers">
              <p className="text-slate-300 text-sm pt-2 leading-relaxed">{fiche.divers || "—"}</p>
            </Section>
          </div>
        </div>
      </main>
    </div>
  );
}
