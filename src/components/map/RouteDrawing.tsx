'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Calculator, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import L from 'leaflet';
import 'leaflet-draw';

interface RouteDrawingProps {
    map: L.Map | null;
    onRouteDrawn?: (exposure: number, distance: number) => void;
}

export default function RouteDrawing({ map, onRouteDrawn }: RouteDrawingProps) {
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawnItems] = useState(new L.FeatureGroup());
    const [routeExposure, setRouteExposure] = useState<number | null>(null);
    const [routeDistance, setRouteDistance] = useState<number | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    const calculateRouteExposure = useCallback(async (layer: L.Polyline) => {
        setIsCalculating(true);
        toast.loading('Calculating pollution exposure...');

        try {
            const latlngs = layer.getLatLngs() as L.LatLng[];

            // Calculate total distance
            let totalDistance = 0;
            for (let i = 0; i < latlngs.length - 1; i++) {
                totalDistance += latlngs[i].distanceTo(latlngs[i + 1]);
            }
            totalDistance = totalDistance / 1000; // Convert to km
            setRouteDistance(totalDistance);

            // Sample AQI along the route (every 500m or at each point)
            const samplePoints: L.LatLng[] = [];
            const sampleInterval = 500; // meters

            for (let i = 0; i < latlngs.length - 1; i++) {
                const start = latlngs[i];
                const end = latlngs[i + 1];
                const segmentDistance = start.distanceTo(end);
                const numSamples = Math.ceil(segmentDistance / sampleInterval);

                for (let j = 0; j <= numSamples; j++) {
                    const fraction = j / numSamples;
                    const lat = start.lat + (end.lat - start.lat) * fraction;
                    const lng = start.lng + (end.lng - start.lng) * fraction;
                    samplePoints.push(L.latLng(lat, lng));
                }
            }

            // Fetch AQI for each sample point
            const aqiPromises = samplePoints.map(async (point) => {
                try {
                    // Use WAQI API or your Pathway backend
                    const response = await fetch(
                        `https://api.waqi.info/feed/geo:${point.lat};${point.lng}/?token=demo`
                    );
                    const data = await response.json();
                    return data.data?.aqi || 50; // Default to 50 if no data
                } catch {
                    return 50; // Default AQI if fetch fails
                }
            });

            const aqiValues = await Promise.all(aqiPromises);

            // Calculate weighted exposure (AQI * distance)
            // Assuming average walking speed of 5 km/h
            const timeHours = totalDistance / 5;
            const avgAQI = aqiValues.reduce((sum, aqi) => sum + aqi, 0) / aqiValues.length;
            const exposure = avgAQI * timeHours * 60; // AQI·minutes

            setRouteExposure(Math.round(exposure));

            toast.dismiss();
            toast.success(`Route analyzed! Exposure: ${Math.round(exposure)} AQI·min`);

            if (onRouteDrawn) {
                onRouteDrawn(exposure, totalDistance);
            }

            // Add exposure marker at midpoint
            if (latlngs.length > 0) {
                const midpoint = latlngs[Math.floor(latlngs.length / 2)];
                const marker = L.marker(midpoint, {
                    icon: L.divIcon({
                        className: 'exposure-marker',
                        html: `
              <div style="
                background: ${exposure > 500 ? '#ef4444' : exposure > 200 ? '#f59e0b' : '#10b981'};
                color: white;
                padding: 8px 12px;
                border-radius: 12px;
                font-weight: bold;
                font-size: 12px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                white-space: nowrap;
              ">
                ${Math.round(exposure)} AQI·min
                <br/>
                ${totalDistance.toFixed(2)} km
              </div>
            `,
                        iconSize: [120, 50],
                        iconAnchor: [60, 25]
                    })
                });
                marker.addTo(drawnItems);
            }

        } catch (error) {
            console.error('Route calculation error:', error);
            toast.dismiss();
            toast.error('Failed to calculate exposure');
        } finally {
            setIsCalculating(false);
        }
    }, [onRouteDrawn, drawnItems]);

    useEffect(() => {
        if (!map) return;

        // Add drawn items layer to map
        map.addLayer(drawnItems);

        // Initialize draw control
        // @ts-ignore
        const drawControl = new L.Control.Draw({
            position: 'topright',
            draw: {
                polyline: {
                    shapeOptions: {
                        color: '#3b82f6',
                        weight: 4,
                        opacity: 0.8
                    },
                    metric: true,
                    feet: false,
                    showLength: true
                },
                polygon: false,
                circle: false,
                rectangle: false,
                marker: false,
                circlemarker: false
            },
            edit: {
                featureGroup: drawnItems,
                remove: true
            }
        });

        map.addControl(drawControl);

        // Handle draw created
        // @ts-ignore
        map.on(L.Draw.Event.CREATED, async (e: any) => {
            const layer = e.layer;
            drawnItems.addLayer(layer);

            if (e.layerType === 'polyline') {
                setIsDrawing(false);
                await calculateRouteExposure(layer);
            }
        });

        // Handle draw start
        // @ts-ignore
        map.on(L.Draw.Event.DRAWSTART, () => {
            setIsDrawing(true);
        });

        // Handle draw stop
        // @ts-ignore
        map.on(L.Draw.Event.DRAWSTOP, () => {
            setIsDrawing(false);
        });

        // Handle deleted
        // @ts-ignore
        map.on(L.Draw.Event.DELETED, () => {
            setRouteExposure(null);
            setRouteDistance(null);
            toast.success('Route cleared');
        });

        return () => {
            map.removeControl(drawControl);
            map.removeLayer(drawnItems);
        };
    }, [map, drawnItems, calculateRouteExposure]);

    const clearRoute = () => {
        drawnItems.clearLayers();
        setRouteExposure(null);
        setRouteDistance(null);
        toast.success('Route cleared');
    };

    return (
        <div className="absolute top-20 right-4 z-[500]">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-black/80 backdrop-blur-lg rounded-2xl p-4 border border-white/10 shadow-2xl"
            >
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Pencil size={18} />
                    Route Planner
                </h3>

                {isDrawing && (
                    <div className="mb-3 p-3 bg-blue-500/20 border border-blue-500/50 rounded-xl">
                        <p className="text-blue-200 text-sm">
                            Click on map to draw your route
                        </p>
                    </div>
                )}

                {routeExposure !== null && routeDistance !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-3 p-4 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/20 rounded-xl"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Calculator size={16} className="text-blue-400" />
                            <span className="text-white font-bold text-sm">Exposure Analysis</span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-white/70 text-xs">Total Exposure:</span>
                                <span className={`font-mono font-bold text-sm ${routeExposure > 500 ? 'text-red-400' :
                                    routeExposure > 200 ? 'text-yellow-400' :
                                        'text-green-400'
                                    }`}>
                                    {routeExposure} AQI·min
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-white/70 text-xs">Distance:</span>
                                <span className="text-white font-mono text-sm">
                                    {routeDistance.toFixed(2)} km
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-white/70 text-xs">Est. Time:</span>
                                <span className="text-white font-mono text-sm">
                                    {Math.round(routeDistance / 5 * 60)} min
                                </span>
                            </div>
                        </div>

                        {routeExposure > 500 && (
                            <div className="mt-3 p-2 bg-red-500/20 border border-red-500/50 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-red-200 text-xs">
                                        HIGH RISK: Consider alternative route
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {routeExposure !== null && (
                    <button
                        onClick={clearRoute}
                        className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 font-bold py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 size={16} />
                        Clear Route
                    </button>
                )}

                <div className="mt-3 p-2 bg-white/5 rounded-lg">
                    <p className="text-white/50 text-xs">
                        💡 Draw a route to see pollution exposure
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
