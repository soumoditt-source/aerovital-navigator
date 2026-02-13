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

export function generateWorkoutPlan(readings: AQIData, user: User | null, dayNumber: number = 1): WorkoutPlan {
    const isHighPollution = readings.aqi > 150;
    const isModeratePollution = readings.aqi > 100;

    let type: WorkoutPlan['type'] = isHighPollution ? 'INDOOR' : 'OUTDOOR';
    let intensity: WorkoutPlan['intensity'] = 'MODERATE';

    // Basic personalization
    if (user) {
        if (user.fitnessLevel === 'advanced') intensity = 'HIGH';
        if (user.fitnessLevel === 'beginner') intensity = 'LOW';

        // Safety overrides
        if (user.medicalConditions.respiratory && readings.aqi > 100) {
            type = 'INDOOR';
            intensity = 'LOW';
        }
        if (user.medicalConditions.cardiovascular && readings.temperature > 35) {
            type = 'INDOOR';
            intensity = 'LOW';
        }
    }

    // Generate Exercises based on Day & Type
    const exercises: Exercise[] = [];
    let duration = 30;
    let calories = 200;

    if (type === 'INDOOR') {
        exercises.push({ name: "Warm-up: High Knees", sets: 3, reps: "30 secs" });
        exercises.push({ name: "Bodyweight Squats", sets: 3, reps: "15 reps" });
        exercises.push({ name: "Push-ups (or Knee Push-ups)", sets: 3, reps: "10-12 reps" });
        exercises.push({ name: "Plank Hold", sets: 3, reps: "30-45 secs" });
        exercises.push({ name: "Cool-down: Child's Pose", sets: 1, reps: "2 mins" });
        duration = 25;
        calories = 150 * (intensity === 'HIGH' ? 1.5 : 1);
    } else {
        // Outdoor
        exercises.push({ name: "Brisk Walk / Jog", sets: 1, reps: "20 mins", notes: "Maintain steady pace" });
        exercises.push({ name: "Park Bench Dips", sets: 3, reps: "10 reps" });
        exercises.push({ name: "Lunges", sets: 3, reps: "10 per leg" });
        duration = 45;
        calories = 300 * (intensity === 'HIGH' ? 1.2 : 0.8);
    }

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
    return parseFloat((completedWorkouts * 0.1).toFixed(1));
}
