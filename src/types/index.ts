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

// ─────────────────────────────────────────────────────────────────────────────
// WARD INTELLIGENCE TYPES — AeroVital v4.0 (India Innovates 2026)
// FullStack Shinobi · Soumoditya Das & Team
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The dominant atmospheric pollution source detected by the ML classifier.
 * Determined by Random-Forest-equivalent decision rules applied to sensor
 * readings + meteorological features engineered from CPCB/WAQI telemetry.
 */
export type PollutionSource =
  | 'construction_dust'
  | 'biomass_burning'
  | 'vehicular_traffic'
  | 'industrial_emissions'
  | 'secondary_aerosol'
  | 'unknown'

/**
 * AQI risk band aligned with India's National AQI categories (CPCB 2024).
 */
export type WardRiskLevel =
  | 'GOOD'          // 0–50
  | 'SATISFACTORY'  // 51–100
  | 'MODERATE'      // 101–200
  | 'POOR'          // 201–300
  | 'VERY_POOR'     // 301–400
  | 'SEVERE'        // 401+

/**
 * Full data record for a single MCD ward, hydrated by the ward data service.
 * Combines real-time interpolated sensor data with ML source attribution.
 */
export interface WardData {
  wardId: string
  wardName: string
  /** Current AQI (interpolated from nearest CPCB stations via IDW) */
  aqi: number
  pm25: number
  pm10: number
  no2: number
  /** Wind speed in km/h at ward centroid */
  windSpeed: number
  humidity: number
  temperature: number
  /** ML-classified dominant pollution source */
  dominantSource: PollutionSource
  /** Confidence score of the ML classification (0–1) */
  sourceConfidence: number
  riskLevel: WardRiskLevel
  /** Centroid coordinates (WGS-84) */
  lat: number
  lon: number
  /** Whether a NASA FIRMS active fire alert is within 10 km of this ward */
  hasActiveFireAlert: boolean
  /** Timestamp of last data update (Unix ms) */
  updatedAt: number
}

/**
 * AI-generated policy recommendation produced by Gemini for a ward + intervention.
 * Returned by the PolicyGen AI tab in Ward Intelligence Panel.
 */
export interface PolicyRecommendation {
  wardId: string
  wardName: string
  intervention: string
  projectedAqiDelta: number        // Expected AQI change (negative = improvement)
  projectedAqiAfter: number        // Estimated post-intervention AQI
  enforcementText: string          // Human-readable enforcement order for MCD officers
  bylawDraft: string               // Formal MCD bylaw legal language draft
  estimatedHealthSavingsCr: number // ₹ Crore saved in annual health costs (estimate)
  confidenceLevel: 'high' | 'medium' | 'low'
  generatedAt: number              // Unix ms timestamp
}

/**
 * An entry in the Equity Auditor — flags wards with disproportionate
 * pollution burden relative to their socio-economic status.
 * Enables environmental justice reporting.
 */
export interface EquityAuditEntry {
  wardId: string
  wardName: string
  aqi: number
  /** Proxy socio-economic index (0–100, 100=most affluent). Derived from ward infrastructure proxy. */
  socioIndex: number
  /** Pollution injustice score: high AQI + low socioIndex → high injustice (0–100) */
  injusticeScore: number
  dominantSource: PollutionSource
  flagLevel: 'CRITICAL' | 'HIGH' | 'MODERATE'
  recommendedAction: string
}

/**
 * A single data point in a ward's 7-day AQI forecast.
 */
export interface ForecastPoint {
  day: number          // Offset in days from today (0 = today)
  date: string         // ISO date string (YYYY-MM-DD)
  predictedAqi: number
  confidence: number   // Half-width of 80% confidence interval
}

/**
 * A NASA FIRMS active fire detection near the Delhi-NCR region.
 */
export interface FireAlert {
  id: string
  lat: number
  lon: number
  brightness: number          // Brightness temperature (Kelvin)
  frp: number                 // Fire Radiative Power (MW) — intensity metric
  acqDate: string             // Acquisition date (YYYY-MM-DD)
  acqTime: string             // Acquisition time (HHMM UTC)
  distanceFromCenterKm: number
}
