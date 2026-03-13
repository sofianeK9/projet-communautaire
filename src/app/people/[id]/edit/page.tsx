import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";
import PersonForm from "@/components/people/PersonForm";
import Link from "next/link";

export default async function EditPersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const [person, mosques] = await Promise.all([
    prisma.person.findUnique({ where: { id }, include: { mosque: true } }),
    prisma.mosque.findMany({ orderBy: { name: "asc" } }),
  ]);
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
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-14 lg:pt-8">
        <div className="max-w-2xl">
          <Link href={`/people/${id}`} className="text-slate-400 hover:text-slate-300 text-sm mb-4 block">
            ← Retour à la fiche
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-6">
            Modifier — {person.firstName} {person.lastName}
          </h1>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6">
            <PersonForm person={serialized} mosques={mosques} />
          </div>
        </div>
      </main>
    </div>
  );
}
