'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Mic, MicOff, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/stores/userStore'
import { useAtmosphereStore } from '@/stores/atmosphereStore'
import { useWardStore } from '@/stores/wardStore'

interface VoiceAgentProps {
  readonly onQuery?: (text: string) => void
}

/**
 * AEROVITAL v5.0 ULTIMATE — Live Gemini Voice AI
 * Features:
 * - Conversation memory
 * - Live injection of Ward Data + AQI context
 * - Web Speech API synthesis & recognition
 */
export default function VoiceAgent({ onQuery }: VoiceAgentProps) {
  const [isListening, setIsListening] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState<string | null>(null)

  const { user } = useUserStore()
  const { aqi } = useAtmosphereStore()
  const wards = useWardStore((s) => s.wards)
  const fireAlerts = useWardStore((s) => s.fireAlerts)

  const [recognition, setRecognition] = useState<any>(null)

  // Keep conversation history
  const historyRef = useRef<{ role: string; parts: { text: string }[] }[]>([])

  useEffect(() => {
    if (globalThis.window !== undefined) {
      // @ts-ignore
      const SpeechRecognition = globalThis.window.SpeechRecognition || globalThis.window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const reco = new SpeechRecognition()
        reco.continuous = false
        reco.interimResults = true
        reco.lang = 'en-IN' // Indian English optimized
        setRecognition(reco)
      }
    }
  }, [])

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in globalThis) {
      globalThis.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)

      const voices = globalThis.speechSynthesis.getVoices()
      // Try finding Indian English or a pleasant Female voice
      const preferred = voices.find(v => v.lang.includes('en-IN') && v.name.includes('Female'))
        || voices.find(v => v.name.includes('Female'))

      if (preferred) utterance.voice = preferred
      utterance.rate = 1.05
      utterance.pitch = 1
      globalThis.speechSynthesis.speak(utterance)
    }
  }, [])

  const handleStartListening = () => {
    if (recognition) {
      setIsListening(true)
      setTranscript('')
      setResponse(null)
      try {
        recognition.start()
      } catch (e: any) {
        if (e.name !== 'InvalidStateError') {
          console.error("Mic error:", e)
        }
      }
    } else {
      alert("Voice recognition not supported in this browser.")
    }
  }

  const handleStopListening = () => {
    if (recognition) {
      setIsListening(false)
      recognition.stop()
    }
  }

  const processVoiceQuery = useCallback(async (query: string) => {
    setIsThinking(true)
    try {
      const { queryPathwayIntel } = await import('@/lib/api/pathwayClient')

      const context = {
        user: user?.name || 'Citizen',
        aqi,
        activeFires: fireAlerts.length,
        severeWards: wards.filter(w => w.aqi > 400).length,
        persona: "AEROVITAL ULTIMATE (v6.0)",
        mission: "Startup-Grade Atmospheric Intelligence"
      }

      const res = await queryPathwayIntel(query, context)
      const replyText = res.success ? (res.response || res.message) : "Offline mode: Shield active."

      historyRef.current.push({ role: "user", parts: [{ text: query }] })
      historyRef.current.push({ role: "model", parts: [{ text: replyText }] })

      setResponse(replyText)
      speak(replyText)
      if (onQuery) onQuery(query)

    } catch (err) {
      console.error(err)
      const fallback = "System offline. Neural link disrupted."
      setResponse(fallback)
      speak(fallback)
    } finally {
      setIsThinking(false)
    }
  }, [user, aqi, wards, fireAlerts, onQuery, speak])

  useEffect(() => {
    if (!recognition) return

    recognition.onresult = (event: any) => {
      let currentTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const text = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          setTranscript(text)
          setIsListening(false)
          processVoiceQuery(text)
        } else {
          currentTranscript += text
          setTranscript(currentTranscript)
        }
      }
    }

    recognition.onend = () => setIsListening(false)
    recognition.onerror = (event: any) => setIsListening(false)

  }, [recognition, processVoiceQuery])

  return (
    <div className="fixed bottom-40 right-6 sm:bottom-48 sm:right-10 z-[70] flex flex-col items-end gap-2">
      <AnimatePresence>
        {(transcript || response || isThinking) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-black/90 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-4 max-w-xs mb-2 text-white"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Gemini Live Voice
              </span>
              <button
                title="Close Voice Output"
                onClick={() => { setTranscript(''); setResponse(null); globalThis.speechSynthesis.cancel() }}
                className="text-white/40 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            {transcript && <p className="text-sm text-white/70 italic mb-2">&quot;{transcript}&quot;</p>}

            {isThinking && (
              <div className="flex items-center gap-2 text-blue-400 text-xs py-2">
                <Loader2 size={12} className="animate-spin" /> Gathering Intel...
              </div>
            )}

            {response && !isThinking && (
              <div className="flex gap-3 items-start mt-2 bg-blue-900/20 p-3 rounded-xl border border-blue-500/20">
                <p className="text-sm font-medium leading-relaxed">{response}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isListening ? handleStopListening : handleStartListening}
        className={`
          h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center justify-center backdrop-blur-sm border-2
          transition-all duration-300
          ${isListening ? 'bg-red-500 border-red-300 text-white animate-pulse' : 'bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-400/50 text-white'}
        `}
      >
        {isListening ? <MicOff size={24} className="sm:w-7 sm:h-7" /> : <Mic size={24} className="sm:w-7 sm:h-7" />}

        {!isListening && (
          <div className="absolute inset-0 rounded-full border border-blue-400/50 animate-ping opacity-30"></div>
        )}
      </motion.button>
    </div >
  )
}
