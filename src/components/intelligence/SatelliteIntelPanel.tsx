'use client'

import React, { useState } from 'react'
import { MapContainer, TileLayer, LayersControl } from 'react-leaflet'
import { Satellite, Info, CalendarClock } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

/**
 * AEROVITAL v5.0 ULTIMATE — NASA Satellite Intel Panel
 * Displays MODIS Aerosol Optical Depth (AOD) and True Color imagery from NASA GIBS.
 * AOD is a direct proxy for PM2.5 total column density.
 */
export default function SatelliteIntelPanel() {
    const [dayOffset, setDayOffset] = useState(1) // Default to 1 (Yesterday) because NASA GIBS AOD data has 24h latency

    const getDateString = (offsetDays: number) => {
        const d = new Date()
        d.setDate(d.getDate() - offsetDays)
        return d.toISOString().split('T')[0]
    }

    const dateStr = getDateString(dayOffset)

    // NASA GIBS WMTS endpoints
    const modisAodUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Aerosol/default/${dateStr}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`
    const modisTrueColorUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${dateStr}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
                <div>
                    <h2 className="text-white font-bold flex items-center gap-2">
                        <Satellite className="text-blue-400" size={18} /> NASA GIBS Satellite Intel
                    </h2>
                    <p className="text-xs text-white/50 mt-1 max-w-sm">
                        Live MODIS Aerosol Optical Depth (AOD) overlay. Dense red/orange indicates massive aerosol plumes (PM2.5).
                    </p>
                </div>

                <div className="flex bg-black/40 p-1 rounded-xl">
                    <button
                        onClick={() => setDayOffset(1)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${dayOffset === 1 ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white'}`}
                    >
                        Yesterday
                    </button>
                    <button
                        onClick={() => setDayOffset(0)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${dayOffset === 0 ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white'}`}
                    >
                        Today
                    </button>
                </div>
            </div>

            <div className="flex-grow w-full rounded-2xl overflow-hidden border border-white/10 relative">
                <MapContainer
                    center={[28.6139, 77.209] as [number, number]}
                    zoom={6}
                    className="w-full h-full"
                    scrollWheelZoom={true}
                    zoomControl={false}
                >
                    <LayersControl position="topright">
                        <LayersControl.BaseLayer checked name="Deep Space Monitor (Basemap)">
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                        </LayersControl.BaseLayer>

                        <LayersControl.BaseLayer name="NASA True Color (MODIS)">
                            <TileLayer
                                url={modisTrueColorUrl}
                                maxZoom={9}
                                attribution="NASA GIBS"
                            />
                        </LayersControl.BaseLayer>

                        <LayersControl.Overlay checked name="Aerosol Optical Depth (AOD)">
                            <TileLayer
                                url={modisAodUrl}
                                maxZoom={6}
                                opacity={0.7}
                                attribution="NASA MODIS AOD"
                            />
                        </LayersControl.Overlay>
                    </LayersControl>
                </MapContainer>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 z-[1000] bg-black/80 backdrop-blur-md p-3 rounded-xl border border-white/10">
                    <div className="text-[9px] font-mono text-white/50 uppercase tracking-widest mb-2 font-bold flex items-center gap-1">
                        <Info size={10} /> Aerosol Density
                    </div>
                    <div className="w-48 h-2 bg-gradient-to-r from-blue-500 via-yellow-400 to-red-600 rounded-full mb-1" />
                    <div className="flex justify-between text-[8px] font-mono text-white/40 uppercase">
                        <span>Clear</span>
                        <span>Dense Plume</span>
                    </div>
                </div>

                <div className="absolute top-4 left-4 z-[1000] bg-blue-900/40 text-blue-200 border border-blue-500/30 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-2 backdrop-blur-md">
                    <CalendarClock size={12} /> {dateStr}
                </div>
            </div>
        </div>
    )
}
