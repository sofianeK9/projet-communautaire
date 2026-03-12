"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import type { PersonWithMosque, MosqueBasic } from "@/types";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-900 text-slate-400 text-sm">
      Chargement de la carte...
    </div>
  ),
});

interface MapViewClientProps {
  people: PersonWithMosque[];
  mosques: MosqueBasic[];
  height?: string;
}

export default function MapViewClient(props: MapViewClientProps) {
  return <MapView {...props} />;
}
