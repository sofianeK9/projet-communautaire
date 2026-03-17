import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const HEADERS = {
  "User-Agent": "AnnuaireCommunautaire/1.0 (local)",
  "Accept-Language": "fr",
};

async function nominatimFree(q: string) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&countrycodes=fr`,
    { headers: HEADERS }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), displayName: data[0].display_name };
}

async function nominatimStructured(street: string, city: string, zip: string) {
  const params = new URLSearchParams({ format: "json", limit: "1", countrycodes: "fr" });
  if (street) params.set("street", street);
  if (city) params.set("city", city);
  if (zip) params.set("postalcode", zip);
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: HEADERS });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), displayName: data[0].display_name };
}

/** Retire le numéro en début de rue : "10 Rue de la Paix" → "Rue de la Paix" */
function stripNumber(street: string) {
  return street.replace(/^\d+[\s,bis-]*/i, "").trim();
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address") || "";
  const city = searchParams.get("city") || "";
  const zipCode = searchParams.get("zipCode") || "";

  if (!address) return NextResponse.json({ error: "Missing address" }, { status: 400 });

  type Result = { lat: number; lng: number; displayName: string; precision?: string } | null;
  let result: Result = null;

  // 1. Requête structurée exacte (street + city + zip)
  result = await nominatimStructured(address, city, zipCode);
  if (result) return NextResponse.json({ ...result, precision: "exact" });

  // 2. Adresse libre complète
  result = await nominatimFree(`${address}, ${zipCode} ${city}`.trim());
  if (result) return NextResponse.json({ ...result, precision: "exact" });

  // 3. Rue sans numéro + ville + CP
  const streetNoNum = stripNumber(address);
  if (streetNoNum && streetNoNum !== address) {
    result = await nominatimStructured(streetNoNum, city, zipCode);
    if (result) return NextResponse.json({ ...result, precision: "street" });

    result = await nominatimFree(`${streetNoNum}, ${zipCode} ${city}`.trim());
    if (result) return NextResponse.json({ ...result, precision: "street" });
  }

  // 4. Rue sans numéro + ville seule
  if (streetNoNum && city) {
    result = await nominatimFree(`${streetNoNum}, ${city}`);
    if (result) return NextResponse.json({ ...result, precision: "street" });
  }

  // 5. CP + ville seulement
  if (zipCode || city) {
    result = await nominatimFree(`${zipCode} ${city}`.trim());
    if (result) return NextResponse.json({ ...result, precision: "city" });
  }

  // 6. Ville seule
  if (city) {
    result = await nominatimFree(city);
    if (result) return NextResponse.json({ ...result, precision: "city" });
  }

  return NextResponse.json({ error: "Adresse introuvable" }, { status: 404 });
}
