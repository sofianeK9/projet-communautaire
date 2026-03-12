import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";
import MapViewClient from "@/components/map/MapViewClient";

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const person = await prisma.person.findUnique({
    where: { id },
    include: { mosque: true },
  });
  if (!person) notFound();

  const serialized = {
    ...person,
    createdAt: person.createdAt.toISOString(),
    updatedAt: person.updatedAt.toISOString(),
    mosque: person.mosque
      ? {
          id: person.mosque.id,
          name: person.mosque.name,
          address: person.mosque.address,
          city: person.mosque.city,
          lat: person.mosque.lat,
          lng: person.mosque.lng,
        }
      : null,
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link href="/people" className="text-slate-400 hover:text-slate-300 text-sm mb-2 block">
                ← Retour à la liste
              </Link>
              <h1 className="text-2xl font-bold text-white">
                {person.firstName} {person.lastName}
              </h1>
            </div>
            <Link
              href={`/people/${id}/edit`}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-sm transition"
            >
              Modifier
            </Link>
          </div>

          {/* Info card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Adresse</div>
                <div className="text-white">{person.address}</div>
                <div className="text-slate-300">{person.zipCode} {person.city}</div>
              </div>
              {person.phone && (
                <div>
                  <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Téléphone</div>
                  <div className="text-white">{person.phone}</div>
                </div>
              )}
              {person.email && (
                <div>
                  <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Email</div>
                  <div className="text-white">{person.email}</div>
                </div>
              )}
              <div>
                <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Mosquée</div>
                {person.mosque ? (
                  <div className="text-emerald-400">{person.mosque.name}</div>
                ) : (
                  <div className="text-slate-500">Non renseignée</div>
                )}
              </div>
            </div>
            {person.notes && (
              <div>
                <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Notes</div>
                <div className="text-slate-300 text-sm bg-slate-800 rounded-lg p-3">{person.notes}</div>
              </div>
            )}
            <div className="text-slate-500 text-xs pt-2 border-t border-slate-800">
              Ajouté le {new Date(person.createdAt).toLocaleDateString("fr-FR")} ·
              Modifié le {new Date(person.updatedAt).toLocaleDateString("fr-FR")}
            </div>
          </div>

          {/* Map */}
          {person.lat && person.lng && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800">
                <span className="text-white text-sm font-medium">Position GPS</span>
                <span className="text-slate-400 text-xs ml-2">
                  {person.lat.toFixed(5)}, {person.lng.toFixed(5)}
                </span>
              </div>
              <div style={{ height: 280 }}>
                <MapViewClient people={[serialized]} mosques={[]} height="280px" />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
