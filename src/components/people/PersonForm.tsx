"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import type { MosqueBasic, PersonWithMosque } from "@/types";
import MapViewClient from "@/components/map/MapViewClient";

const schema = z.object({
  firstName: z.string().min(1, "Requis"),
  lastName: z.string().min(1, "Requis"),
  address: z.string().min(1, "Requis"),
  zipCode: z.string().min(1, "Requis"),
  city: z.string().min(1, "Requis"),
  phone: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  notes: z.string().optional(),
  mosqueId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface PersonFormProps {
  person?: PersonWithMosque;
  mosques: MosqueBasic[];
}

export default function PersonForm({ person, mosques }: PersonFormProps) {
  const router = useRouter();
  const [lat, setLat] = useState<number | null>(person?.lat ?? null);
  const [lng, setLng] = useState<number | null>(person?.lng ?? null);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeMsg, setGeocodeMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: person?.firstName ?? "",
      lastName: person?.lastName ?? "",
      address: person?.address ?? "",
      zipCode: person?.zipCode ?? "",
      city: person?.city ?? "",
      phone: person?.phone ?? "",
      email: person?.email ?? "",
      notes: person?.notes ?? "",
      mosqueId: person?.mosqueId ?? "",
    },
  });

  const addressValue = watch("address");
  const zipCodeValue = watch("zipCode");
  const cityValue = watch("city");
  const firstNameValue = watch("firstName");
  const lastNameValue = watch("lastName");

  async function geocode() {
    const q = `${addressValue}, ${zipCodeValue} ${cityValue}`;
    setGeocoding(true);
    setGeocodeMsg("");

    try {
      const params = new URLSearchParams({
        address: q,
        city: cityValue,
        zipCode: zipCodeValue,
      });
      const res = await fetch(`/api/geocode?${params}`);
      if (!res.ok) throw new Error("Adresse introuvable");
      const data = await res.json();
      setLat(data.lat);
      setLng(data.lng);
      if (data.fallback) {
        setGeocodeMsg("⚠️ Rue inconnue dans OSM — placé au centre de la ville");
      } else {
        setGeocodeMsg("✓ Position trouvée !");
      }
    } catch {
      setGeocodeMsg("Adresse introuvable");
    } finally {
      setGeocoding(false);
    }
  }

  async function onSubmit(data: FormData) {
    setSaving(true);
    setError("");

    const payload = {
      ...data,
      lat,
      lng,
      email: data.email || null,
      phone: data.phone || null,
      notes: data.notes || null,
      mosqueId: data.mosqueId || null,
    };

    try {
      const url = person ? `/api/people/${person.id}` : "/api/people";
      const method = person ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erreur lors de la sauvegarde");
      const saved = await res.json();
      router.push(`/people/${saved.id}`);
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  }

  // Mini-map preview — stable reference, only changes when lat/lng or identifying fields change
  const previewPerson = useMemo(() => {
    if (!lat || !lng) return [];
    return [{
      id: "preview",
      firstName: firstNameValue || "Personne",
      lastName: lastNameValue || "",
      address: addressValue || "",
      city: cityValue || "",
      zipCode: zipCodeValue || "",
      lat,
      lng,
      phone: null,
      email: null,
      notes: null,
      mosqueId: null,
      mosque: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Prénom *</label>
          <input
            {...register("firstName")}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          />
          {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Nom *</label>
          <input
            {...register("lastName")}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          />
          {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Adresse *</label>
        <input
          {...register("address")}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          placeholder="10 Rue de la Paix"
        />
        {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Code postal *</label>
          <input
            {...register("zipCode")}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          />
          {errors.zipCode && <p className="text-red-400 text-xs mt-1">{errors.zipCode.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Ville *</label>
          <input
            {...register("city")}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          />
          {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
        </div>
      </div>

      {/* Geocode */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={geocode}
          disabled={geocoding}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition disabled:opacity-60"
        >
          {geocoding ? "Géolocalisation..." : "📍 Géolocaliser l'adresse"}
        </button>
        {lat && lng && (
          <span className="text-xs text-emerald-400">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </span>
        )}
        {geocodeMsg && (
          <span className={`text-xs ${
            geocodeMsg.startsWith("✓") ? "text-emerald-400" :
            geocodeMsg.startsWith("⚠️") ? "text-amber-400" :
            "text-red-400"
          }`}>
            {geocodeMsg}
          </span>
        )}
      </div>

      {/* Mini map preview */}
      {lat && lng && (
        <div className="rounded-xl overflow-hidden border border-slate-700" style={{ height: 200 }}>
          <MapViewClient people={previewPerson} mosques={[]} height="200px" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Téléphone</label>
          <input
            {...register("phone")}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            placeholder="06 12 34 56 78"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
          <input
            {...register("email")}
            type="email"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Mosquée</label>
        <select
          {...register("mosqueId")}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">-- Aucune --</option>
          {mosques.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.city})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
        <textarea
          {...register("notes")}
          rows={3}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 resize-none"
        />
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold rounded-lg transition"
        >
          {saving ? "Sauvegarde..." : person ? "Modifier" : "Ajouter"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
