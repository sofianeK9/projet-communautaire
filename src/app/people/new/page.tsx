import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";
import PersonForm from "@/components/people/PersonForm";

export default async function NewPersonPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const mosques = await prisma.mosque.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-white mb-6">Ajouter un membre</h1>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <PersonForm mosques={mosques} />
          </div>
        </div>
      </main>
    </div>
  );
}
