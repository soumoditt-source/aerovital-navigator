'use client'

import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, LayersControl, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
// Import leaflet-heat dynamically or via side-effect if already in package.json
import 'leaflet.heat'

/**
 * AEROVITAL NAVIGATOR - ULTIMATE MAP ENGINE v3.2
 * 
 * Integrated Heatmap & Neural Path Visualization.
 * Uses Google HD Tiling + Leaflet.heat for pollution gradients.
 */

const fixLeafletIcons = () => {
  if (globalThis.window === undefined) return;
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    fixLeafletIcons();
    const triggers = [100, 500, 2000];
    triggers.forEach(delay => {
      setTimeout(() => {
        map.invalidateSize();
        if (globalThis.window) globalThis.window.dispatchEvent(new Event('resize'));
      }, delay);
    });
  }, [map]);
  return null;
}

function HeatmapLayer({ aqi, center }: { aqi: number, center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || aqi === 0) return;

    // Generate simulated pollution points around the user
    const points: [number, number, number][] = [];
    const intensity = aqi / 100;

    for (let i = 0; i < 40; i++) {
      const latOffset = (Math.random() - 0.5) * 0.05;
      const lonOffset = (Math.random() - 0.5) * 0.05;
      // Higher intensity closer to "pollution hotspots" (simulated)
      points.push([
        center[0] + latOffset,
        center[1] + lonOffset,
        intensity * Math.random()
      ]);
    }

    const heatLayer = (L as any).heatLayer(points, {
      radius: 35,
      blur: 25,
      maxZoom: 17,
      gradient: {
        0.2: '#10b981', // Good
        0.4: '#fbbf24', // Moderate
        0.6: '#f97316', // USG
        0.8: '#ef4444', // Unhealthy
        1.0: '#7f1d1d'  // Hazardous
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, aqi, center]);

  return null;
}

function ViewManager({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.panTo(center, { animate: true });
    }
  }, [center, map]);
  return null;
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapInnerProps {
  onStartSet: (lat: number, lng: number) => void
  onEndSet: (lat: number, lng: number) => void
  activeSelection: 'start' | 'end' | null
  center?: [number, number]
  routePoints?: { start: [number, number] | null, end: [number, number] | null }
  aqi?: number
}

export default function MapInner({
  onStartSet,
  onEndSet,
  activeSelection,
  center = [20.5937, 78.9629],
  routePoints = { start: null, end: null },
  aqi = 0
}: Readonly<MapInnerProps>) {
  const [mounted, setMounted] = useState(false);

  const icons = useMemo(() => {
    if (globalThis.window === undefined) return { start: null, end: null };
    return {
      start: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      }),
      end: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      })
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center border border-white/10 rounded-3xl overflow-hidden">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] text-blue-400 font-mono tracking-widest uppercase">Initializing Geospatial Engine...</p>
        </div>
      </div>
    );
  }

  const polyline: [number, number][] = [];
  if (routePoints.start) polyline.push(routePoints.start);
  if (routePoints.end) polyline.push(routePoints.end);

  const handleMapClick = (lat: number, lng: number) => {
    if (activeSelection === 'start') onStartSet(lat, lng);
    else if (activeSelection === 'end') onEndSet(lat, lng);
  };

  return (
    <div className="w-full h-full relative outline-none bg-slate-950 overflow-hidden rounded-3xl">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[500px]"
        zoomControl={false}
      >
        <MapResizer />
        <ViewManager center={center} />
        <ClickHandler onClick={handleMapClick} />
        <HeatmapLayer aqi={aqi} center={center} />

        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Google Satellite (Hybrid)">
            <TileLayer
              attribution='&copy; Google'
              url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              maxZoom={20}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Google Street View">
            <TileLayer
              attribution='&copy; Google'
              url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              maxZoom={20}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Deep Space Monitor">
            <TileLayer
              attribution='&copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {routePoints.start && icons.start && (
          <Marker position={routePoints.start} icon={icons.start}>
            <Popup>
              <div className="font-mono text-[10px] uppercase font-bold text-green-500">Origin Point</div>
            </Popup>
          </Marker>
        )}
        {routePoints.end && icons.end && (
          <Marker position={routePoints.end} icon={icons.end}>
            <Popup>
              <div className="font-mono text-[10px] uppercase font-bold text-red-500">Destination</div>
            </Popup>
          </Marker>
        )}

        {polyline.length === 2 && (
          <Polyline
            positions={polyline}
            pathOptions={{
              color: '#3b82f6',
              weight: 8,
              opacity: 0.9,
              dashArray: '1, 15',
              lineCap: 'round',
              className: 'neural-path-pulse'
            }}
          >
            <Popup>
              <div className="font-mono text-[10px] text-blue-400 font-bold uppercase tracking-tighter">
                Neural A* Intelligence Path
              </div>
            </Popup>
          </Polyline>
        )}
        <div className="absolute bottom-6 left-6 z-[1000] glass-panel p-3 rounded-xl border border-white/10 pointer-events-none">
          <div className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">Neural Intensity Index</div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" title="Good" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" title="Moderate" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#f97316]" title="Unhealthy for Sensitive" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" title="Unhealthy" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#7f1d1d]" title="Hazardous" />
            <span className="text-[8px] font-mono text-white/30 ml-1">CLEAN &rarr; TOXIC</span>
          </div>
        </div>
      </MapContainer>
    </div>
  );
}
