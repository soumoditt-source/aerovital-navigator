'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Wind, TreePine, Timer, Flame } from 'lucide-react';
import { generateWorkoutPlan, WorkoutPlan, calculateTreesPlanted } from '@/lib/intelligence/fitnessEngine';
import { useUserStore } from '@/stores/userStore';
import { AQIData } from '@/types';

interface FitnessCoachProps {
    readonly aqiData: AQIData;
}

export default function FitnessCoach({ aqiData }: FitnessCoachProps) {
    const { user } = useUserStore();
    const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
    const [completedWorkouts, setCompletedWorkouts] = useState(0);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchPlan = async () => {
            if (aqiData) {
                setLoading(true);
                try {
                    const plan = await generateWorkoutPlan(aqiData, user, 1);
                    if (isMounted) setWorkout(plan);
                } catch (e) {
                    console.error("Failed to generate plan", e);
                } finally {
                    if (isMounted) setLoading(false);
                }
            }
        };
        fetchPlan();
        return () => { isMounted = false; };
    }, [aqiData, user]);

    if (!workout && !loading) return null;

    if (loading) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px] space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                <div className="text-center">
                    <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs animate-pulse">Gemini AI Engine Active</p>
                    <p className="text-white/50 text-[10px] mt-2 font-mono">Synthesizing bio-metrics & atmospheric indices...</p>
                </div>
            </div>
        );
    }

    const trees = calculateTreesPlanted(completedWorkouts);

    let borderColor = 'bg-emerald-500/20 border-emerald-500/50';
    let typeIcon = <TreePine size={20} />;

    if (workout!.type === 'INDOOR') {
        borderColor = 'bg-amber-500/20 border-amber-500/50';
        typeIcon = <Wind size={20} />;
    } else if (workout!.type === 'REST') {
        borderColor = 'bg-red-500/20 border-red-500/50';
        typeIcon = <Timer size={20} />;
    }

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Dumbbell size={100} />
                </div>

                <h2 className="text-2xl font-bold mb-1">Clean Air Fitness Coach</h2>
                <p className="text-white/70 mb-4 text-sm">AI-Optimized for current AQI {aqiData.aqi}</p>

                <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-xl border ${borderColor}`}>
                        <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Recommendation</p>
                        <div className="flex items-center gap-2 font-bold text-lg">
                            {typeIcon}
                            {workout!.type}
                        </div>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/50">
                        <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Est. Burn</p>
                        <div className="flex items-center gap-2 font-bold text-lg">
                            <Flame size={20} />
                            {workout!.caloriesEstimate} kcal
                        </div>
                    </div>
                </div>

                <div className="mt-4 text-sm bg-black/20 p-3 rounded-lg border border-white/10">
                    <span className="font-semibold text-emerald-400">⚡ Gemini Insight:</span> {workout!.advice}
                </div>
            </div>

            {/* Routine list */}
            <div className="space-y-3">
                <h3 className="text-white/90 font-semibold flex items-center gap-2">
                    <Timer className="text-emerald-400" size={18} />
                    Today&apos;s Routine ({workout!.durationMinutes} min)
                </h3>

                {workout!.exercises.map((ex, idx) => (
                    <motion.div
                        key={`${ex.name}-${idx}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center hover:bg-white/10 transition-colors"
                    >
                        <div>
                            <p className="font-medium text-white">{ex.name}</p>
                            {ex.notes && <p className="text-xs text-secondary-300">{ex.notes}</p>}
                        </div>
                        <div className="text-right">
                            <p className="text-emerald-400 font-bold text-sm">{ex.reps}</p>
                            <p className="text-xs text-secondary-400">{ex.sets} sets</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Gamification */}
            <div className="bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-wider text-emerald-300 mb-1">Your Impact</p>
                    <p className="text-2xl font-bold text-white">{trees} Trees Planted 🌳</p>
                </div>
                <button
                    onClick={() => setCompletedWorkouts(c => c + 1)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg shadow-lg transition-all"
                >
                    Complete Workout
                </button>
            </div>
        </div>
    );
}
