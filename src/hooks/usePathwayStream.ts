import { useState, useEffect } from 'react'
import { startAQIStream, getStreamingRisks, getCurrentReadings } from '@/lib/api/pathwayClient'
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
                // Start Pathway stream
                await startAQIStream(lat, lon)

                const updateStore = (readings: any) => {
                    if (readings && readings.success) {
                        setAtmosphere({
                            aqi: readings.aqi,
                            pm25: readings.pm25,
                            temperature: readings.temperature,
                            humidity: readings.humidity
                        })
                    }
                }

                // Poll every 60 seconds
                interval = setInterval(async () => {
                    const [riskRes, readingsRes] = await Promise.all([
                        getStreamingRisks(lat, lon, userProfile),
                        getCurrentReadings(lat, lon)
                    ])

                    if (riskRes.success) {
                        setData(prev => ({ ...prev, risks: riskRes.risks }))
                    }
                    if (readingsRes.success) {
                        setData(prev => ({ ...prev, readings: readingsRes }))
                        updateStore(readingsRes)
                    }
                    setLoading(false)
                }, 60000)

                // Get initial data immediately
                const [riskRes, readingsRes] = await Promise.all([
                    getStreamingRisks(lat, lon, userProfile),
                    getCurrentReadings(lat, lon)
                ])

                setData({
                    risks: riskRes.success ? riskRes.risks : null,
                    readings: readingsRes.success ? readingsRes : null
                })
                updateStore(readingsRes)
                setLoading(false)
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
    }, [lat, lon, setAtmosphere])

    return { data, loading, error }
}
