"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { PrayerTimes } from "@/app/api/prayer-times/[mawaqitId]/route";
import { useToast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface MosqueItem {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
  mawaqitId: string | null;
  personCount: number;
}

interface FormState {
  name: string;
  address: string;
  city: string;
  lat: string;
  lng: string;
  mawaqitId: string;
}

const PRAYER_LABELS = [
  { key: "fajr", label: "Fajr", icon: "🌙" },
  { key: "shuruq", label: "Shuruq", icon: "🌅" },
  { key: "dhuhr", label: "Dhuhr", icon: "☀️" },
  { key: "asr", label: "Asr", icon: "🌤️" },
  { key: "maghrib", label: "Maghrib", icon: "🌇" },
  { key: "isha", label: "Isha", icon: "🌃" },
] as const;

const empty: FormState = { name: "", address: "", city: "", lat: "", lng: "", mawaqitId: "" };

function PrayerTimesPanel({ mawaqitId }: { mawaqitId: string }) {
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/prayer-times/${encodeURIComponent(mawaqitId)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Introuvable");
        return r.json();
      })
      .then((d) => setTimes(d))
      .catch(() => setError("ID Mawaqit invalide ou mosquée introuvable"))
      .finally(() => setLoading(false));
  }, [mawaqitId]);

  if (loading) {
    return (
      <div className="mt-3 pt-3 border-t border-slate-700 text-slate-500 text-xs animate-pulse">
        Chargement des horaires...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-3 pt-3 border-t border-slate-700 text-red-400 text-xs">
        ⚠️ {error}
      </div>
    );
  }

  if (!times) return null;

  // Déterminer la prochaine prière
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const nextPrayer = PRAYER_LABELS.find(({ key }) => {
    const t = times[key];
    return t && t !== "--:--" && toMin(t) > nowMin;
  })?.key ?? null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">
          Horaires du jour
        </span>
        {times.jumua && (
          <span className="text-emerald-400 text-xs">
            Jumu&apos;a : {times.jumua}
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {PRAYER_LABELS.map(({ key, label, icon }) => {
          const time = times[key];
          const isNext = key === nextPrayer;
          return (
            <div
              key={key}
              className={`flex flex-col items-center py-1.5 px-2 rounded-lg text-center transition ${
                isNext
                  ? "bg-emerald-600/20 border border-emerald-600/50"
                  : "bg-slate-800"
              }`}
            >
              <span className="text-xs mb-0.5">{icon}</span>
              <span className="text-slate-400 text-[10px]">{label}</span>
              <span
                className={`text-sm font-semibold ${
                  isNext ? "text-emerald-400" : "text-white"
                }`}
              >
                {time ?? "--:--"}
              </span>
              {isNext && (
                <span className="text-[9px] text-emerald-500 mt-0.5">
                  prochaine
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MosquesManager({ mosques: initial }: { mosques: MosqueItem[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [mosques, setMosques] = useState(initial);
  const [form, setForm] = useState<FormState>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  async function geocode() {
    if (!form.address || !form.city) return;
    setGeocoding(true);
    setError("");
    try {
      const q = `${form.address}, ${form.city}`;
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setForm((f) => ({ ...f, lat: String(data.lat), lng: String(data.lng) }));
    } catch {
      setError("Adresse introuvable");
    } finally {
      setGeocoding(false);
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    const payload = {
      name: form.name,
      address: form.address,
      city: form.city,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
      mawaqitId: form.mawaqitId.trim() || null,
    };

    try {
      if (editing) {
        const res = await fetch(`/api/mosques?id=${editing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        const updated = await res.json();
        setMosques((prev) =>
          prev.map((m) =>
            m.id === editing ? { ...updated, personCount: m.personCount } : m
          )
        );
        setEditing(null);
        toast("Mosquée modifiée", "success");
      } else {
        const res = await fetch("/api/mosques", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        const created = await res.json();
        setMosques((prev) => [...prev, { ...created, personCount: 0 }]);
        toast("Mosquée ajoutée", "success");
      }
      setForm(empty);
      router.refresh();
    } catch {
      setError("Erreur lors de la sauvegarde");
      toast("Erreur lors de la sauvegarde", "error");
    } finally {
      setSaving(false);
    }
  }

  async function doDeleteMosque() {
    if (!confirmDelete) return;
    const res = await fetch(`/api/mosques?id=${confirmDelete.id}`, { method: "DELETE" });
    if (res.ok) {
      setMosques((prev) => prev.filter((m) => m.id !== confirmDelete.id));
      toast("Mosquée supprimée", "success");
      router.refresh();
    } else {
      toast("Erreur lors de la suppression", "error");
    }
    setConfirmDelete(null);
  }

  function startEdit(m: MosqueItem) {
    setEditing(m.id);
    setForm({
      name: m.name,
      address: m.address,
      city: m.city,
      lat: m.lat ? String(m.lat) : "",
      lng: m.lng ? String(m.lng) : "",
      mawaqitId: m.mawaqitId ?? "",
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Gestion des mosquées</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">
            {editing ? "Modifier la mosquée" : "Ajouter une mosquée"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Nom *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Adresse *</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Ville *</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm text-slate-300 mb-1">Latitude</label>
                <input
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
                  placeholder="50.4488"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-slate-300 mb-1">Longitude</label>
                <input
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
                  placeholder="2.9028"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={geocode}
              disabled={geocoding}
              className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition disabled:opacity-60"
            >
              {geocoding ? "Géolocalisation..." : "📍 Géolocaliser automatiquement"}
            </button>

            {/* Mawaqit ID */}
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                ID Mawaqit
                <span className="text-slate-500 font-normal ml-1">(slug de l&apos;URL mawaqit.net)</span>
              </label>
              <input
                value={form.mawaqitId}
                onChange={(e) => setForm({ ...form, mawaqitId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm font-mono"
                placeholder="mosquee-raja-harnes"
              />
              <p className="text-slate-600 text-xs mt-1">
                Ex : mawaqit.net/en/<span className="text-slate-400">mosquee-raja-harnes</span>
              </p>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={saving || !form.name || !form.address || !form.city}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition"
              >
                {saving ? "Sauvegarde..." : editing ? "Modifier" : "Ajouter"}
              </button>
              {editing && (
                <button
                  onClick={() => { setEditing(null); setForm(empty); }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition"
                >
                  Annuler
                </button>
              )}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {mosques.map((m) => (
            <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium">🕌 {m.name}</div>
                  <div className="text-slate-400 text-sm mt-1">{m.address}, {m.city}</div>
                  <div className="text-slate-500 text-xs mt-1 flex items-center gap-3">
                    <span>{m.personCount} membre{m.personCount !== 1 ? "s" : ""}</span>
                    <span>{m.lat && m.lng ? "GPS ✓" : "GPS ✗"}</span>
                    {m.mawaqitId && (
                      <span className="text-emerald-500">🕐 Mawaqit</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 ml-3">
                  <button
                    onClick={() => startEdit(m)}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-md transition"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => setConfirmDelete({ id: m.id, name: m.name })}
                    className="px-3 py-1 bg-red-900/30 hover:bg-red-900/60 text-red-400 text-xs rounded-lg transition"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {/* Horaires Mawaqit */}
              {m.mawaqitId && <PrayerTimesPanel mawaqitId={m.mawaqitId} />}
            </div>
          ))}
          {mosques.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-500">
              Aucune mosquée
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!confirmDelete}
        title="Supprimer la mosquée"
        message={`Supprimer "${confirmDelete?.name}" ? Les membres associés perdront leur mosquée.`}
        onConfirm={doDeleteMosque}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
