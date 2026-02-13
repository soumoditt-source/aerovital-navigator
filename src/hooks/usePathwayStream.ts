import { useState, useEffect } from 'react'
import { startAQIStream, getStreamingRisks, getCurrentReadings } from '@/lib/api/pathwayClient'
import { fetchExternalAQI } from '@/lib/api/externalAqi'
import { useAtmosphereStore } from '@/stores/atmosphereStore'

export function usePathwayStream(lat: number, lon: number, userProfile: any) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<any>(null)
    const setAtmosphere = useAtmosphereStore(state => state.setReadings)

    useEffect(() => {
        let interval: NodeJS.Timeout

        async function initStream() {
            try {
                setLoading(true)

                // 1. Try Pathway
                let pathwayReading = null;
                try {
                    await startAQIStream(lat, lon)
                    const [riskRes, readingsRes] = await Promise.all([
                        getStreamingRisks(lat, lon, userProfile),
                        getCurrentReadings(lat, lon)
                    ])
                    if (readingsRes.success) {
                        pathwayReading = readingsRes;
                        setData({ risks: riskRes.success ? riskRes.risks : null, readings: readingsRes })
                    }
                } catch (e) {
                    console.warn("Pathway failed, trying fallback...", e);
                }

                // 2. Fallback to External API if Pathway is unavailable
                if (pathwayReading) {
                    setAtmosphere({
                        aqi: pathwayReading.aqi,
                        pm25: pathwayReading.pm25,
                        temperature: pathwayReading.temperature,
                        humidity: pathwayReading.humidity
                    });
                } else {
                    const fallback = await fetchExternalAQI(lat, lon);
                    if (fallback.success) {
                        setData({ readings: fallback, risks: null });
                        setAtmosphere({
                            aqi: fallback.aqi,
                            pm25: fallback.pm25,
                            temperature: fallback.temperature,
                            humidity: fallback.humidity
                        });
                    }
                }

                setLoading(false)

                // Polling logic
                interval = setInterval(async () => {
                    const fallback = await fetchExternalAQI(lat, lon);
                    if (fallback.success) {
                        setData(prev => ({ ...prev, readings: fallback }));
                        setAtmosphere({
                            aqi: fallback.aqi,
                            pm25: fallback.pm25,
                            temperature: fallback.temperature,
                            humidity: fallback.humidity
                        });
                    }
                }, 60000)

            } catch (err) {
                setError(err)
                setLoading(false)
            }
        }

        if (lat && lon) {
            initStream()
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [lat, lon, setAtmosphere, userProfile])

    return { data, loading, error }
}
