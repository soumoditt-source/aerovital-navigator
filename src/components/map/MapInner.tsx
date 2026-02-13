'use client'

import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, LayersControl, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

/**
 * AEROVITAL NAVIGATOR - ULTIMATE MAP ENGINE v3.1
 * 
 * Specialized high-reliability map engine for Next.js.
 * Forces tile rendering and handles complex route visualization.
 */

// Critical Icon Fix for Next.js
const fixLeafletIcons = () => {
  if (typeof globalThis.window === 'undefined') return;

  // Standard Icon
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
    // Force multiple resize triggers to ensure zero-height containers are fixed
    const triggers = [100, 500, 1000, 2000];
    triggers.forEach(delay => {
      setTimeout(() => {
        map.invalidateSize();
        if (globalThis.window) {
          globalThis.window.dispatchEvent(new Event('resize'));
        }
      }, delay);
    });
  }, [map]);
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

export default function MapInner({
  onStartSet,
  onEndSet,
  activeSelection,
  center = [20.5937, 78.9629],
  routePoints = { start: null, end: null }
}: Readonly<{
  onStartSet: (lat: number, lng: number) => void,
  onEndSet: (lat: number, lng: number) => void,
  activeSelection: 'start' | 'end' | null,
  center?: [number, number],
  routePoints?: { start: [number, number] | null, end: [number, number] | null }
}>) {
  const [mounted, setMounted] = useState(false);

  // High-Resolution Custom Icons
  const customIcons = useMemo(() => {
    if (typeof globalThis.window === 'undefined') return { start: null, end: null };
    return {
      start: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      }),
      end: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
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
        zoomControl={false} // We will add it manually or rely on custom UI
      >
        <MapResizer />
        <ViewManager center={center} />
        <ClickHandler onClick={handleMapClick} />

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

        {routePoints.start && customIcons.start && (
          <Marker position={routePoints.start} icon={customIcons.start}>
            <Popup className="custom-popup">
              <div className="font-mono text-[10px] p-1">
                <span className="text-green-400 font-bold uppercase">Start Point</span>
                <br />
                {routePoints.start[0].toFixed(5)}, {routePoints.start[1].toFixed(5)}
              </div>
            </Popup>
          </Marker>
        )}

        {routePoints.end && customIcons.end && (
          <Marker position={routePoints.end} icon={customIcons.end}>
            <Popup className="custom-popup">
              <div className="font-mono text-[10px] p-1">
                <span className="text-red-400 font-bold uppercase">Destination</span>
                <br />
                {routePoints.end[0].toFixed(5)}, {routePoints.end[1].toFixed(5)}
              </div>
            </Popup>
          </Marker>
        )}

        {polyline.length === 2 && (
          <Polyline
            positions={polyline}
            pathOptions={{
              color: '#3b82f6',
              weight: 6,
              opacity: 0.9,
              dashArray: '1, 12',
              lineCap: 'round',
              fill: false
            }}
          >
            <Popup>
              <div className="font-mono text-[10px] text-blue-400 uppercase font-bold">Safest Bio-Route Computed</div>
            </Popup>
          </Polyline>
        )}
      </MapContainer>

      {/* Manual Zoom Controls Overlay (Google Style) */}
      <div className="absolute bottom-10 right-6 z-[1000] flex flex-col gap-2">
        <div className="glass-panel p-1 rounded-lg flex flex-col gap-2 shadow-2xl">
          <button className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-md transition-all font-bold" onClick={() => globalThis.window && globalThis.window.dispatchEvent(new CustomEvent('map-zoom-in'))}>+</button>
          <div className="h-px bg-white/10 mx-2" />
          <button className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-md transition-all font-bold" onClick={() => globalThis.window && globalThis.window.dispatchEvent(new CustomEvent('map-zoom-out'))}>-</button>
        </div>
      </div>
    </div>
  );
}
