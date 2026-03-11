/**
 * AEROVITAL v6.0 — Location Calibration Service
 * Manages real-time geolocation and coordinate-to-ward mapping.
 */

export interface GeoLocation {
    lat: number;
    lon: number;
    accuracy?: number;
    timestamp: number;
}

/**
 * Fallback to IP-based location if Geolocation API fails
 */
export async function getIPLocation(): Promise<GeoLocation> {
    try {
        const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
        if (!res.ok) throw new Error('IP localization failed');
        const data = await res.json();
        return {
            lat: data.latitude,
            lon: data.longitude,
            accuracy: 5000, // IP accuracy is usually low (city-level)
            timestamp: Date.now(),
        };
    } catch (err) {
        throw new Error('All location methods failed');
    }
}

export async function getCurrentLocation(): Promise<GeoLocation> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            getIPLocation().then(resolve).catch(reject);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                resolve({
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                    timestamp: pos.timestamp,
                });
            },
            async (err) => {
                console.warn('Browser geolocation failed, trying IP fallback...', err.message);
                try {
                    const fallback = await getIPLocation();
                    resolve(fallback);
                } catch (fallbackErr) {
                    reject(new Error(err.message || 'Geolocation failed'));
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 0
            }
        );
    });
}

/**
 * Calculates distance between two points in km
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
