'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

function LocationMarker({ onPointSet, type }: { onPointSet: (lat: number, lng: number) => void, type: 'start' | 'end' }) {
  const [position, setPosition] = useState<L.LatLng | null>(null)

  useMapEvents({
    click(e) {
      if (type) {
        setPosition(e.latlng)
        onPointSet(e.latlng.lat, e.latlng.lng)
      }
    },
  })

  return position === null ? null : (
    <Marker position={position} icon={type === 'start' ? greenIcon : redIcon}>
      <Popup>{type === 'start' ? 'Start Point' : 'End Point'}</Popup>
    </Marker>
  )
}

export default function MapInner({
  onStartSet,
  onEndSet,
  activeSelection
}: {
  onStartSet: (lat: number, lng: number) => void,
  onEndSet: (lat: number, lng: number) => void,
  activeSelection: 'start' | 'end' | null
}) {
  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {activeSelection === 'start' && <LocationMarker onPointSet={onStartSet} type="start" />}
      {activeSelection === 'end' && <LocationMarker onPointSet={onEndSet} type="end" />}
    </MapContainer>
  )
}
