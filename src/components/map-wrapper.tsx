"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] sm:h-[480px] md:h-[520px] bg-gray-100 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mb-3" />
        <p className="text-sm text-gray-400">Memuat peta...</p>
      </div>
    </div>
  ),
});

interface MapWrapperProps {
  latitude?: string;
  longitude?: string;
  companyName?: string;
}

export default function MapWrapper({ latitude, longitude, companyName }: MapWrapperProps) {
  return <LeafletMap latitude={latitude} longitude={longitude} companyName={companyName} />;
}
