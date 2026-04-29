"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MapPin, Car, X, Search, LocateFixed, Route, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettingsStore } from "@/lib/settings-store";

/* ─── Types ─── */
interface RouteResult {
  distance: number; // meters
  duration: number; // seconds
  geometry: [number, number][]; // [lat, lng][]
}

/* ─── Constants ─── */
const DEFAULT_DEST: [number, number] = [-6.920424938201904, 107.75187683105469];
const OSRM_BASE = "https://router.project-osrm.org/route/v1";

/* ─── Helpers ─── */
function formatDistance(m: number) {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function formatDuration(s: number) {
  if (s < 60) return `${Math.round(s)} detik`;
  const min = Math.floor(s / 60);
  if (min < 60) return `${min} menit`;
  const h = Math.floor(min / 60);
  const rm = min % 60;
  return rm > 0 ? `${h} jam ${rm} menit` : `${h} jam`;
}

async function geocodeAddress(query: string): Promise<[number, number] | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=id&accept-language=id`
    );
    const data = await res.json();
    if (data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch {
    // ignore
  }
  return null;
}

async function fetchRoute(
  origin: [number, number],
  dest: [number, number]
): Promise<RouteResult | null> {
  try {
    const url = `${OSRM_BASE}/driving/${origin[1]},${origin[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const coords: [number, number][] = route.geometry.coordinates.map(
        (c: [number, number]) => [c[1], c[0]]
      );
      return {
        distance: route.distance,
        duration: route.duration,
        geometry: coords,
      };
    }
  } catch {
    // ignore
  }
  return null;
}

function createCustomIcon(color: string, size: number = 40) {
  const html = `
    <div style="
      width:${size}px;height:${size}px;
      display:flex;align-items:center;justify-content:center;
      background:${color};border:3px solid white;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 3px 10px rgba(0,0,0,0.3);
    ">
      <svg style="width:${size * 0.4}px;height:${size * 0.4}px;transform:rotate(45deg);fill:white;" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3"/>
      </svg>
    </div>
  `;
  return (L as any).divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

/* ─── Component ─── */
interface LeafletMapProps {
  latitude?: string;
  longitude?: string;
  companyName?: string;
}

export default function LeafletMap({ latitude, longitude, companyName }: LeafletMapProps) {
  const { settings: S, fetchSettings } = useSettingsStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const originMarkerRef = useRef<any>(null);
  const cssInjectedRef = useRef(false);

  const [origin, setOrigin] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchError, setSearchError] = useState("");

  const destLat = parseFloat(latitude || S.map_latitude) || DEFAULT_DEST[0];
  const destLng = parseFloat(longitude || S.map_longitude) || DEFAULT_DEST[1];
  const DEST: [number, number] = [destLat, destLng];
  const brandName = companyName || S.company_name;

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  // Initialize map + inject Leaflet CSS
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Inject Leaflet CSS if not already done
    if (!cssInjectedRef.current && typeof document !== "undefined") {
      const existing = document.querySelector("link[data-leaflet-css]");
      if (!existing) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.setAttribute("data-leaflet-css", "true");
        document.head.appendChild(link);
      }
      cssInjectedRef.current = true;
    }

    // Dynamically import Leaflet
    import("leaflet").then((L) => {
      if (mapInstanceRef.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        scrollWheelZoom: true,
        zoomControl: false,
      }).setView(DEST, 15);

      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom marker for destination
      const destIcon = createCustomIcon("#1f2937", 44);
      L.marker(DEST, { icon: destIcon })
        .addTo(map)
        .bindPopup(
          `<div style="text-align:center;padding:4px 0"><strong style="color:#1f2937;font-size:14px">${brandName}</strong><br><span style="font-size:12px;color:#666">Lokasi Perumahan</span></div>`
        );

      markerGroupRef.current = L.layerGroup().addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);

      // Click handler
      map.on("click", (e: any) => {
        const clickedLatlng: [number, number] = [e.latlng.lat, e.latlng.lng];
        setOrigin(clickedLatlng);
        if (originMarkerRef.current) {
          originMarkerRef.current.setLatLng(e.latlng);
        } else {
          const originIcon = createCustomIcon("#374151", 36);
          originMarkerRef.current = L.marker(e.latlng, {
            icon: originIcon,
          }).addTo(markerGroupRef.current);
        }
        reverseGeocode(clickedLatlng);
      });

      // Zoom control on right
      L.control.zoom({ position: "topright" }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);

      // Try getting user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc: [number, number] = [
              pos.coords.latitude,
              pos.coords.longitude,
            ];
            setUserLocation(loc);
          },
          () => {}
        );
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Route fetching
  const calculateRoute = useCallback(async (org: [number, number]) => {
    if (!org) return;
    setIsLoadingRoute(true);
    const result = await fetchRoute(org, DEST);
    setRouteResult(result);
    setIsLoadingRoute(false);
  }, []);

  useEffect(() => {
    if (origin) {
      calculateRoute(origin);
    }
  }, [origin, calculateRoute]);

  // Draw route on map
  useEffect(() => {
    if (!routeLayerRef.current || !routeResult) return;
    routeLayerRef.current.clearLayers();

    import("leaflet").then((L) => {
      const polyline = L.polyline(routeResult!.geometry, {
        color: "#1f2937",
        weight: 5,
        opacity: 0.8,
        lineJoin: "round",
      });
      routeLayerRef.current!.addLayer(polyline);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.fitBounds(polyline.getBounds(), {
          padding: [50, 50],
        });
      }
    });
  }, [routeResult]);

  async function reverseGeocode(latlng: [number, number]) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng[0]}&lon=${latlng[1]}&accept-language=id`
      );
      const data = await res.json();
      if (data.display_name) {
        setSearchQuery(data.display_name.split(",").slice(0, 3).join(","));
      }
    } catch {}
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError("");
    const result = await geocodeAddress(searchQuery);
    if (result) {
      setOrigin(result);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(result, 14);
      }
      if (originMarkerRef.current) {
        originMarkerRef.current.setLatLng(result);
      } else {
        import("leaflet").then((L) => {
          const originIcon = createCustomIcon("#374151", 36);
          originMarkerRef.current = L.marker(result, {
            icon: originIcon,
          }).addTo(markerGroupRef.current);
        });
      }
    } else {
      setSearchError("Alamat tidak ditemukan. Coba lebih spesifik.");
    }
    setIsSearching(false);
  }

  function handleUseMyLocation() {
    if (userLocation) {
      setOrigin(userLocation);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(userLocation, 14);
      }
      if (originMarkerRef.current) {
        originMarkerRef.current.setLatLng(userLocation);
      } else {
        import("leaflet").then((L) => {
          const originIcon = createCustomIcon("#374151", 36);
          originMarkerRef.current = L.marker(userLocation, {
            icon: originIcon,
          }).addTo(markerGroupRef.current);
        });
      }
      reverseGeocode(userLocation);
    }
  }

  function clearRoute() {
    setOrigin(null);
    setRouteResult(null);
    setSearchQuery("");
    setSearchError("");
    if (originMarkerRef.current) {
      originMarkerRef.current.remove();
      originMarkerRef.current = null;
    }
    if (routeLayerRef.current) {
      routeLayerRef.current.clearLayers();
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(DEST, 15);
    }
  }

  return (
    <div className="relative w-full">
      {/* Search bar */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Masukkan alamat asal Anda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 pr-4 h-11 border-gray-200 focus:border-gray-400 rounded-xl text-sm"
          />
        </div>
        <div className="flex gap-2">
          {userLocation && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUseMyLocation}
              className="h-11 px-3 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl whitespace-nowrap"
            >
              <LocateFixed className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Lokasi Saya</span>
            </Button>
          )}
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="h-11 px-5 bg-gradient-to-r from-gray-800 to-gray-950 hover:from-gray-900 hover:to-black text-white rounded-xl"
          >
            <Route className="w-4 h-4 mr-1.5" />
            {isSearching ? "Mencari..." : "Cari Rute"}
          </Button>
        </div>
      </div>

      {/* Search error */}
      {searchError && (
        <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
          <X className="w-3.5 h-3.5" />
          {searchError}
        </p>
      )}

      {/* Map container */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200">
        <div
          ref={mapRef}
          className="w-full h-[400px] sm:h-[480px] md:h-[520px]"
          style={{ zIndex: 1 }}
        />

        {/* Map legend overlay */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg text-xs z-[1000]">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-3 h-3 rounded-full bg-gray-800 border-2 border-white shadow" />
            <span className="font-medium text-gray-700">
              {brandName}
            </span>
          </div>
          {origin && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500 border-2 border-white shadow" />
              <span className="font-medium text-gray-700">Lokasi Anda</span>
            </div>
          )}
        </div>

        {/* Click hint */}
        {!origin && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-md text-xs z-[1000] flex items-center gap-1.5 text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-gray-600" />
            Klik pada peta atau cari alamat untuk melihat rute kendaraan
          </div>
        )}
      </div>

      {/* Route result - driving only */}
      {routeResult && (
        <div className="mt-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-900">Petunjuk Arah Kendaraan</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearRoute}
              className="text-gray-400 hover:text-gray-600 h-8 px-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {isLoadingRoute ? (
            <div className="text-center py-6">
              <div className="inline-block w-8 h-8 border-3 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
              <p className="text-sm text-gray-400 mt-2">Menghitung rute...</p>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Car className="w-6 h-6 text-gray-700" />
                <span className="font-semibold text-gray-800">Kendaraan</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-extrabold text-gray-900">
                    {formatDuration(routeResult.duration)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Estimasi waktu tempuh</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-gray-900">
                    {formatDistance(routeResult.distance)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Route className="w-3.5 h-3.5" />
                    Jarak tempuh
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Open in Google Maps link */}
          {origin && (
            <div className="mt-4 text-center">
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${origin[0]},${origin[1]}&destination=${DEST[0]},${DEST[1]}&travelmode=driving`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Buka di Google Maps
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
