'use client'
import dynamic from 'next/dynamic'


const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
    <p>Loading map...</p>
  </div>
})

interface InteractiveMapProps {
  readonly onStartSet: (lat: number, lng: number) => void
  readonly onEndSet: (lat: number, lng: number) => void
  readonly activeSelection: 'start' | 'end' | null
  readonly center?: [number, number]
  readonly routePoints?: { start: [number, number] | null, end: [number, number] | null }
  readonly aqi?: number
}

export default function InteractiveMap({ onStartSet, onEndSet, activeSelection, center, routePoints, aqi }: InteractiveMapProps) {
  return <MapInner onStartSet={onStartSet} onEndSet={onEndSet} activeSelection={activeSelection} center={center} routePoints={routePoints} aqi={aqi} />
}
