"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { PersonWithMosque, MosqueBasic } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Download, Search, Users, Eye, Pencil, Trash2 } from "lucide-react";

interface Props {
  people: PersonWithMosque[];
  total: number;
  page: number;
  limit: number;
  mosques: MosqueBasic[];
  search: string;
  mosqueId: string;
}

export function PeopleTable({ people, total, page, limit, mosques, search: initialSearch, mosqueId: initialMosqueId }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState(initialSearch);
  const [mosqueId, setMosqueId] = useState(initialMosqueId);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const applyFilters = useCallback((newSearch: string, newMosqueId: string, newPage = 1) => {
    const params = new URLSearchParams();
    if (newSearch) params.set("search", newSearch);
    if (newMosqueId) params.set("mosqueId", newMosqueId);
    if (newPage > 1) params.set("page", String(newPage));
    router.push(`/people?${params.toString()}`);
  }, [router]);

  function handleSearch(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => applyFilters(value, mosqueId), 350);
  }

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  async function doDelete() {
    if (!confirmDelete) return;
    setDeleting(confirmDelete.id);
    setConfirmDelete(null);
    const res = await fetch(`/api/people/${confirmDelete.id}`, { method: "DELETE" });
    if (res.ok) {
      toast(`${confirmDelete.name} supprimé`, "success");
      router.refresh();
    } else {
      toast("Erreur lors de la suppression", "error");
    }
    setDeleting(null);
  }

  function exportCSV() {
    const headers = ["Prénom", "Nom", "Adresse", "Code postal", "Ville", "Téléphone", "Email", "Mosquée", "GPS"];
    const rows = people.map((p) => [
      p.firstName, p.lastName, p.address, p.zipCode, p.city,
      p.phone ?? "", p.email ?? "", p.mosque?.name ?? "", p.lat ? "Oui" : "Non",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `membres_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Export CSV téléchargé", "success");
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Membres <span className="text-slate-500 text-base sm:text-lg font-normal">({total})</span>
        </h1>
        <div className="flex gap-2 w-full sm:w-auto">
          {people.length > 0 && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-xl transition"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}
          <Link
            href="/people/new"
            className="flex-1 sm:flex-none text-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-600/10"
          >
            + Ajouter
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher nom, prénom, adresse..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-sm transition"
          />
        </div>
        <select
          value={mosqueId}
          onChange={(e) => {
            setMosqueId(e.target.value);
            applyFilters(search, e.target.value);
          }}
          className="w-full sm:w-auto px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
        >
          <option value="">Toutes les mosquées</option>
          {mosques.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-4 py-3 text-slate-400 text-xs font-medium uppercase tracking-wide">Nom</th>
              <th className="text-left px-4 py-3 text-slate-400 text-xs font-medium uppercase tracking-wide">Adresse</th>
              <th className="text-left px-4 py-3 text-slate-400 text-xs font-medium uppercase tracking-wide">Mosquée</th>
              <th className="text-left px-4 py-3 text-slate-400 text-xs font-medium uppercase tracking-wide">GPS</th>
              <th className="text-right px-4 py-3 text-slate-400 text-xs font-medium uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {people.map((p, i) => (
              <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors table-row" style={{ animationDelay: `${i * 30}ms` }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center shrink-0">
                      <span className="text-emerald-400 text-[10px] font-bold">{p.firstName[0]}{p.lastName[0]}</span>
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">{p.firstName} {p.lastName}</div>
                      {p.phone && <div className="text-slate-500 text-xs mt-0.5">{p.phone}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-slate-300 text-sm">{p.address}</div>
                  <div className="text-slate-500 text-xs">{p.zipCode} {p.city}</div>
                </td>
                <td className="px-4 py-3">
                  {p.mosque ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-600/20 text-emerald-400 border border-emerald-600/30">
                      {p.mosque.name}
                    </span>
                  ) : (
                    <span className="text-slate-600 text-sm">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {p.lat ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-600/15 text-emerald-400">
                      ✓ GPS
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-500">
                      ✗
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/people/${p.id}`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg transition"
                    >
                      Voir
                    </Link>
                    <Link
                      href={`/people/${p.id}/edit`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg transition"
                    >
                      Modifier
                    </Link>
                    <button
                      onClick={() => setConfirmDelete({ id: p.id, name: `${p.firstName} ${p.lastName}` })}
                      disabled={deleting === p.id}
                      className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/60 text-red-400 text-xs rounded-lg transition disabled:opacity-60"
                    >
                      {deleting === p.id ? "..." : "Supprimer"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {people.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    icon={Users}
                    title="Aucun membre trouvé"
                    description={search ? "Essayez avec d'autres termes de recherche" : "Ajoutez votre premier membre pour commencer"}
                    action={
                      !search ? (
                        <Link href="/people/new" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-xl transition">
                          + Ajouter un membre
                        </Link>
                      ) : undefined
                    }
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {people.map((p, i) => (
          <div
            key={p.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 stat-card"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center shrink-0">
                  <span className="text-emerald-400 text-xs font-bold">{p.firstName[0]}{p.lastName[0]}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-white font-medium text-sm truncate">{p.firstName} {p.lastName}</div>
                  <div className="text-slate-500 text-xs truncate">{p.address}, {p.zipCode} {p.city}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {p.lat ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-600/15 text-emerald-400">GPS</span>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {p.mosque && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-600/20 text-emerald-400 border border-emerald-600/30">
                  {p.mosque.name}
                </span>
              )}
              {p.phone && (
                <span className="text-slate-400 text-xs">{p.phone}</span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
              <Link
                href={`/people/${p.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg transition"
              >
                <Eye className="w-3.5 h-3.5" /> Voir
              </Link>
              <Link
                href={`/people/${p.id}/edit`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg transition"
              >
                <Pencil className="w-3.5 h-3.5" /> Modifier
              </Link>
              <button
                onClick={() => setConfirmDelete({ id: p.id, name: `${p.firstName} ${p.lastName}` })}
                disabled={deleting === p.id}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-900/30 hover:bg-red-900/60 text-red-400 text-xs rounded-lg transition disabled:opacity-60"
              >
                <Trash2 className="w-3.5 h-3.5" /> {deleting === p.id ? "..." : "Suppr."}
              </button>
            </div>
          </div>
        ))}
        {people.length === 0 && (
          <EmptyState
            icon={Users}
            title="Aucun membre trouvé"
            description={search ? "Essayez avec d'autres termes de recherche" : "Ajoutez votre premier membre pour commencer"}
            action={
              !search ? (
                <Link href="/people/new" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-xl transition">
                  + Ajouter un membre
                </Link>
              ) : undefined
            }
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
          <span className="text-slate-400 text-sm">
            Page {page} sur {totalPages} · {total} résultats
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <button
                onClick={() => applyFilters(search, mosqueId, page - 1)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-xl transition"
              >
                ← Précédent
              </button>
            )}
            {page < totalPages && (
              <button
                onClick={() => applyFilters(search, mosqueId, page + 1)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-xl transition"
              >
                Suivant →
              </button>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title="Supprimer le membre"
        message={`Êtes-vous sûr de vouloir supprimer ${confirmDelete?.name} ? Cette action est irréversible.`}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
