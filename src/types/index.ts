export interface User {
  id: string
  name: string
  age: number
  weight: number  // kg
  height: number  // cm
  bmi: number
  medicalConditions: {
    cardiovascular: boolean
    respiratory: boolean
    metabolic: boolean
    specificConditions: string[]
  }
  medications: string[]
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
  createdAt: string
}

export interface AQIData {
  source: string
  aqi: number
  pm25: number
  pm10: number
  no2: number
  so2: number
  co: number
  o3: number
  temperature: number
  humidity: number
  windSpeed: number
  uvIndex: number
  latitude: number
  longitude: number
  timestamp: number
}

export interface HealthRisks {
  cardiac_risk: number      // 0-10
  asthma_risk: number       // 0-10
  thyroid_risk: number      // 0-10
  exercise_safety: number   // 0-100
  interpretation?: {
    cardiac: string
    asthma: string
    thyroid: string
  }
}

export interface RouteOption {
  id: string
  type: 'safest' | 'fastest' | 'greenest'
  coordinates: [number, number][]
  exposure: number         // AQI·minutes
  distance: number         // km
  duration: number         // minutes
  avgAqi: number
  maxAqi: number
  co2Saved: number        // grams
  treesEquivalent: number
}

export interface Location {
  lat: number
  lon: number
  name?: string
}
