export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocodeAddress(
  address: string
): Promise<GeocodeResult | null> {
  const res = await fetch(
    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`,
    { headers: { Accept: "application/json" } }
  );

  if (!res.ok) return null;

  const data = await res.json();
  if (!data.features || data.features.length === 0) return null;

  const feature = data.features[0];
  const [lon, lat] = feature.geometry.coordinates;

  return {
    lat,
    lng: lon,
    displayName: feature.properties.label || address,
  };
}
