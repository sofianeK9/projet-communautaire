import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";
import { Users, Building2, UserPlus, MapPin, UserX, ArrowRight, ClipboardList } from "lucide-react";
import { DashboardCharts } from "./DashboardCharts";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalPeople, totalMosques, thisMonth, recentPeople, mosquesWithCount, withGeo, withoutMosque, totalSuivi] =
    await Promise.all([
      prisma.person.count(),
      prisma.mosque.count(),
      prisma.person.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.person.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { mosque: true },
      }),
      prisma.mosque.findMany({
        include: { _count: { select: { persons: true } } },
        orderBy: { name: "asc" },
        take: 8,
      }),
      prisma.person.count({ where: { lat: { not: null } } }),
      prisma.person.count({ where: { mosqueId: null } }),
      prisma.ficheSuivi.count(),
    ]);

  const geoCoverage = totalPeople > 0 ? Math.round((withGeo / totalPeople) * 100) : 0;

  const chartData = mosquesWithCount
    .map((m: { name: string; _count: { persons: number } }) => ({
      name: m.name,
      count: m._count.persons,
    }))
    .sort((a, b) => b.count - a.count);

  const stats = [
    {
      label: "Total membres",
      value: totalPeople,
      icon: Users,
      href: "/people",
      border: "border-l-emerald-500",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
    },
    {
      label: "Mosquées",
      value: totalMosques,
      icon: Building2,
      href: "/mosques",
      border: "border-l-blue-500",
      bg: "bg-blue-500/10",
      text: "text-blue-400",
    },
    {
      label: "Ajouts ce mois",
      value: thisMonth,
      icon: UserPlus,
      href: "/people",
      border: "border-l-violet-500",
      bg: "bg-violet-500/10",
      text: "text-violet-400",
    },
    {
      label: "Fiches suivi",
      value: totalSuivi,
      icon: ClipboardList,
      href: "/suivi",
      border: "border-l-cyan-500",
      bg: "bg-cyan-500/10",
      text: "text-cyan-400",
    },
    {
      label: "Sans mosquée",
      value: withoutMosque,
      icon: UserX,
      href: "/people",
      border: "border-l-amber-500",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8 overflow-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
            <p className="text-slate-400 text-sm mt-1">
              Bonjour, <span className="text-slate-300">{session.user?.name || session.user?.email}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/people/new"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-emerald-600/10"
            >
              <UserPlus className="w-4 h-4" />
              Nouveau membre
            </Link>
            <Link
              href="/map"
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition"
            >
              <MapPin className="w-4 h-4" />
              Voir la carte
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.label}
                href={s.href}
                className={`stat-card bg-slate-900 border border-slate-800 border-l-4 ${s.border} rounded-xl p-4 hover:bg-slate-800/60 transition-all duration-200 group`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-lg ${s.bg}`}>
                    <Icon className={`w-4 h-4 ${s.text}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
              </Link>
            );
          })}
        </div>

        {/* GPS coverage bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 text-sm font-medium">Couverture GPS</span>
            </div>
            <span className="text-white font-bold text-sm">{withGeo} / {totalPeople} membres géolocalisés</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-2.5 rounded-full transition-all duration-1000"
              style={{ width: `${geoCoverage}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-slate-500 text-xs">{totalPeople - withGeo} sans coordonnées</span>
            <span className={`text-xs font-semibold ${geoCoverage >= 80 ? "text-emerald-400" : geoCoverage >= 50 ? "text-amber-400" : "text-red-400"}`}>
              {geoCoverage}%
            </span>
          </div>
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Chart */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Membres par mosquée</h2>
              <Link href="/mosques" className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1 transition">
                Gérer <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <DashboardCharts data={chartData} />
          </div>

          {/* Recent people */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Derniers ajouts</h2>
              <Link href="/people/new" className="text-emerald-500 hover:text-emerald-400 text-xs flex items-center gap-1 transition">
                + Ajouter
              </Link>
            </div>
            <div className="space-y-2">
              {recentPeople.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/people/${p.id}`}
                  className="flex items-center justify-between p-3 bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-all duration-200 group stat-card"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center shrink-0">
                      <span className="text-emerald-400 text-xs font-bold">
                        {p.firstName[0]}{p.lastName[0]}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-white text-sm font-medium truncate">
                        {p.firstName} {p.lastName}
                      </div>
                      <div className="text-slate-500 text-xs truncate">
                        {p.mosque ? p.mosque.name : "Sans mosquée"}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 shrink-0 ml-2 transition" />
                </Link>
              ))}
              {recentPeople.length === 0 && (
                <div className="text-slate-500 text-sm text-center py-8">
                  Aucun membre ajouté
                </div>
              )}
            </div>
            {totalPeople > 6 && (
              <Link
                href="/people"
                className="flex items-center justify-center gap-1 mt-4 py-2 bg-slate-800/40 hover:bg-slate-800 text-slate-500 hover:text-slate-300 text-xs rounded-xl transition"
              >
                Voir tous les membres <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
