'use client'

import React, { useState, useMemo } from 'react'
import DeckGL from '@deck.gl/react'
import { ScatterplotLayer } from '@deck.gl/layers'
import { HexagonLayer } from '@deck.gl/aggregation-layers'
import { Map } from 'react-map-gl/maplibre'
import { useWardStore } from '@/stores/wardStore'

/**
 * AEROVITAL v5.0 ULTIMATE — 3D Globe Atmospheric Engine
 * Replaces the flat Leaflet map with a 3D Earth view using Deck.gl WebGL.
 * Features:
 * - 3D Hexagon AQI extrusion (height = pollution intensity)
 * - MapLibre Dark Matter basemap (free, no API key required)
 * - Fire alert glow indicators
 */

// Free carto dark matter tiles
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

const INITIAL_VIEW_STATE = {
    longitude: 77.209, // Delhi lon
    latitude: 28.6139,  // Delhi lat
    zoom: 10,
    pitch: 45,
    bearing: 0,
}

export default function Globe3DMap() {
    const wards = useWardStore((s) => s.wards)
    const fireAlerts = useWardStore((s) => s.fireAlerts)
    const setSelectedWardId = useWardStore((s) => s.setSelectedWardId)

    // Format ward data for Deck.gl
    const wardPoints = useMemo(() => {
        return wards.map(w => ({
            position: [w.lon, w.lat] as [number, number],
            aqi: w.aqi,
            ward: w
        }))
    }, [wards])

    // Hexagon Layer for 3D AQI Extrusion
    const hexagonLayer = new HexagonLayer({
        id: 'aqi-hex-layer',
        data: wardPoints,
        pickable: true,
        extruded: true,
        radius: 1200, // meters
        elevationScale: 50,
        getPosition: (d: any) => d.position,
        getColorValue: (points: any[]) => {
            // Average AQI in hex bin
            const avgAqi = points.reduce((acc, p) => acc + p.aqi, 0) / points.length
            return avgAqi
        },
        getElevationValue: (points: any[]) => {
            const avgAqi = points.reduce((acc, p) => acc + p.aqi, 0) / points.length
            return avgAqi
        },
        colorRange: [
            [16, 185, 129],   // Good (Green)
            [251, 191, 36],   // Moderate (Yellow)
            [249, 115, 22],   // Poor (Orange)
            [239, 68, 68],    // Very Poor (Red)
            [127, 29, 29]     // Severe (Dark Red)
        ],
        onClick: (info: any) => {
            if (info.object?.points?.length > 0) {
                // Just pick the first ward in the hex bin
                const clickedWard = info.object.points[0].ward
                setSelectedWardId(clickedWard.wardId)
            }
            return true
        },
        transitions: {
            elevationScale: 1000
        }
    })

    // Scatterplot for NASA Fires
    const fireLayer = new ScatterplotLayer({
        id: 'nasa-fires',
        data: fireAlerts,
        pickable: true,
        opacity: 0.8,
        stroked: true,
        filled: true,
        radiusScale: 6,
        radiusMinPixels: 4,
        radiusMaxPixels: 20,
        lineWidthMinPixels: 1,
        getPosition: (d: any) => [d.longitude, d.latitude],
        getFillColor: [255, 60, 0],
        getLineColor: [255, 255, 255],
        getRadius: 200, // Size of fire radius
    })

    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE)

    return (
        <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-white/10">
            <DeckGL
                initialViewState={viewState}
                onViewStateChange={({ viewState }) => setViewState(viewState as any)}
                controller={true}
                layers={[hexagonLayer, fireLayer]}
                getTooltip={({ object }) => {
                    if (!object) return null
                    if (object.points) {
                        const avg = Math.round(object.points.reduce((acc: number, p: any) => acc + p.aqi, 0) / object.points.length)
                        return `AQI: ${avg} (Click to select ward)`
                    }
                    if (object.confidence) {
                        return 'NASA Active Fire Alert'
                    }
                    return null
                }}
            >
                <Map
                    mapStyle={MAP_STYLE}
                    attributionControl={false}
                />
            </DeckGL>

            {/* Floating UI overlay */}
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-mono text-white tracking-widest uppercase font-bold">
                    3D WebGL Engine Active
                </span>
            </div>
        </div >
    )
}
