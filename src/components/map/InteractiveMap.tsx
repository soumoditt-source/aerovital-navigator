'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'

const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
    <p>Loading map...</p>
  </div>
})

interface InteractiveMapProps {
  onStartSet: (lat: number, lng: number) => void
  onEndSet: (lat: number, lng: number) => void
  activeSelection: 'start' | 'end' | null
}

export default function InteractiveMap({ onStartSet, onEndSet, activeSelection }: InteractiveMapProps) {
  return <MapInner onStartSet={onStartSet} onEndSet={onEndSet} activeSelection={activeSelection} />
}
