'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, Timer, Flame, ChevronRight, Play, CheckCircle, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { useUserStore } from '@/stores/userStore'
import { useAtmosphereStore } from '@/stores/atmosphereStore'

// Mock Data for "Six Pack in 30 Days" Program
const DAYS = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    title: i % 4 === 3 ? 'Rest Day' : `Abs Phase ${Math.ceil((i + 1) / 5)}`,
    duration: i % 4 === 3 ? 0 : 15 + Math.floor(i / 5) * 5, // Increasing duration
    exercises: i % 4 === 3 ? [] : [
        { name: 'Jumping Jacks', reps: '30s' },
        { name: 'Abdominal Crunches', reps: 'x16' },
        { name: 'Russian Twist', reps: 'x20' },
        { name: 'Mountain Climber', reps: 'x16' },
        { name: 'Heel Touch', reps: 'x20' },
    ],
    completed: i < 0 // Mock progress
}))

export default function FitnessPage() {
    const user = useUserStore(state => state.user)
    const { aqi } = useAtmosphereStore()
    const [selectedDay, setSelectedDay] = useState<typeof DAYS[0] | null>(null)

    return (
        <div id="fitness-roadmap" className="min-h-screen bg-black text-white font-sans pb-24 overflow-y-auto">
            {/* HEADER IMAGE */}
            <div className="relative h-64 w-full bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
                <div className="absolute bottom-6 left-6">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                        ARMOR <span className="text-blue-500">CORE</span>
                    </h1>
                    <p className="text-sm text-white/70 font-mono tracking-widest">30 DAY PROGRAM // {user?.name || 'OPERATOR'}</p>
                </div>
            </div>

            {/* STATS BAR */}
            <div className="flex justify-around py-6 border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-30">
                <div className="text-center">
                    <div className="text-xs text-white/50 uppercase tracking-widest">Plan</div>
                    <div className="text-xl font-bold">30 Days</div>
                </div>

                <div className="text-center px-4 border-x border-white/10">
                    <div className="text-xs text-white/50 uppercase tracking-widest">Atmosphere</div>
                    <div className={`text-xl font-bold flex items-center gap-1.5 ${aqi > 150 ? 'text-red-500' : 'text-green-500'}`}>
                        {aqi > 150 && <AlertCircle size={16} className="animate-pulse" />}
                        {aqi} AQI
                    </div>
                </div>

                <div className="text-center">
                    <div className="text-xs text-white/50 uppercase tracking-widest">Kcal</div>
                    <div className="text-xl font-bold flex items-center gap-1"><Flame size={16} className="text-orange-500" /> 12.4k</div>
                </div>
            </div>

            {/* DAYS LIST */}
            <div className="max-w-3xl mx-auto p-4 flex flex-col gap-3">
                {DAYS.map((day) => (
                    <motion.div
                        key={day.day}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedDay(day)}
                        className={`relative overflow-hidden rounded-2xl p-4 flex items-center justify-between cursor-pointer border ${day.completed
                            ? 'bg-blue-900/20 border-blue-500/30'
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                            }`}
                    >
                        {day.completed && <div className="absolute inset-0 bg-blue-500/10 z-0" />}

                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${day.completed ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/50'
                                }`}>
                                {day.completed ? <CheckCircle size={20} /> : day.day}
                            </div>
                            <div>
                                <h3 className={`font-bold text-lg ${day.title === 'Rest Day' ? 'text-white/50' : 'text-white'}`}>
                                    {day.title}
                                </h3>
                                {day.duration > 0 && (
                                    <p className="text-xs text-white/50 flex items-center gap-1">
                                        <Timer size={12} /> {day.duration} mins
                                    </p>
                                )}
                            </div>
                        </div>

                        {day.title !== 'Rest Day' && (
                            <ChevronRight className="text-white/20" />
                        )}

                    </motion.div>
                ))}
            </div>

            {/* WORKOUT MODAL (Simplified for MVP) */}
            <AnimatePresence>
                {selectedDay && (
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        className="fixed inset-0 z[100] bg-black flex flex-col z-[200]"
                    >
                        {/* Header */}
                        <div className="h-64 relative">
                            <Image
                                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop"
                                fill
                                className="object-cover opacity-50"
                                alt="Workout Preview"
                                priority
                            />
                            <div className="absolute top-0 left-0 p-6 w-full flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
                                <button onClick={() => setSelectedDay(null)} className="p-2 bg-white/10 rounded-full backdrop-blur">
                                    <ChevronRight className="rotate-180" />
                                </button>
                            </div>
                            <div className="absolute bottom-6 left-6">
                                <h2 className="text-3xl font-black uppercase italic">{selectedDay.title}</h2>
                                <p className="text-blue-400 font-mono text-sm">{selectedDay.duration} MINS // INTENSITY: HIGH</p>
                            </div>
                        </div>

                        {/* Exercise List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {selectedDay.exercises.length > 0 ? selectedDay.exercises.map((ex, idx) => (
                                <div key={`${selectedDay.day}-${ex.name}`} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center">
                                        {/* Placeholder Animation */}
                                        <Dumbbell className="text-white/20 animate-pulse" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-lg">{ex.name}</h4>
                                        <p className="text-sm text-blue-400 font-mono">{ex.reps}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center text-white/50">
                                    <p>Rest and Recover, Soldier.</p>
                                </div>
                            )}
                        </div>

                        {/* Start Button */}
                        {selectedDay.exercises.length > 0 && (
                            <div className="p-6 bg-black border-t border-white/10">
                                <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black italic uppercase tracking-widest text-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 transition-all">
                                    <Play fill="currentColor" /> Start Workout
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
