import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";
import { PeopleTable } from "./PeopleTable";

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; mosqueId?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const params = await searchParams;
  const search = params.search || "";
  const mosqueId = params.mosqueId || "";
  const page = parseInt(params.page || "1");
  const limit = 25;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
    ];
  }
  if (mosqueId) where.mosqueId = mosqueId;

  const [people, total, mosques] = await Promise.all([
    prisma.person.findMany({
      where,
      include: { mosque: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.person.count({ where }),
    prisma.mosque.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-14 lg:pt-8">
        <PeopleTable
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
          total={total}
          page={page}
          limit={limit}
          mosques={mosques}
          search={search}
          mosqueId={mosqueId}
        />
      </main>
    </div>
  );
}
