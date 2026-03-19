"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import { Download, Search, ClipboardList, Pencil, Trash2, Eye } from "lucide-react";

export interface FicheSuivi {
  id: string;
  nom: string;
  prenom: string;
  genre: string;
  mosqueeAssidument: boolean;
  frequenceTaalim: string | null;
  participationActivite: boolean;
  sortieHomme: boolean;
  sortieFemme: boolean;
  presenceTaalimNissa: boolean;
  situationFamiliale: string | null;
  nombreEnfants: number | null;
  telephone: string | null;
  divers: string | null;
  date: string;
}

interface FormState {
  nom: string;
  prenom: string;
  genre: string;
  mosqueeAssidument: boolean;
  frequenceTaalim: string;
  participationActivite: boolean;
  sortieHomme: boolean;
  sortieFemme: boolean;
  presenceTaalimNissa: boolean;
  situationFamiliale: string;
  nombreEnfants: string;
  telephone: string;
  divers: string;
  date: string;
}

const FREQUENCE_OPTIONS = [
  { value: "", label: "—" },
  { value: "Quotidien", label: "Quotidien" },
  { value: "Plusieurs fois/semaine", label: "Plusieurs fois/semaine" },
  { value: "Hebdomadaire", label: "Hebdomadaire" },
  { value: "Occasionnel", label: "Occasionnel" },
  { value: "Jamais", label: "Jamais" },
];

const SITUATION_OPTIONS = [
  { value: "", label: "—" },
  { value: "Célibataire", label: "Célibataire" },
  { value: "Marié(e)", label: "Marié(e)" },
  { value: "Divorcé(e)", label: "Divorcé(e)" },
  { value: "Veuf/Veuve", label: "Veuf/Veuve" },
];

const emptyForm = (): FormState => ({
  nom: "",
  prenom: "",
  genre: "Homme",
  mosqueeAssidument: false,
  frequenceTaalim: "",
  participationActivite: false,
  sortieHomme: false,
  sortieFemme: false,
  presenceTaalimNissa: false,
  situationFamiliale: "",
  nombreEnfants: "",
  telephone: "",
  divers: "",
  date: new Date().toISOString().slice(0, 10),
});

function Badge({ value, yes = "Oui", no = "Non" }: { value: boolean; yes?: string; no?: string }) {
  return value ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-600/20 text-emerald-400 border border-emerald-600/30">
      ✓ {yes}
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700/60 text-slate-400">
      — {no}
    </span>
  );
}

function FreqBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-slate-500 text-sm">—</span>;
  const color =
    value === "Quotidien" ? "bg-emerald-600/20 text-emerald-400 border-emerald-600/30" :
    value === "Plusieurs fois/semaine" ? "bg-blue-600/20 text-blue-400 border-blue-600/30" :
    value === "Hebdomadaire" ? "bg-violet-600/20 text-violet-400 border-violet-600/30" :
    value === "Occasionnel" ? "bg-amber-600/20 text-amber-400 border-amber-600/30" :
    "bg-red-600/20 text-red-400 border-red-600/30";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {value}
    </span>
  );
}

export function SuiviManager({
  fiches: initial,
  total,
  page,
  limit,
  search: initialSearch,
}: {
  fiches: FicheSuivi[];
  total: number;
  page: number;
  limit: number;
  search: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [fiches, setFiches] = useState(initial);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const searchRef = useRef<HTMLInputElement>(null);
  const totalPages = Math.ceil(total / limit);

  function applySearch(value: string, newPage = 1) {
    const params = new URLSearchParams();
    if (value) params.set("search", value);
    if (newPage > 1) params.set("page", String(newPage));
    router.push(`/suivi?${params.toString()}`);
  }

  function handleSearch(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => applySearch(value), 350);
  }

  function startAdd() {
    setEditing(null);
    setForm(emptyForm());
    setError("");
    setShowForm(true);
  }

  function startEdit(f: FicheSuivi) {
    setEditing(f.id);
    setForm({
      nom: f.nom,
      prenom: f.prenom,
      genre: f.genre ?? "Homme",
      mosqueeAssidument: f.mosqueeAssidument,
      frequenceTaalim: f.frequenceTaalim ?? "",
      participationActivite: f.participationActivite,
      sortieHomme: f.sortieHomme,
      sortieFemme: f.sortieFemme,
      presenceTaalimNissa: f.presenceTaalimNissa,
      situationFamiliale: f.situationFamiliale ?? "",
      nombreEnfants: f.nombreEnfants != null ? String(f.nombreEnfants) : "",
      telephone: f.telephone ?? "",
      divers: f.divers ?? "",
      date: f.date.slice(0, 10),
    });
    setError("");
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm());
    setError("");
  }

  function set(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function save() {
    if (!form.nom.trim() || !form.prenom.trim()) {
      setError("Nom et prénom requis");
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      genre: form.genre,
      mosqueeAssidument: form.mosqueeAssidument,
      frequenceTaalim: form.frequenceTaalim || null,
      participationActivite: form.participationActivite,
      sortieHomme: form.genre === "Homme" ? form.sortieHomme : false,
      sortieFemme: form.genre === "Femme" ? form.sortieFemme : false,
      presenceTaalimNissa: form.genre === "Femme" ? form.presenceTaalimNissa : false,
      situationFamiliale: form.situationFamiliale || null,
      nombreEnfants: form.nombreEnfants !== "" ? parseInt(form.nombreEnfants, 10) : null,
      telephone: form.telephone || null,
      divers: form.divers || null,
      date: form.date,
    };

    try {
      if (editing) {
        const res = await fetch(`/api/suivis/${editing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        const updated: FicheSuivi = await res.json();
        setFiches((prev) => prev.map((f) => (f.id === editing ? updated : f)));
        toast("Fiche modifiée", "success");
      } else {
        const res = await fetch("/api/suivis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const { personCreated, ...created } = data as FicheSuivi & { personCreated: boolean };
        setFiches((prev) => [created, ...prev]);
        toast(personCreated ? "Fiche ajoutée · personne ajoutée à l'annuaire" : "Fiche ajoutée", "success");
      }
      cancelForm();
      router.refresh();
    } catch {
      setError("Erreur lors de la sauvegarde");
      toast("Erreur lors de la sauvegarde", "error");
    } finally {
      setSaving(false);
    }
  }

  async function doDelete() {
    if (!confirmDelete) return;
    setDeleting(confirmDelete.id);
    setConfirmDelete(null);
    const res = await fetch(`/api/suivis/${confirmDelete.id}`, { method: "DELETE" });
    if (res.ok) {
      setFiches((prev) => prev.filter((f) => f.id !== confirmDelete.id));
      toast("Fiche supprimée", "success");
      router.refresh();
    } else {
      toast("Erreur lors de la suppression", "error");
    }
    setDeleting(null);
  }

  function exportCSV() {
    const headers = ["Nom", "Prénom", "Genre", "Mosquée assidue", "Fréq. ta'alim", "Activité", "Sortie Homme", "Sortie Femme", "Présence Ta'alim Nissa", "Situation familiale", "Nb enfants", "Téléphone", "Divers", "Date"];
    const rows = filtered.map((f) => [
      f.nom, f.prenom, f.genre ?? "Homme", f.mosqueeAssidument ? "Oui" : "Non",
      f.frequenceTaalim ?? "", f.participationActivite ? "Oui" : "Non",
      f.sortieHomme ? "Oui" : "Non", f.sortieFemme ? "Oui" : "Non",
      f.presenceTaalimNissa ? "Oui" : "Non", f.situationFamiliale ?? "",
      f.nombreEnfants != null ? String(f.nombreEnfants) : "",
      f.telephone ?? "", f.divers ?? "", formatDate(f.date),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `suivi_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Export CSV téléchargé", "success");
  }

  const filtered = fiches;

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("fr-FR");
  }

  // Stats (sur la page courante)
  const assiduCount = filtered.filter((f) => f.mosqueeAssidument).length;
  const activiteCount = filtered.filter((f) => f.participationActivite).length;
  const sortieHommeCount = filtered.filter((f) => f.sortieHomme).length;
  const sortieFemmeCount = filtered.filter((f) => f.sortieFemme).length;
  const taalimNissaCount = filtered.filter((f) => f.presenceTaalimNissa).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Suivi communautaire</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} fiche{total !== 1 ? "s" : ""} au total</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {filtered.length > 0 && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-xl transition"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          )}
          <button
            onClick={startAdd}
            className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-600/10"
          >
            + Ajouter une fiche
          </button>
        </div>
      </div>

      {/* Quick stats */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 mb-5">
          <div className="stat-card px-3 sm:px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
            <span className="text-emerald-400 text-sm font-bold">{assiduCount}</span>
            <span className="text-slate-500 text-xs">assidu{assiduCount !== 1 ? "s" : ""}</span>
          </div>
          <div className="stat-card px-3 sm:px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2" style={{ animationDelay: "60ms" }}>
            <span className="text-blue-400 text-sm font-bold">{activiteCount}</span>
            <span className="text-slate-500 text-xs">activité{activiteCount !== 1 ? "s" : ""}</span>
          </div>
          <div className="stat-card px-3 sm:px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2" style={{ animationDelay: "120ms" }}>
            <span className="text-violet-400 text-sm font-bold">{sortieHommeCount}</span>
            <span className="text-slate-500 text-xs">sortie{sortieHommeCount !== 1 ? "s" : ""} H</span>
          </div>
          <div className="stat-card px-3 sm:px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2" style={{ animationDelay: "180ms" }}>
            <span className="text-pink-400 text-sm font-bold">{sortieFemmeCount}</span>
            <span className="text-slate-500 text-xs">sortie{sortieFemmeCount !== 1 ? "s" : ""} F</span>
          </div>
          <div className="stat-card col-span-2 sm:col-span-1 px-3 sm:px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2" style={{ animationDelay: "240ms" }}>
            <span className="text-amber-400 text-sm font-bold">{taalimNissaCount}</span>
            <span className="text-slate-500 text-xs">ta&apos;alim nissa</span>
          </div>
        </div>
      )}

      {/* Formulaire inline */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 sm:p-6 mb-6 animate-in">
          <h2 className="text-white font-semibold mb-5">
            {editing ? "Modifier la fiche" : "Nouvelle fiche"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Nom *</label>
              <input
                value={form.nom}
                onChange={(e) => set("nom", e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-sm transition"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Prénom *</label>
              <input
                value={form.prenom}
                onChange={(e) => set("prenom", e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-sm transition"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Genre</label>
              <select
                value={form.genre}
                onChange={(e) => set("genre", e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
              >
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Téléphone</label>
              <input
                value={form.telephone}
                onChange={(e) => set("telephone", e.target.value)}
                placeholder="06 12 34 56 78"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-sm transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Fréquence ta&apos;alim</label>
              <select
                value={form.frequenceTaalim}
                onChange={(e) => set("frequenceTaalim", e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
              >
                {FREQUENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Situation familiale</label>
              <select
                value={form.situationFamiliale}
                onChange={(e) => set("situationFamiliale", e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
              >
                {SITUATION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {([
              ["mosqueeAssidument", "Fréquente assidûment la mosquée"],
              ["participationActivite", "Participe min. à une activité"],
            ] as [keyof typeof form, string][]).map(([field, label]) => (
              <div key={field} className="flex items-center justify-between px-3 py-2.5 bg-slate-800 rounded-xl gap-2">
                <span className="text-sm text-slate-300">{label}</span>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => set(field, true)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${form[field] ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}
                  >
                    Oui
                  </button>
                  <button
                    type="button"
                    onClick={() => set(field, false)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${!form[field] ? "bg-red-600/80 text-white shadow-sm" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}
                  >
                    Non
                  </button>
                </div>
              </div>
            ))}

            {form.genre === "Homme" && (
              <div className="flex items-center justify-between px-3 py-2.5 bg-slate-800 rounded-xl gap-2">
                <span className="text-sm text-slate-300">Sortie Homme</span>
                <div className="flex gap-1 shrink-0">
                  <button type="button" onClick={() => set("sortieHomme", true)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${form.sortieHomme ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}>
                    Oui
                  </button>
                  <button type="button" onClick={() => set("sortieHomme", false)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${!form.sortieHomme ? "bg-red-600/80 text-white shadow-sm" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}>
                    Non
                  </button>
                </div>
              </div>
            )}

            {form.genre === "Femme" && (
              <>
                <div className="flex items-center justify-between px-3 py-2.5 bg-slate-800 rounded-xl gap-2">
                  <span className="text-sm text-slate-300">Sortie Femme</span>
                  <div className="flex gap-1 shrink-0">
                    <button type="button" onClick={() => set("sortieFemme", true)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition ${form.sortieFemme ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}>
                      Oui
                    </button>
                    <button type="button" onClick={() => set("sortieFemme", false)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition ${!form.sortieFemme ? "bg-red-600/80 text-white shadow-sm" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}>
                      Non
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between px-3 py-2.5 bg-slate-800 rounded-xl gap-2">
                  <span className="text-sm text-slate-300">Présence ta&apos;alim nissa</span>
                  <div className="flex gap-1 shrink-0">
                    <button type="button" onClick={() => set("presenceTaalimNissa", true)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition ${form.presenceTaalimNissa ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}>
                      Oui
                    </button>
                    <button type="button" onClick={() => set("presenceTaalimNissa", false)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition ${!form.presenceTaalimNissa ? "bg-red-600/80 text-white shadow-sm" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}>
                      Non
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Enfants */}
            <div className="flex items-center justify-between px-3 py-2.5 bg-slate-800 rounded-xl gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.nombreEnfants !== ""}
                  onChange={(e) => set("nombreEnfants", e.target.checked ? "1" : "")}
                  className="w-4 h-4 rounded accent-emerald-500"
                />
                <span className="text-sm text-slate-300">Avec enfant(s)</span>
              </label>
              {form.nombreEnfants !== "" && (
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={form.nombreEnfants}
                  onChange={(e) => set("nombreEnfants", e.target.value)}
                  className="w-20 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm text-center focus:outline-none focus:border-emerald-500 transition"
                />
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-1">Divers</label>
            <textarea
              value={form.divers}
              onChange={(e) => set("divers", e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-sm resize-none transition"
            />
          </div>

          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-600/10"
            >
              {saving ? "Sauvegarde..." : editing ? "Modifier" : "Ajouter"}
            </button>
            <button
              onClick={cancelForm}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Recherche */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Rechercher nom, prénom, téléphone..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full sm:max-w-sm pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-sm transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-3 py-3 text-slate-400 text-xs font-medium uppercase tracking-wide">Nom / Prénom</th>
              <th className="text-left px-3 py-3 text-slate-400 text-xs font-medium uppercase tracking-wide">Genre</th>
              <th className="text-left px-3 py-3 text-slate-400 text-xs font-medium uppercase tracking-wide">Mosquée</th>
              <th className="text-left px-3 py-3 text-slate-400 text-xs font-medium uppercase tracking-wide">Ta&apos;alim</th>
              <th className="text-left px-3 py-3 text-slate-400 text-xs font-medium uppercase tracking-wide">Activité</th>
              <th className="text-left px-3 py-3 text-slate-400 text-xs font-medium uppercase tracking-wide">Sortie H</th>
              <th className="text-left px-3 py-3 text-slate-400 text-xs font-medium uppercase tracking-wide">Sortie F</th>
              <th className="text-left px-3 py-3 text-slate-400 text-xs font-medium uppercase tracking-wide">Nissa</th>
              <th className="text-left px-3 py-3 text-slate-400 text-xs font-medium uppercase tracking-wide">Situation</th>
              <th className="text-left px-3 py-3 text-slate-400 text-xs font-medium uppercase tracking-wide">Date</th>
              <th className="text-right px-3 py-3 text-slate-400 text-xs font-medium uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f, i) => (
              <tr key={f.id} className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors table-row" style={{ animationDelay: `${i * 30}ms` }}>
                <td className="px-3 py-3">
                  <div className="text-white font-medium text-sm">{f.nom} {f.prenom}</div>
                  {f.divers && (
                    <div className="text-slate-500 text-xs mt-0.5 truncate max-w-[140px]" title={f.divers}>
                      {f.divers}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${(f.genre ?? "Homme") === "Femme" ? "bg-pink-600/20 text-pink-400 border-pink-600/30" : "bg-blue-600/20 text-blue-400 border-blue-600/30"}`}>
                    {(f.genre ?? "Homme") === "Femme" ? "F" : "H"}
                  </span>
                </td>
                <td className="px-3 py-3"><Badge value={f.mosqueeAssidument} /></td>
                <td className="px-3 py-3"><FreqBadge value={f.frequenceTaalim} /></td>
                <td className="px-3 py-3"><Badge value={f.participationActivite} /></td>
                <td className="px-3 py-3">{(f.genre ?? "Homme") === "Homme" ? <Badge value={f.sortieHomme} /> : <span className="text-slate-500 text-sm">—</span>}</td>
                <td className="px-3 py-3">{(f.genre ?? "Homme") === "Femme" ? <Badge value={f.sortieFemme} /> : <span className="text-slate-500 text-sm">—</span>}</td>
                <td className="px-3 py-3">{(f.genre ?? "Homme") === "Femme" ? <Badge value={f.presenceTaalimNissa} /> : <span className="text-slate-500 text-sm">—</span>}</td>
                <td className="px-3 py-3">
                  <div className="text-slate-300 text-sm">{f.situationFamiliale ?? "—"}</div>
                  {f.nombreEnfants != null && (
                    <div className="text-slate-500 text-xs mt-0.5">{f.nombreEnfants} enfant{f.nombreEnfants !== 1 ? "s" : ""}</div>
                  )}
                </td>
                <td className="px-3 py-3">
                  <span className="text-slate-400 text-sm">{formatDate(f.date)}</span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/suivi/${f.id}`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg transition"
                    >
                      Voir
                    </Link>
                    <button
                      onClick={() => startEdit(f)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg transition"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ id: f.id, name: `${f.prenom} ${f.nom}` })}
                      disabled={deleting === f.id}
                      className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/60 text-red-400 text-xs rounded-lg transition disabled:opacity-60"
                    >
                      {deleting === f.id ? "..." : "Supprimer"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11}>
                  <EmptyState
                    icon={ClipboardList}
                    title={search ? "Aucun résultat" : "Aucune fiche de suivi"}
                    description={search ? "Essayez avec d'autres termes" : "Ajoutez votre première fiche de suivi"}
                    action={
                      !search ? (
                        <button onClick={startAdd} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-xl transition">
                          + Ajouter une fiche
                        </button>
                      ) : undefined
                    }
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
          <span className="text-slate-400 text-sm">
            Page {page} sur {totalPages} · {total} fiches
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <button
                onClick={() => applySearch(search, page - 1)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-xl transition"
              >
                ← Précédent
              </button>
            )}
            {page < totalPages && (
              <button
                onClick={() => applySearch(search, page + 1)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-xl transition"
              >
                Suivant →
              </button>
            )}
          </div>
        </div>
      )}
      {totalPages <= 1 && total > 0 && (
        <p className="text-slate-500 text-xs mt-3">{total} fiche{total > 1 ? "s" : ""}</p>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title="Supprimer la fiche"
        message={`Êtes-vous sûr de vouloir supprimer la fiche de ${confirmDelete?.name} ?`}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
