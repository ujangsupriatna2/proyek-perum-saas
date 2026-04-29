"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MapPin, Car, X, Search, LocateFixed, Route, Navigation, Lock, MapPinned } from "lucide-react";
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

function createDestinationIcon(size: number = 48) {
  const html = `
    <div style="position:relative;width:${size}px;height:${size + 14}px;">
      <div style="
        width:${size}px;height:${size}px;
        display:flex;align-items:center;justify-content:center;
        background:linear-gradient(135deg,#111827,#374151);
        border:3px solid white;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 4px 14px rgba(0,0,0,0.35);
      ">
        <svg style="width:${size * 0.35}px;height:${size * 0.35}px;transform:rotate(45deg);fill:white;" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
      <div style="
        position:absolute;bottom:0;left:50%;transform:translateX(-50%);
        background:linear-gradient(135deg,#111827,#374151);color:white;
        font-size:9px;font-weight:700;padding:2px 6px;border-radius:6px;
        white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.2);
        display:flex;align-items:center;gap:3px;
      ">
        <svg style="width:8px;height:8px;fill:white;" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
        TERKUNCI
      </div>
    </div>
  `;
  return (L as any).divIcon({
    html,
    className: "",
    iconSize: [size, size + 14],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

function createOriginIcon(size: number = 38) {
  const html = `
    <div style="
      width:${size}px;height:${size}px;
      display:flex;align-items:center;justify-content:center;
      background:linear-gradient(135deg,#6B7280,#9CA3AF);
      border:3px solid white;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 3px 10px rgba(0,0,0,0.25);
    ">
      <svg style="width:${size * 0.38}px;height:${size * 0.38}px;transform:rotate(45deg);fill:white;" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4" fill="none" stroke="white" stroke-width="2.5"/>
        <circle cx="12" cy="12" r="1.5"/>
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
  const [originAddress, setOriginAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchError, setSearchError] = useState("");
  const [routeLocked, setRouteLocked] = useState(false);

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

      // Custom marker for destination (locked)
      const destIcon = createDestinationIcon(48);
      L.marker(DEST, { icon: destIcon })
        .addTo(map)
        .bindPopup(
          `<div style="text-align:center;padding:6px 0"><strong style="color:#1f2937;font-size:14px">${brandName}</strong><br><span style="font-size:11px;color:#6B7280;display:inline-flex;align-items:center;gap:4px;">&#128274; Lokasi Terkunci</span></div>`
        );

      markerGroupRef.current = L.layerGroup().addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);

      // Click handler — set origin
      map.on("click", (e: any) => {
        const clickedLatlng: [number, number] = [e.latlng.lat, e.latlng.lng];
        placeOriginMarker(clickedLatlng);
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

  // Place origin marker on map
  const placeOriginMarker = useCallback((latlng: [number, number]) => {
    setOrigin(latlng);
    setRouteLocked(false);
    setRouteResult(null);
    if (routeLayerRef.current) {
      routeLayerRef.current.clearLayers();
    }

    if (originMarkerRef.current) {
      originMarkerRef.current.setLatLng(latlng);
    } else {
      import("leaflet").then((L) => {
        const originIcon = createOriginIcon(38);
        originMarkerRef.current = L.marker(latlng, {
          icon: originIcon,
        }).addTo(markerGroupRef.current);
      });
    }
  }, []);

  // Route fetching — auto-calculate when origin is set
  const calculateRoute = useCallback(async (org: [number, number]) => {
    if (!org) return;
    setIsLoadingRoute(true);
    const result = await fetchRoute(org, DEST);
    setRouteResult(result);
    setIsLoadingRoute(false);
    if (result) {
      setRouteLocked(true);
    }
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
      // Shadow line
      const shadowLine = L.polyline(routeResult!.geometry, {
        color: "#111827",
        weight: 8,
        opacity: 0.15,
        lineJoin: "round",
      });
      routeLayerRef.current!.addLayer(shadowLine);

      // Main line
      const polyline = L.polyline(routeResult!.geometry, {
        color: "#111827",
        weight: 5,
        opacity: 0.85,
        lineJoin: "round",
        dashArray: "0",
      });
      routeLayerRef.current!.addLayer(polyline);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.fitBounds(polyline.getBounds(), {
          padding: [60, 60],
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
        const addr = data.display_name.split(",").slice(0, 3).join(",");
        setSearchQuery(addr);
        setOriginAddress(addr);
      }
    } catch {}
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError("");
    const result = await geocodeAddress(searchQuery);
    if (result) {
      placeOriginMarker(result);
      setOriginAddress(searchQuery);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(result, 14);
      }
    } else {
      setSearchError("Alamat tidak ditemukan. Coba lebih spesifik.");
    }
    setIsSearching(false);
  }

  function handleUseMyLocation() {
    if (userLocation) {
      placeOriginMarker(userLocation);
      reverseGeocode(userLocation);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(userLocation, 14);
      }
    }
  }

  function clearRoute() {
    setOrigin(null);
    setOriginAddress("");
    setRouteResult(null);
    setRouteLocked(false);
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
            placeholder="Ketik alamat asal atau klik pada peta..."
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

        {/* Destination locked badge */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-3.5 py-2.5 shadow-lg z-[1000] border border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center shrink-0">
              <MapPinned className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider leading-none">Tujuan</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5 leading-tight">{brandName}</p>
              <div className="flex items-center gap-1 mt-1">
                <Lock className="w-2.5 h-2.5 text-gray-500" />
                <span className="text-[10px] font-semibold text-gray-500">Terkunci</span>
              </div>
            </div>
          </div>
        </div>

        {/* Origin info badge (shown when origin is set) */}
        {origin && (
          <div className="absolute top-4 left-[calc(50%+12px)] sm:left-auto sm:right-[52px] bg-white/95 backdrop-blur-sm rounded-xl px-3.5 py-2.5 shadow-lg z-[1000] border border-gray-100 max-w-[200px]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider leading-none">Asal</p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5 leading-tight truncate">
                  {originAddress || `${origin[0].toFixed(4)}, ${origin[1].toFixed(4)}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Click hint (only show when no origin) */}
        {!origin && !isLoadingRoute && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-full px-5 py-2.5 shadow-lg text-xs z-[1000] flex items-center gap-2 text-gray-600 border border-gray-100">
            <MapPin className="w-3.5 h-3.5 text-gray-500" />
            <span className="font-medium">Klik pada peta atau cari alamat untuk melihat rute</span>
          </div>
        )}

        {/* Route locked indicator */}
        {routeLocked && !isLoadingRoute && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-full px-5 py-2.5 shadow-xl text-xs z-[1000] flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            <span className="font-bold">Rute Terkunci</span>
            <span className="text-gray-400">|</span>
            <span className="font-medium">{formatDistance(routeResult?.distance || 0)}</span>
            <span className="text-gray-400">|</span>
            <span className="font-medium">{formatDuration(routeResult?.duration || 0)}</span>
          </div>
        )}
      </div>

      {/* Route result panel */}
      {routeResult && (
        <div className="mt-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Navigation className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Detail Rute Kendaraan</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <Lock className="w-3 h-3 text-gray-400" />
                  <span className="text-[11px] font-medium text-gray-400">Rute terkunci</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearRoute}
              className="text-gray-400 hover:text-gray-600 h-8 px-2"
            >
              <X className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>

          {isLoadingRoute ? (
            <div className="text-center py-6">
              <div className="inline-block w-8 h-8 border-3 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
              <p className="text-sm text-gray-400 mt-2">Menghitung rute...</p>
            </div>
          ) : (
            <>
              {/* Origin → Destination summary */}
              <div className="flex items-start gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                <div className="flex flex-col items-center gap-1 mt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-white shadow" />
                  <div className="w-0.5 h-6 bg-gray-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-900 border-2 border-white shadow" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lokasi Asal</p>
                    <p className="text-xs font-medium text-gray-700 truncate">{originAddress || `${origin?.[0].toFixed(4)}, ${origin?.[1].toFixed(4)}`}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tujuan</p>
                    <p className="text-xs font-medium text-gray-900">{brandName}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                  <Car className="w-5 h-5 text-gray-600 mx-auto mb-1.5" />
                  <p className="text-2xl font-extrabold text-gray-900">
                    {formatDuration(routeResult.duration)}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1 font-medium">Waktu Tempuh</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                  <Route className="w-5 h-5 text-gray-600 mx-auto mb-1.5" />
                  <p className="text-2xl font-extrabold text-gray-900">
                    {formatDistance(routeResult.distance)}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1 font-medium">Jarak Tempuh</p>
                </div>
              </div>

              {/* Open in Google Maps */}
              {origin && (
                <div className="mt-4 text-center">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${origin[0]},${origin[1]}&destination=${DEST[0]},${DEST[1]}&travelmode=driving`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg border border-gray-100"
                  >
                    <MapPin className="w-4 h-4" />
                    Buka Navigasi di Google Maps
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
