"use client";

import { useEffect, useRef } from "react";
import type { PersonWithMosque, MosqueBasic } from "@/types";

interface MapViewProps {
  people: PersonWithMosque[];
  mosques: MosqueBasic[];
  height?: string;
}

export default function MapView({ people, mosques, height = "100%" }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    let cancelled = false;

    async function initMap() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (await import("leaflet")).default as any;

      if (cancelled || mapInstanceRef.current || !mapRef.current) return;

      // Fix default marker icons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current).setView([50.4488, 2.9028], 13);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Mosque icon
      const mosqueIcon = L.divIcon({
        html: `<div style="background:#10b981;border:2px solid #fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.4)">🕌</div>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      // Person icons
      const greenIcon = L.divIcon({
        html: `<div style="background:#10b981;border:2px solid #fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:11px;box-shadow:0 2px 6px rgba(0,0,0,0.4)">👤</div>`,
        className: "",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const blueIcon = L.divIcon({
        html: `<div style="background:#3b82f6;border:2px solid #fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:11px;box-shadow:0 2px 6px rgba(0,0,0,0.4)">👤</div>`,
        className: "",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const bounds: [number, number][] = [];

      // Add mosque markers
      for (const mosque of mosques) {
        if (mosque.lat && mosque.lng) {
          bounds.push([mosque.lat, mosque.lng]);
          L.marker([mosque.lat, mosque.lng], { icon: mosqueIcon })
            .bindPopup(
              `<div style="font-family:system-ui;min-width:180px">
                <div style="font-weight:700;font-size:14px;margin-bottom:4px">🕌 ${mosque.name}</div>
                <div style="color:#666;font-size:12px">${mosque.address}, ${mosque.city}</div>
              </div>`
            )
            .addTo(map);
        }
      }

      // Add person markers
      for (const person of people) {
        if (person.lat && person.lng) {
          bounds.push([person.lat, person.lng]);
          const icon = person.mosqueId ? greenIcon : blueIcon;
          const popup = `
            <div style="font-family:system-ui;min-width:200px">
              <div style="font-weight:700;font-size:14px;margin-bottom:6px">${person.firstName} ${person.lastName}</div>
              <div style="color:#666;font-size:12px;margin-bottom:4px">📍 ${person.address}, ${person.zipCode} ${person.city}</div>
              ${person.phone ? `<div style="color:#666;font-size:12px;margin-bottom:4px">📞 ${person.phone}</div>` : ""}
              ${person.mosque ? `<div style="color:#666;font-size:12px;margin-bottom:8px">🕌 ${person.mosque.name}</div>` : ""}
              <a href="/people/${person.id}" style="display:inline-block;background:#10b981;color:#fff;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none">Voir la fiche</a>
            </div>
          `;
          L.marker([person.lat, person.lng], { icon }).bindPopup(popup).addTo(map);
        }
      }

      // Fit map to actual markers
      if (bounds.length === 1) {
        map.setView(bounds[0], 15);
      } else if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      }
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove(): void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [people, mosques]);

  return <div ref={mapRef} style={{ height, width: "100%" }} />;
}
