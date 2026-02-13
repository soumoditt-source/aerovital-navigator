/**
 * AEROVITAL NAVIGATOR - Holographic Identity Verification
 * @author Soumoditya Das <soumoditt@gmail.com>
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/stores/userStore'
import { User, Activity, Scale, CheckCircle, ChevronRight, Fingerprint, ScanEye, ShieldCheck } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function Onboarding() {
  const router = useRouter()
  const setUser = useUserStore((state) => state.setUser)
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    conditions: [] as string[],
    height: '',
    weight: ''
  })

  const nextStep = () => setStep(s => s + 1)

  const finish = () => {
    // Calculate BMI
    const h = Number(formData.height) / 100 // cm to m
    const w = Number(formData.weight)
    const bmi = w / (h * h)

    setUser({
      name: formData.name,
      age: Number(formData.age),
      medicalConditions: {
        cardiovascular: formData.conditions.includes('cardio'),
        respiratory: formData.conditions.includes('resp'),
        metabolic: formData.conditions.includes('meta'),
        specificConditions: []
      },
      height: Number(formData.height),
      weight: Number(formData.weight),
      bmi,
      id: crypto.randomUUID(),
      medications: [],
      fitnessLevel: 'intermediate',
      createdAt: new Date().toISOString()
    })

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#8b5cf6', '#ec4899']
    })

    setTimeout(() => router.push('/dashboard'), 1500)
  }

  const steps = [
    // STEP 0: IDENTITY
    <div key="identity" className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
          <Fingerprint size={32} className="text-blue-400 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight uppercase">Identity Auth</h2>
        <p className="text-blue-200/50 text-xs font-mono">SECURE HANDSHAKE PROTOCOL</p>
      </div>

      <div className="space-y-4">
        <div className="group">
          <label className="text-xs uppercase font-bold text-blue-400 tracking-wider mb-2 block group-focus-within:text-white transition-colors">Codename</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-black/40 border border-blue-500/30 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-400 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
            placeholder="Enter Alias..."
            autoFocus
          />
        </div>
        <div className="group">
          <label className="text-xs uppercase font-bold text-blue-400 tracking-wider mb-2 block group-focus-within:text-white transition-colors">Biological Age</label>
          <input
            type="number"
            value={formData.age}
            onChange={e => setFormData({ ...formData, age: e.target.value })}
            className="w-full bg-black/40 border border-blue-500/30 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-400 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
            placeholder="Years"
          />
        </div>
      </div>

      <button
        onClick={nextStep}
        disabled={!formData.name || !formData.age}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-[0_10px_30px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span>Initialize Profile</span>
        <ChevronRight size={18} />
      </button>
    </div>,

    // STEP 1: BIO-SCAN
    <div key="bioscan" className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.5)]">
          <ScanEye size={32} className="text-purple-400 animate-[spin_4s_linear_infinite]" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight uppercase">Bio-Metric Scan</h2>
        <p className="text-purple-200/50 text-xs font-mono">DETECTING VULNERABILITIES</p>
      </div>

      <div className="grid gap-3">
        {[
          { id: 'cardio', label: 'Cardiovascular', icon: Activity, color: 'red' },
          { id: 'resp', label: 'Respiratory (Asthma)', icon: User, color: 'blue' },
          { id: 'meta', label: 'Metabolic (Thyroid)', icon: Scale, color: 'green' }
        ].map(condition => (
          <button
            key={condition.id}
            onClick={() => {
              const newConditions = formData.conditions.includes(condition.id)
                ? formData.conditions.filter(c => c !== condition.id)
                : [...formData.conditions, condition.id]
              setFormData({ ...formData, conditions: newConditions })
            }}
            className={`
              relative group flex items-center justify-between p-4 rounded-xl border transition-all duration-300
              ${formData.conditions.includes(condition.id)
                ? `bg-${condition.color}-500/20 border-${condition.color}-500 shadow-[0_0_20px_rgba(var(--tw-gradient-stops),0.3)]`
                : 'bg-white/5 border-white/10 hover:bg-white/10'}
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${formData.conditions.includes(condition.id) ? `bg-${condition.color}-500 text-white` : 'bg-white/10 text-white/50'}`}>
                <condition.icon size={18} />
              </div>
              <span className="font-bold text-white">{condition.label}</span>
            </div>
            {formData.conditions.includes(condition.id) && (
              <CheckCircle size={18} className={`text-${condition.color}-400`} />
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button onClick={() => setStep(s => s - 1)} className="flex-1 py-4 text-white/50 hover:text-white font-bold">Back</button>
        <button
          onClick={nextStep}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl shadow-[0_10px_30px_rgba(168,85,247,0.4)] transition-all hover:scale-[1.02] active:scale-95"
        >
          Confirm Scan
        </button>
      </div>
    </div>,

    // STEP 2: FINISH
    <div key="finish" className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.5)]">
          <ShieldCheck size={32} className="text-green-400" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight uppercase">System Calibration</h2>
        <p className="text-green-200/50 text-xs font-mono">DEFINING PARAMETERS</p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between text-xs font-bold text-green-400 uppercase mb-2">
            <span>Height (cm)</span>
            <span>{formData.height || '--'} cm</span>
          </div>
          <input
            type="range" min="100" max="250"
            value={formData.height}
            onChange={e => setFormData({ ...formData, height: e.target.value })}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400 transition-all"
          />
        </div>
        <div>
          <div className="flex justify-between text-xs font-bold text-green-400 uppercase mb-2">
            <span>Weight (kg)</span>
            <span>{formData.weight || '--'} kg</span>
          </div>
          <input
            type="range" min="30" max="150"
            value={formData.weight}
            onChange={e => setFormData({ ...formData, weight: e.target.value })}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400 transition-all"
          />
        </div>
      </div>

      <button
        onClick={finish}
        disabled={!formData.height || !formData.weight}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-4 rounded-xl shadow-[0_10px_30px_rgba(34,197,94,0.4)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-lg tracking-widest uppercase mt-8"
      >
        Access Dashboard
      </button>
    </div>
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black flex items-center justify-center p-4 overflow-hidden relative">

      {/* 3D Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />
      </div>

      {/* Main Holographic Application Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md perspective-1000"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl transform scale-105" />

        <div className="relative bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
          {/* Scanline Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-20 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 blur-sm" />

          {/* Progress Bar */}
          <div className="flex justify-between mb-8 px-2">
            {[0, 1, 2].map(i => (
              <div key={i} className={`h-1 flex-1 mx-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  )
}
