import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface GeoResult {
  lat: number;
  lng: number;
  displayName: string;
  fallback?: boolean;
}

// API Adresse du gouvernement français (BAN) — très précise pour les adresses FR
async function banGeocode(q: string): Promise<GeoResult | null> {
  const res = await fetch(
    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=1`,
    { headers: { Accept: "application/json" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.features || data.features.length === 0) return null;

  const feature = data.features[0];
  const [lon, lat] = feature.geometry.coordinates;
  const props = feature.properties;

  return {
    lat,
    lng: lon,
    displayName: props.label || props.name || q,
  };
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  const city = searchParams.get("city") || "";
  const zipCode = searchParams.get("zipCode") || "";

  if (!address) return NextResponse.json({ error: "Missing address" }, { status: 400 });

  // 1. Recherche complète : rue + code postal + ville
  let result = await banGeocode(`${address} ${zipCode} ${city}`.trim());

  // 2. Fallback : ville + code postal seulement (positionne au centre-ville)
  if (!result && (city || zipCode)) {
    result = await banGeocode(`${zipCode} ${city}`.trim());
    if (result) result = { ...result, fallback: true };
  }

  if (!result) {
    return NextResponse.json({ error: "Adresse introuvable" }, { status: 404 });
  }

  return NextResponse.json(result);
}
