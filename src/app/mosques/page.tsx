import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";
import { MosquesManager } from "./MosquesManager";

export default async function MosquesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const mosques = await prisma.mosque.findMany({
    include: { _count: { select: { persons: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-14 lg:pt-8">
        <MosquesManager
          mosques={mosques.map((m) => ({
            id: m.id,
            name: m.name,
            address: m.address,
            city: m.city,
            lat: m.lat,
            lng: m.lng,
            mawaqitId: m.mawaqitId,
            personCount: m._count.persons,
          }))}
        />
      </main>
    </div>
  );
}
