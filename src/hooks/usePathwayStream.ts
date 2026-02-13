import { useState, useEffect } from 'react'
import { startAQIStream, getStreamingRisks } from '@/lib/api/pathwayClient'

export function usePathwayStream(lat: number, lon: number, userProfile: any) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<any>(null)

    useEffect(() => {
        let interval: NodeJS.Timeout

        async function initStream() {
            try {
                setLoading(true)
                // Start Pathway stream
                await startAQIStream(lat, lon)

                // Poll every 60 seconds
                interval = setInterval(async () => {
                    const result = await getStreamingRisks(lat, lon, userProfile)
                    if (result.success) {
                        setData(result.risks)
                        setLoading(false)
                    }
                }, 60000)

                // Get initial data immediately
                const result = await getStreamingRisks(lat, lon, userProfile)
                if (result.success) {
                    setData(result.risks)
                    setLoading(false)
                }
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
    }, [lat, lon]) // removed userProfile to avoid infinite loop if object ref changes

    return { data, loading, error }
}
