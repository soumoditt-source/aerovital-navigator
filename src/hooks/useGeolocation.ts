import { useState, useEffect } from 'react'

interface GeoState {
    lat: number | null
    lon: number | null
    error: string | null
    loading: boolean
}

export function useGeolocation() {
    const [geo, setGeo] = useState<GeoState>({
        lat: null,
        lon: null,
        error: null,
        loading: true
    })

    useEffect(() => {
        if (!navigator.geolocation) {
            setGeo(prev => ({ ...prev, error: 'Geolocation not supported', loading: false }))
            return
        }

        const success = (position: GeolocationPosition) => {
            setGeo({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                error: null,
                loading: false
            })
        }

        const error = (err: GeolocationPositionError) => {
            setGeo(prev => ({ ...prev, error: err.message, loading: false }))
        }

        navigator.geolocation.getCurrentPosition(success, error, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        })
    }, [])

    return geo
}
