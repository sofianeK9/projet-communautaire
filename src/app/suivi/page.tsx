import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";
import { SuiviManager } from "./SuiviManager";

export default async function SuiviPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const fiches = await prisma.ficheSuivi.findMany({
    orderBy: { date: "desc" },
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-14 lg:pt-8 bg-slate-950">
        <SuiviManager
          fiches={fiches.map((f) => ({
            ...f,
            date: f.date.toISOString(),
            createdAt: undefined as never,
            updatedAt: undefined as never,
          }))}
        />
      </main>
    </div>
  );
}
