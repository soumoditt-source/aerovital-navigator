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

function getPersonalizedIntensity(user: User | null, defaultIntensity: WorkoutPlan['intensity'], defaultType: WorkoutPlan['type'], readings: AQIData) {
    if (!user) return { intensity: defaultIntensity, type: defaultType };

    let newIntensity = defaultIntensity;
    let newType = defaultType;

    if (user.fitnessLevel === 'advanced') newIntensity = 'HIGH';
    if (user.fitnessLevel === 'beginner') newIntensity = 'LOW';

    if (user.medicalConditions.respiratory && readings.aqi > 100) {
        newType = 'INDOOR';
        newIntensity = 'LOW';
    }
    if (user.medicalConditions.cardiovascular && readings.temperature > 35) {
        newType = 'INDOOR';
        newIntensity = 'LOW';
    }
    return { intensity: newIntensity, type: newType };
}

function getExercises(type: WorkoutPlan['type'], intensity: WorkoutPlan['intensity']) {
    const exercises: Exercise[] = [];
    let duration: number;
    let calories: number;

    if (type === 'INDOOR') {
        exercises.push(
            { name: "Warm-up: High Knees", sets: 3, reps: "30 secs" },
            { name: "Bodyweight Squats", sets: 3, reps: "15 reps" },
            { name: "Push-ups (or Knee Push-ups)", sets: 3, reps: "10-12 reps" },
            { name: "Plank Hold", sets: 3, reps: "30-45 secs" },
            { name: "Cool-down: Child's Pose", sets: 1, reps: "2 mins" }
        );
        duration = 25;
        calories = 150 * (intensity === 'HIGH' ? 1.5 : 1);
    } else {
        exercises.push(
            { name: "Brisk Walk / Jog", sets: 1, reps: "20 mins", notes: "Maintain steady pace" },
            { name: "Park Bench Dips", sets: 3, reps: "10 reps" },
            { name: "Lunges", sets: 3, reps: "10 per leg" }
        );
        duration = 45;
        calories = 300 * (intensity === 'HIGH' ? 1.2 : 0.8);
    }
    return { exercises, duration, calories };
}

export function generateWorkoutPlan(readings: AQIData, user: User | null, dayNumber: number = 1): WorkoutPlan {
    const isHighPollution = readings.aqi > 150;
    const initialType = isHighPollution ? 'INDOOR' : 'OUTDOOR';
    const initialIntensity = 'MODERATE';

    const { type, intensity } = getPersonalizedIntensity(user, initialIntensity, initialType, readings);
    const { exercises, duration, calories } = getExercises(type, intensity);

    return {
        type,
        intensity,
        exercises,
        durationMinutes: duration,
        caloriesEstimate: Math.round(calories),
        advice: type === 'INDOOR'
            ? `AQI is ${readings.aqi}. It's unsafe for outdoor exercise. We've switched you to an Indoor Home Workout.`
            : `Air quality is acceptable (${readings.aqi}). Enjoy your outdoor session!`
    };
}

export function calculateTreesPlanted(completedWorkouts: number): number {
    // Gamification strategy: 1 workout = 0.1 trees (approx)
    return Number.parseFloat((completedWorkouts * 0.1).toFixed(1));
}
