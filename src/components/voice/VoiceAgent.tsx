'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';

interface VoiceAgentProps {
    onQuery?: (text: string) => void;
}

export default function VoiceAgent({ onQuery }: VoiceAgentProps) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState<string | null>(null);
    const { user } = useUserStore();

    // Browser Speech Recognition Support
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const reco = new SpeechRecognition();
                reco.continuous = false;
                reco.interimResults = true;
                reco.lang = 'en-US';
                setRecognition(reco);
            }
        }
    }, []);

    const speak = useCallback((text: string) => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            // Try to find a female/pleasant voice
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google US English'));
            if (femaleVoice) utterance.voice = femaleVoice;

            utterance.rate = 1;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }
    }, []);

    const handleStartListening = () => {
        if (recognition) {
            setIsListening(true);
            setTranscript('');
            setResponse(null);
            try {
                recognition.start();
            } catch (e) {
                console.error("Mic already active");
            }
        } else {
            alert("Voice recognition not supported in this browser.");
        }
    };

    const handleStopListening = () => {
        if (recognition) {
            setIsListening(false);
            recognition.stop();
        }
    };

    useEffect(() => {
        if (!recognition) return;

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    setTranscript(event.results[i][0].transcript);
                }
            }

            if (finalTranscript) {
                setTranscript(finalTranscript);
                handleProcessQuery(finalTranscript);
                setIsListening(false);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech error", event.error);
            setIsListening(false);
        };

    }, [recognition]);

    const handleProcessQuery = (query: string) => {
        // Simple Local Intent Matching for Demo
        const lowerQuery = query.toLowerCase();
        let reply = "I didn't quite catch that. Could you say it again?";

        if (lowerQuery.includes('safe') || lowerQuery.includes('air')) {
            reply = `Checking your location. The air quality is currently ${Math.floor(Math.random() * 100 + 50)}. It is moderately safe to go outside.`;
        } else if (lowerQuery.includes('run') || lowerQuery.includes('exercise') || lowerQuery.includes('workout')) {
            reply = "Based on the PM2.5 levels, I recommend an indoor workout today. I've prepared a HIIT session for you.";
        } else if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
            reply = `Hello ${user?.name || 'there'}! I am AeroVital, your atmospheric health guardian. How can I help you breathe better today?`;
        }

        setResponse(reply);
        speak(reply);
        if (onQuery) onQuery(query);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

            <AnimatePresence>
                {(transcript || response) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white/90 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl p-4 max-w-xs mb-2 text-slate-800"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">AeroVital AI</span>
                            <button onClick={() => { setTranscript(''); setResponse(null); window.speechSynthesis.cancel(); }} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                        </div>

                        {transcript && <p className="text-sm text-slate-500 italic mb-2">"{transcript}"</p>}

                        {response && (
                            <div className="flex gap-2 items-start">
                                <div className="w-1 bg-emerald-500 self-stretch rounded-full shrink-0"></div>
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
            h-16 w-16 rounded-full shadow-2xl flex items-center justify-center backdrop-blur-sm border-2
            transition-all duration-300
            ${isListening
                        ? 'bg-red-500/80 border-red-300 text-white animate-pulse'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-600 border-white/30 text-white'
                    }
        `}
            >
                {isListening ? <MicOff size={28} /> : <Mic size={28} />}

                {/* Holographic Ring Effect */}
                {!isListening && (
                    <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20"></div>
                )}
            </motion.button>
        </div>
    );
}
