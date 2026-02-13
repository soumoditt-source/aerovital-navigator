'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, Bot, User, MessageSquare, Sparkles } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import { useUserStore } from '@/stores/userStore'
import { useAtmosphereStore } from '@/stores/atmosphereStore'

export default function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
        { role: 'assistant', content: 'Hello! I am your AeroVital Intelligence Assistant. How can I help you navigate today\'s atmospheric conditions?' }
    ])
    const [isTyping, setIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const { user } = useUserStore()
    const { aqi, temperature } = useAtmosphereStore()

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg = input
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setIsTyping(true)

        try {
            // Connect to Pathway Chat Endpoint
            const response = await fetch('http://localhost:8001', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: userMsg,
                    user_context: `User: ${user?.name || 'Unknown'}, Age: ${user?.age || 'N/A'}, AQI: ${aqi}, Temp: ${temperature}`
                })
            })

            // In a real scenario, this would be a stream from port 8000/api/chat/stream
            // For now, we simulate the Pathway response
            setTimeout(() => {
                const reply = aqi > 200
                    ? "The AQI is currently hazardous. I strongly recommend staying indoors and using an air purifier."
                    : `AQI is ${aqi}. Conditions are relatively stable. ${userMsg.toLowerCase().includes('run') ? 'It is safe for a light jog.' : 'You can proceed with your daily activities.'}`;

                setMessages(prev => [...prev, { role: 'assistant', content: reply }])
                setIsTyping(false)
            }, 1500)

        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Neural link interrupted. Please ensure the Pathway engine is running.' }])
            setIsTyping(false)
        }
    }

    return (
        <>
            {/* Floating Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 z-[60] h-14 w-14 rounded-full bg-blue-600 text-white shadow-2xl flex items-center justify-center border border-white/20"
            >
                <MessageSquare size={24} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-24 right-6 z-[100] w-[90vw] max-w-[400px] h-[600px] max-h-[70vh] flex flex-col"
                    >
                        <GlassCard className="h-full flex flex-col p-0 overflow-hidden border-blue-500/20 shadow-blue-500/10">
                            {/* Header */}
                            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg">
                                        <Bot size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">AeroVital Intel</h3>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                            <span className="text-[10px] text-white/70 uppercase tracking-tighter">Neural Link Active</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Messages Area */}
                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20"
                            >
                                {messages.map((msg, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800 border-white/10'
                                                }`}>
                                                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                            </div>
                                            <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user'
                                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                                    : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'
                                                }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                                            <Sparkles size={14} className="animate-spin text-blue-400" />
                                        </div>
                                        <div className="p-3 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" />
                                            <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white/5 border-t border-white/10">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Ask about AQI, exercise, or health..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim()}
                                        className="absolute right-2 top-1.5 p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg transition-colors"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                                <p className="text-[10px] text-white/30 text-center mt-2 font-mono italic">
                                    POWERED BY PATHWAY RAG ENGINE
                                </p>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
