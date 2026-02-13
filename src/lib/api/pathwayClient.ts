/**
 * AEROVITAL NAVIGATOR - Pathway API Client
 * 
 * Handles secure communication with the Python Pathway backend running on Google Colab.
 * Manages streaming connections for real-time AQI and risk calculations.
 * 
 * @author Soumoditya Das <soumoditt@gmail.com>
 */

const API_URL = process.env.NEXT_PUBLIC_PATHWAY_API_URL

export async function startAQIStream(lat: number, lon: number) {
    if (!API_URL) return { success: false, message: 'API URL not configured' }
    try {
        const response = await fetch(`${API_URL}/api/aqi/stream/start?lat=${lat}&lon=${lon}`)
        return await response.json()
    } catch (error) {
        console.error('Error starting stream:', error)
        return { success: false, error }
    }
}

export async function getStreamingRisks(lat: number, lon: number, userProfile: any) {
    if (!API_URL) return { success: false, message: 'API URL not configured' }
    try {
        const response = await fetch(`${API_URL}/api/risk/stream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat, lon, user_profile: userProfile })
        })
        return await response.json()
    } catch (error) {
        console.error('Error getting risks:', error)
        return { success: false, error }
    }
}

export async function detectSpike(lat: number, lon: number) {
    if (!API_URL) return { success: false, message: 'API URL not configured' }
    try {
        const response = await fetch(`${API_URL}/api/spike/detect?lat=${lat}&lon=${lon}`)
        return await response.json()
    } catch (error) {
        console.error('Error detecting spike:', error)
        return { success: false, error }
    }
}
