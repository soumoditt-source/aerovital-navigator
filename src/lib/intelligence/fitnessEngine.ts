import { AQIData, User } from '@/types';

export interface WorkoutPlan {
    type: 'INDOOR' | 'OUTDOOR' | 'REST';
    intensity: 'LOW' | 'MODERATE' | 'HIGH';
    exercises: Exercise[];
    durationMinutes: number;
    caloriesEstimate: number;
    advice: string;
}

export interface Exercise {
    name: string;
    sets: number;
    reps: string;
    notes?: string;
}

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export function calculateTreesPlanted(completedWorkouts: number): number {
    return Number.parseFloat((completedWorkouts * 0.1).toFixed(1));
}

export async function generateWorkoutPlan(readings: AQIData, user: User | null, dayNumber: number = 1): Promise<WorkoutPlan> {

    // Fallback static plan if NO API KEY is present
    if (!apiKey) {
        console.warn("Gemini API Key missing, falling back to basic engine.");
        const isHighPollution = readings.aqi > 150;
        return {
            type: isHighPollution ? 'INDOOR' : 'OUTDOOR',
            intensity: 'MODERATE',
            exercises: [
                { name: "Jumping Jacks", sets: 3, reps: "20 reps" },
                { name: "Push-ups", sets: 3, reps: "10-15 reps" },
                { name: "Core Planks", sets: 3, reps: "45 secs" }
            ],
            durationMinutes: 30,
            caloriesEstimate: 250,
            advice: "Basic fallback routine loaded. API Key required for ultimate personalization."
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const userContext = user ? `
        Age: ${user.age}
        Fitness Level: ${user.fitnessLevel}
        Vulnerabilities: 
        - Cardiovascular: ${user.medicalConditions.cardiovascular}
        - Respiratory (Asthma/COPD): ${user.medicalConditions.respiratory}
        - Metabolic: ${user.medicalConditions.metabolic}
        ` : "Standard adult user, no specific conditions known.";

        const prompt = `
        You are the AeroVital Ultimate AI Fitness Coach. 
        Analyze the exact environmental conditions to dictate whether a workout should be INDOOR, OUTDOOR, or REST (due to extreme danger).
        
        Current Environmental Data:
        - AQI (Pollution): ${readings.aqi}
        - PM2.5: ${readings.pm25} µg/m³
        - Temperature: ${readings.temperature}°C
        - Humidity: ${readings.humidity}%
        
        User Medical Profile:
        ${userContext}
        
        Generate a highly personalized ${dayNumber > 1 ? `Day ${dayNumber}` : 'daily'} workout plan.
        If AQI > 100 and user has Respiratory issues, MUST be INDOOR.
        If Temp > 35C and user has Cardiovascular, MUST be INDOOR.
        If AQI > 300, consider REST or very LOW intensity indoor stretch.

        Respond ONLY with a valid JSON object matching this exact structure, nothing else:
        {
          "type": "INDOOR" | "OUTDOOR" | "REST",
          "intensity": "LOW" | "MODERATE" | "HIGH",
          "exercises": [
            { "name": "string", "sets": number, "reps": "string", "notes": "optional string" }
          ],
          "durationMinutes": number,
          "caloriesEstimate": number,
          "advice": "A short, encouraging 2-sentence explanation of why you chose this exact routine based on their health and the current pollution/weather."
        }`;

        const result = await model.generateContent(prompt);
        let text = result.response.text();

        // Clean markdown JSON formatting if present
        text = text.replaceAll('```json', '').replaceAll('```', '').trim();

        const plan: WorkoutPlan = JSON.parse(text);
        return plan;

    } catch (error) {
        console.error("AI Fitness Engine Error:", error);

        // Failsafe recovery plan
        return {
            type: 'INDOOR',
            intensity: 'LOW',
            exercises: [
                { name: "Deep Breathing Yoga", sets: 1, reps: "10 mins" },
                { name: "Light Stretching", sets: 1, reps: "10 mins" }
            ],
            durationMinutes: 20,
            caloriesEstimate: 80,
            advice: "We experienced an intelligence drop. Given current AQI, we defaulted to a safe indoor recovery routine."
        };
    }
}


