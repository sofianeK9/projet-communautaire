export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocodeAddress(
  address: string
): Promise<GeocodeResult | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "AnnuaireCommunautaire/1.0",
    },
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (!data || data.length === 0) return null;

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}
