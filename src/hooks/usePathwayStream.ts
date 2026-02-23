import { useState, useEffect } from 'react'
import { startAQIStream, getStreamingRisks, getCurrentReadings } from '@/lib/api/pathwayClient'
import { fetchExternalAQI } from '@/lib/api/externalAqi'
import { useAtmosphereStore } from '@/stores/atmosphereStore'

export function usePathwayStream(lat: number, lon: number, userProfile: any) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<any>(null)
    const setAtmosphere = useAtmosphereStore(state => state.setReadings)

    const pollData = useCallback(async () => {
        const fallback = await fetchExternalAQI(lat, lon);
        if (fallback.success) {
            setData((prev: any) => ({ ...prev, readings: fallback }));
            setAtmosphere({
                aqi: fallback.aqi,
                pm25: fallback.pm25,
                temperature: fallback.temperature ?? 0,
                humidity: fallback.humidity ?? 0
            });
        }
    }, [lat, lon, setAtmosphere]);

    const initStream = useCallback(async () => {
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
                        temperature: fallback.temperature ?? 0,
                        humidity: fallback.humidity ?? 0
                    });
                }
            }

            setLoading(false)

        } catch (err) {
            setError(err)
            setLoading(false)
        }
    }, [lat, lon, userProfile, setAtmosphere]);

    useEffect(() => {
        let interval: NodeJS.Timeout

        if (lat && lon) {
            initStream().then(() => {
                interval = setInterval(pollData, 60000);
            });
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [lat, lon, initStream, pollData])

    return { data, loading, error }
}
