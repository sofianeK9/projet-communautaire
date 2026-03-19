import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

async function nominatim(q: string) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`,
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

  // 1. Essai avec l'adresse complète
  let result = await nominatim(address);

  // 2. Fallback : ville + code postal seulement
  if (!result && (city || zipCode)) {
    result = await nominatim(`${zipCode} ${city}`.trim());
    if (result) result = { ...result, fallback: true } as typeof result & { fallback?: boolean };
  }

  if (!result) {
    return NextResponse.json({ error: "Adresse introuvable" }, { status: 404 });
  }

  return NextResponse.json(result);
}
