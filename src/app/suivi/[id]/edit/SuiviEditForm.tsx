"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

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

interface FicheData {
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

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 bg-slate-800 rounded-xl gap-2">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition ${value ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}
        >
          Oui
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition ${!value ? "bg-red-600/80 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}
        >
          Non
        </button>
      </div>
    </div>
  );
}

export function SuiviEditForm({ fiche }: { fiche: FicheData }) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [nom, setNom] = useState(fiche.nom);
  const [prenom, setPrenom] = useState(fiche.prenom);
  const [genre, setGenre] = useState(fiche.genre);
  const [telephone, setTelephone] = useState(fiche.telephone ?? "");
  const [date, setDate] = useState(fiche.date);
  const [frequenceTaalim, setFrequenceTaalim] = useState(fiche.frequenceTaalim ?? "");
  const [situationFamiliale, setSituationFamiliale] = useState(fiche.situationFamiliale ?? "");
  const [nombreEnfants, setNombreEnfants] = useState(
    fiche.nombreEnfants != null ? String(fiche.nombreEnfants) : ""
  );
  const [mosqueeAssidument, setMosqueeAssidument] = useState(fiche.mosqueeAssidument);
  const [participationActivite, setParticipationActivite] = useState(fiche.participationActivite);
  const [sortieHomme, setSortieHomme] = useState(fiche.sortieHomme);
  const [sortieFemme, setSortieFemme] = useState(fiche.sortieFemme);
  const [presenceTaalimNissa, setPresenceTaalimNissa] = useState(fiche.presenceTaalimNissa);
  const [divers, setDivers] = useState(fiche.divers ?? "");

  async function save() {
    if (!nom.trim() || !prenom.trim()) {
      setError("Nom et prénom requis");
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      nom: nom.trim(),
      prenom: prenom.trim(),
      genre,
      mosqueeAssidument,
      frequenceTaalim: frequenceTaalim || null,
      participationActivite,
      sortieHomme: genre === "Homme" ? sortieHomme : false,
      sortieFemme: genre === "Femme" ? sortieFemme : false,
      presenceTaalimNissa: genre === "Femme" ? presenceTaalimNissa : false,
      situationFamiliale: situationFamiliale || null,
      nombreEnfants: nombreEnfants !== "" ? parseInt(nombreEnfants, 10) : null,
      telephone: telephone || null,
      divers: divers || null,
      date,
    };

    try {
      const res = await fetch(`/api/suivis/${fiche.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast("Fiche modifiée", "success");
      router.push(`/suivi/${fiche.id}`);
    } catch {
      setError("Erreur lors de la sauvegarde");
      toast("Erreur lors de la sauvegarde", "error");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-sm transition";
  const selectCls = "w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm";

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 sm:p-6 space-y-5">

      {/* Identité */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Nom *</label>
          <input value={nom} onChange={(e) => setNom(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Prénom *</label>
          <input value={prenom} onChange={(e) => setPrenom(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Genre</label>
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className={selectCls}>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Téléphone</label>
          <input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="06 12 34 56 78" className={inputCls} />
        </div>
      </div>

      {/* Situation & fréquence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Fréquence ta&apos;alim</label>
          <select value={frequenceTaalim} onChange={(e) => setFrequenceTaalim(e.target.value)} className={selectCls}>
            {FREQUENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Situation familiale</label>
          <select value={situationFamiliale} onChange={(e) => setSituationFamiliale(e.target.value)} className={selectCls}>
            {SITUATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={selectCls} />
        </div>
      </div>

      {/* Booléens */}
      <div className="flex flex-col gap-2">
        <ToggleField label="Fréquente assidûment la mosquée" value={mosqueeAssidument} onChange={setMosqueeAssidument} />
        <ToggleField label="Participe min. à une activité" value={participationActivite} onChange={setParticipationActivite} />
        {genre === "Homme" && (
          <ToggleField label="Sortie Homme" value={sortieHomme} onChange={setSortieHomme} />
        )}
        {genre === "Femme" && (
          <>
            <ToggleField label="Sortie Femme" value={sortieFemme} onChange={setSortieFemme} />
            <ToggleField label="Présence ta&apos;alim nissa" value={presenceTaalimNissa} onChange={setPresenceTaalimNissa} />
          </>
        )}

        {/* Enfants */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-slate-800 rounded-xl gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={nombreEnfants !== ""}
              onChange={(e) => setNombreEnfants(e.target.checked ? "1" : "")}
              className="w-4 h-4 rounded accent-emerald-500"
            />
            <span className="text-sm text-slate-300">Avec enfant(s)</span>
          </label>
          {nombreEnfants !== "" && (
            <input
              type="number"
              min="1"
              max="20"
              value={nombreEnfants}
              onChange={(e) => setNombreEnfants(e.target.value)}
              className="w-20 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm text-center focus:outline-none focus:border-emerald-500 transition"
            />
          )}
        </div>
      </div>

      {/* Divers */}
      <div>
        <label className="block text-sm text-slate-300 mb-1">Divers</label>
        <textarea
          value={divers}
          onChange={(e) => setDivers(e.target.value)}
          rows={3}
          className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-sm resize-none transition"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          onClick={save}
          disabled={saving}
          className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition"
        >
          {saving ? "Sauvegarde..." : "Enregistrer"}
        </button>
        <button
          onClick={() => router.push(`/suivi/${fiche.id}`)}
          className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
