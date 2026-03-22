import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

async function nominatimFreeform(q: string) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&countrycodes=fr`,
    {
      headers: {
        "User-Agent": "AnnuaireCommunautaire/1.0 (local)",
        "Accept-Language": "fr",
      },
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || data.length === 0) return null;
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}

async function nominatimStructured(street: string, city: string, postalcode: string) {
  const params = new URLSearchParams({
    format: "json",
    street,
    city,
    postalcode,
    country: "France",
    limit: "1",
  });
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      headers: {
        "User-Agent": "AnnuaireCommunautaire/1.0 (local)",
        "Accept-Language": "fr",
      },
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || data.length === 0) return null;
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
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

  // 1. Essai structuré (street + city + postalcode) — plus précis
  let result = await nominatimStructured(address, city, zipCode);

  // 2. Fallback : recherche libre avec l'adresse complète
  if (!result) {
    result = await nominatimFreeform(`${address}, ${zipCode} ${city}`);
  }

  // 3. Dernier recours : ville + code postal seulement
  if (!result && (city || zipCode)) {
    result = await nominatimFreeform(`${zipCode} ${city}`.trim());
    if (result) result = { ...result, fallback: true } as typeof result & { fallback?: boolean };
  }

  if (!result) {
    return NextResponse.json({ error: "Adresse introuvable" }, { status: 404 });
  }

  return NextResponse.json(result);
}
