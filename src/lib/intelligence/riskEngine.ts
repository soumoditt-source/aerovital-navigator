import { AQIData, HealthRisks, User } from '@/types';

export interface CalculatedRisk {
    cardiacRisk: number; // 0-100
    asthmaRisk: number; // 0-100
    generalRisk: number; // 0-100
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
    recommendations: string[];
}

export function calculateHealthRisk(readings: AQIData, user: User | null): CalculatedRisk {
    const aqi = readings.aqi;
    const pm25 = readings.pm25;
    const temp = readings.temperature;

    let cardiacRisk = 0;
    let asthmaRisk = 0;
    const recommendations: string[] = [];

    // Base Risk from AQI
    let baseRisk = (aqi / 500) * 100; // Normalized to 0-100

    // 1. Cardiac Risk Calculation
    // Factors: PM2.5 (high correlation), Temperature (Heat stress), Age, Conditions
    cardiacRisk += (pm25 / 100) * 40; // PM2.5 contribution

    if (temp > 35) cardiacRisk += 20; // Heat stress
    if (temp < 10) cardiacRisk += 10; // Cold stress

    if (user) {
        if (user.age > 50) cardiacRisk *= 1.2;
        if (user.medicalConditions.cardiovascular) {
            cardiacRisk *= 1.5;
            recommendations.push("High Cardiac Stress detected. Heart condition precautions active.");
        }
    }

    // 2. Asthma/Respiratory Risk Calculation
    // Factors: AQI, PM2.5, Respiratory Conditions
    asthmaRisk += (aqi / 400) * 100;

    if (user?.medicalConditions.respiratory) {
        asthmaRisk *= 1.8; // High sensitivity
        recommendations.push("Respiratory Alert: Keep inhaler nearby.");
    }

    // Cap risks at 100
    cardiacRisk = Math.min(cardiacRisk, 100);
    asthmaRisk = Math.min(asthmaRisk, 100);

    // General Risk
    const generalRisk = Math.max(cardiacRisk, asthmaRisk, baseRisk);

    // Determine Level
    let riskLevel: CalculatedRisk['riskLevel'] = 'LOW';
    if (generalRisk > 75) riskLevel = 'SEVERE';
    else if (generalRisk > 50) riskLevel = 'HIGH';
    else if (generalRisk > 25) riskLevel = 'MODERATE';

    // Generate Recommendations
    if (riskLevel === 'SEVERE') {
        recommendations.push("AVOID all outdoor physical activity.");
        recommendations.push("Wear N95/N99 mask if stepping out is unavoidable.");
    } else if (riskLevel === 'HIGH') {
        recommendations.push("Reduce intensity of outdoor exercise.");
        recommendations.push("Sensitive groups should stay indoors.");
    } else if (riskLevel === 'MODERATE') {
        recommendations.push("Limit prolonged outdoor exertion.");
    }

    return {
        cardiacRisk: Math.round(cardiacRisk),
        asthmaRisk: Math.round(asthmaRisk),
        generalRisk: Math.round(generalRisk),
        riskLevel,
        recommendations
    };
}
