/**
 * FALLBACK AQI SERVICE
 * Uses Open-Meteo Air Quality API (Free, no credit card)
 * Provides worldwide coverage including key pollutants.
 */

export async function fetchExternalAQI(lat: number, lon: number) {
    try {
        const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide,ozone`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.current) {
            return {
                success: true,
                aqi: data.current.european_aqi || 25,
                pm25: data.current.pm2_5 || 10,
                temperature: 20, // Open-Meteo AQI doesn't include temp, we'd need another API call for that
                humidity: 50,
                source: 'Open-Meteo'
            };
        }
        return { success: false };
    } catch (error) {
        console.error("External AQI Fetch failed:", error);
        return { success: false };
    }
}
