import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, LayersControl, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Nuclear fix for Leaflet icons in Next.js
const fixIcon = () => {
  if (typeof globalThis.window !== 'undefined' && L.Icon.Default) {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }
};

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    fixIcon();
    const timer = setTimeout(() => {
      map.invalidateSize();
      if (typeof globalThis.window !== 'undefined') {
        globalThis.window.dispatchEvent(new Event('resize'));
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
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
  const [mapReady, setMapReady] = useState(false);

  const icons = useMemo(() => {
    if (typeof globalThis.window === 'undefined') return { green: null, red: null };
    return {
      green: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      }),
      red: new L.Icon({
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
    setMapReady(true);
  }, []);

  const polyline: [number, number][] = [];
  if (routePoints.start) polyline.push(routePoints.start);
  if (routePoints.end) polyline.push(routePoints.end);

  const handleMapClick = (lat: number, lng: number) => {
    if (activeSelection === 'start') onStartSet(lat, lng);
    if (activeSelection === 'end') onEndSet(lat, lng);
  };

  if (!mapReady) return <div className="h-full w-full bg-blue-900/20 animate-pulse flex items-center justify-center text-blue-400 font-mono text-xs">CALIBRATING STRATOSPHERE...</div>;

  return (
    <div className="h-full w-full relative bg-blue-900/10" style={{ minHeight: '500px' }}>
      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ height: '100%', width: '100%', zIndex: 1, background: '#080c14' }}
      >
        <MapResizer />
        <ChangeView center={center} />
        <MapClickHandler onClick={handleMapClick} />

        <LayersControl position="bottomright">
          <LayersControl.BaseLayer checked name="Dark Dashboard">
            <TileLayer
              attribution='&copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Real Satellite">
            <TileLayer
              attribution='&copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Street Map">
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {routePoints.start && icons.green && (
          <Marker position={routePoints.start} icon={icons.green}>
            <Popup>Start Point</Popup>
          </Marker>
        )}
        {routePoints.end && icons.red && (
          <Marker position={routePoints.end} icon={icons.red}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        {polyline.length === 2 && (
          <Polyline
            positions={polyline}
            pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.8, dashArray: '5, 10' }}
          />
        )}
      </MapContainer>
    </div>
  );
}
