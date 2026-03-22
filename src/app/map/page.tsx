import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";
import MapViewClient from "@/components/map/MapViewClient";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [people, mosques] = await Promise.all([
    prisma.person.findMany({ include: { mosque: true } }),
    prisma.mosque.findMany(),
  ]);

  const withGeo = people.filter((p) => p.lat && p.lng).length;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-0">
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-slate-900 border-b border-slate-800 shrink-0 pl-14 lg:pl-6">
          <h1 className="text-base sm:text-lg font-bold text-white">Carte des membres</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            {withGeo} géolocalisé{withGeo > 1 ? "s" : ""} ·{" "}
            <span className="text-emerald-400">●</span> mosquée ·{" "}
            <span className="text-blue-400">●</span> sans
          </p>
        </div>
        <div className="flex-1 min-h-0">
          <MapViewClient
            people={people.map((p) => ({
              ...p,
              createdAt: p.createdAt.toISOString(),
              updatedAt: p.updatedAt.toISOString(),
              mosque: p.mosque
                ? {
                    id: p.mosque.id,
                    name: p.mosque.name,
                    address: p.mosque.address,
                    city: p.mosque.city,
                    lat: p.mosque.lat,
                    lng: p.mosque.lng,
                  }
                : null,
            }))}
            mosques={mosques}
            height="100%"
          />
        </div>
      </main>
    </div>
  );
}
