import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export interface PrayerTimes {
  fajr: string;
  shuruq: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  jumua: string | null;
  mosqueName: string | null;
}

// Cache en mémoire (1h)
const cache = new Map<string, { data: PrayerTimes; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000;

async function fetchPrayerTimes(mawaqitId: string): Promise<PrayerTimes | null> {
  const cached = cache.get(mawaqitId);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    const res = await fetch(`https://mawaqit.net/en/${mawaqitId}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "fr,en;q=0.9",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    const html = await res.text();

    // Extraire l'objet confData depuis le HTML
    const match = html.match(/(?:var|let|const)\s+confData\s*=\s*(\{[\s\S]*?\});/);
    if (!match) return null;

    const conf = JSON.parse(match[1]);

    // times = [Fajr, Shuruq, Dhuhr, Asr, Maghrib, Isha]
    const times: string[] = conf.times ?? [];
    if (times.length < 6) return null;

    const data: PrayerTimes = {
      fajr: times[0] ?? "--:--",
      shuruq: times[1] ?? "--:--",
      dhuhr: times[2] ?? "--:--",
      asr: times[3] ?? "--:--",
      maghrib: times[4] ?? "--:--",
      isha: times[5] ?? "--:--",
      jumua: conf.jumua ?? null,
      mosqueName: conf.name ?? null,
    };

    cache.set(mawaqitId, { data, ts: Date.now() });
    return data;
  } catch {
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ mawaqitId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mawaqitId } = await params;
  const data = await fetchPrayerTimes(mawaqitId);

  if (!data) {
    return NextResponse.json(
      { error: "Mosquée introuvable sur Mawaqit" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
