'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, LayersControl, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon
if (globalThis.L?.Icon?.Default !== undefined) {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

const greenIcon = globalThis.L === undefined ? null : new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const redIcon = globalThis.L === undefined ? null : new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

function LocationMarker({ onPointSet, type, position }: Readonly<{ onPointSet: (lat: number, lng: number) => void, type: 'start' | 'end', position: [number, number] | null }>) {
  useMapEvents({
    click(e) {
      if (type) {
        onPointSet(e.latlng.lat, e.latlng.lng)
      }
    },
  })

  if (!position || !greenIcon || !redIcon) return null;

  return (
    <Marker position={position} icon={type === 'start' ? greenIcon : redIcon}>
      <Popup>
        <div className="font-sans">
          <p className="font-bold text-blue-600">{type === 'start' ? 'Start Point' : 'Destination'}</p>
          <p className="text-[10px] text-gray-500">{position[0].toFixed(4)}, {position[1].toFixed(4)}</p>
        </div>
      </Popup>
    </Marker>
  )
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
  const polyline: [number, number][] = []
  if (routePoints.start) polyline.push(routePoints.start)
  if (routePoints.end) polyline.push(routePoints.end)

  return (
    <MapContainer center={center} zoom={5} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
      <ChangeView center={center} />

      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Dark Dashboard">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="Real Satellite">
          <TileLayer
            attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="Street Map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      {routePoints.start && (
        <LocationMarker onPointSet={onStartSet} type="start" position={routePoints.start} />
      )}
      {routePoints.end && (
        <LocationMarker onPointSet={onEndSet} type="end" position={routePoints.end} />
      )}

      {polyline.length === 2 && (
        <Polyline
          positions={polyline}
          pathOptions={{
            color: '#3b82f6',
            weight: 5,
            opacity: 0.7,
            dashArray: '10, 10',
            lineJoin: 'round'
          }}
        />
      )}
    </MapContainer>
  )
}
