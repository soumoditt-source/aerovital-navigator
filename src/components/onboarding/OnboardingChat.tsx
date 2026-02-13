import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, User, Bot, CheckCircle, ShieldCheck, Activity } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/stores/userStore'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    type?: 'text' | 'form' | 'analysis'
}

export default function OnboardingChat() {
    const router = useRouter()
    const setUser = useUserStore(state => state.setUser)
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: "Hello. I am AeroVital's Medical AI. I'm here to calibrate your personal health shield.", type: 'text' },
        { id: '2', role: 'assistant', content: "To begin, please tell me your name and age, or upload a medical report for instant analysis.", type: 'text' }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [step, setStep] = useState(0) // 0: Name/Age, 1: Conditions, 2: Goals, 3: Finalize
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsTyping(true)

        // Simulate AI Processing (Mocking the Pathway RAG response time of ~800ms)
        setTimeout(() => {
            let responseText = ""

            if (step === 0) {
                responseText = "Processing Identity... Validated. Now, simply describe any health conditions you have (e.g., 'I have asthma' or 'No issues'). You can speak freely."
                setStep(1)
            } else if (step === 1) {
                responseText = "Health Profile Updated. Analyzing anatomical risks... Based on your input, I'm configuring the 'Respiratory Shield'. Finally, what is your primary fitness goal?"
                setStep(2)
            } else if (step === 2) {
                responseText = "Optimization Complete. Your AeroVital Dashboard is ready. Initiating Real-Time Satellite Uplink..."
                setTimeout(() => {
                    setUser({
                        name: "Commander", // Simplified for demo flow
                        age: 30,
                        fitnessLevel: 'intermediate',
                        medicalConditions: { cardiovascular: false, respiratory: false, metabolic: false, specificConditions: [] },
                        id: crypto.randomUUID(),
                        weight: 70, // Default for demo
                        height: 175, // Default for demo
                        bmi: 22.8,
                        medications: [],
                        createdAt: new Date().toISOString()
                    })
                    router.push('/dashboard')
                }, 2500)
                setStep(3)
            }

            const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: responseText }
            setMessages(prev => [...prev, aiMsg])
            setIsTyping(false)
        }, 1500)
    }

    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 md:p-8 relative z-10">

            {/* 3D Anatomy Visualization Area (Right Side / Background on Mobile) */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-full md:w-1/2 h-full opacity-20 md:opacity-80 pointer-events-none z-0">
                <img src="/anatomy_3d.png" alt="3D Anatomy" className="w-full h-full object-contain animate-pulse-slow" />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black" />
            </div>

            <header className="flex-none mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.5)]">
                        <Activity className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Medical Intake <span className="text-blue-500">AI</span></h1>
                        <p className="text-xs text-blue-300/60 font-mono">SECURE CHANNEL // ENCRYPTED</p>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <GlassCard className="flex-1 flex flex-col relative z-10 border-blue-500/20 bg-black/40 backdrop-blur-xl">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {messages.map((msg) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={msg.id}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-600/20'
                                : 'bg-white/10 text-blue-100 rounded-bl-none border border-white/5'
                                }`}>
                                <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] font-mono uppercase">
                                    {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                                    {msg.role === 'user' ? 'You' : 'AeroVital AI'}
                                </div>
                                <p className="leading-relaxed text-sm">{msg.content}</p>
                            </div>
                        </motion.div>
                    ))}

                    {isTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="bg-white/5 text-blue-300 rounded-2xl rounded-bl-none p-4 flex gap-2 items-center">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-black/20">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your response..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all font-sans"
                        />
                        <button
                            onClick={handleSend}
                            className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                    <div className="mt-2 flex justify-center gap-4 text-[10px] text-white/30 font-mono">
                        <span className="flex items-center gap-1"><ShieldCheck size={10} /> HIPAA Compliant</span>
                        <span className="flex items-center gap-1"><CheckCircle size={10} /> AES-256 Encryption</span>
                    </div>
                </div>
            </GlassCard>
        </div>
    )
}
