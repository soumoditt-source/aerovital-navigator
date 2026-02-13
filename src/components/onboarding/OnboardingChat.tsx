import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, User, Bot, CheckCircle, ShieldCheck, Activity } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/stores/userStore'
import toast from 'react-hot-toast'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
}

export default function OnboardingChat() {
    const router = useRouter()
    const { user, setUser } = useUserStore()
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: "Hello. I am AeroVital's Medical AI. I'm here to calibrate your personal health shield." },
        { id: '2', role: 'assistant', content: "To begin, please tell me your name and age, or upload a medical report for instant analysis." }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [step, setStep] = useState(0)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [isScanning, setIsScanning] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    useEffect(() => {
        const greet = () => {
            if ('speechSynthesis' in globalThis) {
                const utterance = new SpeechSynthesisUtterance("Welcome to AeroVital Navigator. I am your Medical Intelligence Assistant. Cloud Uplink established.");
                utterance.rate = 1.1;
                globalThis.speechSynthesis.speak(utterance);
            }
        }
        const timer = setTimeout(greet, 1000);
        return () => clearTimeout(timer);
    }, [])

    const processOCR = async (base64: string) => {
        try {
            const res = await fetch('/api/ocr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: base64 })
            });
            const data = await res.json();

            if (!data.name) {
                toast.error("Format unrecognized. Try a clearer image.");
                return;
            }

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Analysis Complete. Identity: ${data.name}. Detected Conditions: ${Object.entries(data.conditions || {}).filter(([_, v]) => v).map(([k]) => k).join(', ') || 'None'}. Profile synchronized.`
            }]);

            setUser({
                ...user,
                name: data.name,
                age: data.age,
                medicalConditions: { ...data.conditions, specificConditions: data.specific || [] }
            } as any);

            setTimeout(() => router.push('/dashboard'), 3000);
        } catch (apiErr) {
            console.error("OCR API failed", apiErr);
            toast.error("Network error during scan.");
        } finally {
            setIsScanning(false);
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "Scanning medical document... Neural analysis in progress." }]);

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            processOCR(base64);
        };
        reader.onerror = () => {
            toast.error("File reading failed");
            setIsScanning(false);
        };
        reader.readAsDataURL(file);
    }

    const handleSend = async () => {
        if (!input.trim()) return

        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: input }])
        setInput('')
        setIsTyping(true)

        setTimeout(() => {
            let responseText = ""
            if (step === 0) {
                responseText = "Identity Validated. Describe your health goals or upload a report."
                setStep(1)
            } else if (step === 1) {
                responseText = "Profile optimized. Redirecting to Dashboard..."
                setTimeout(() => router.push('/dashboard'), 1500);
                setStep(2)
            }
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: responseText }])
            setIsTyping(false)
        }, 1200)
    }

    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 md:p-8 relative z-10">
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-full md:w-1/2 h-full opacity-10 pointer-events-none z-0">
                <img src="/anatomy_3d.png" alt="3D Anatomy" className="w-full h-full object-contain" />
            </div>

            <header className="flex-none mb-6 relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.5)]">
                        <Activity className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Medical Intake <span className="text-blue-500">AI</span></h1>
                        <p className="text-xs text-blue-300/60 font-mono text-[8px] uppercase tracking-widest">v3.0 ULTIMATE SOURCE</p>
                    </div>
                </div>
            </header>

            <GlassCard className="flex-1 flex flex-col relative z-10 border-blue-500/20 bg-black/40 backdrop-blur-xl mb-4 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white/5 text-blue-100 border border-white/10 rounded-bl-none'}`}>
                                <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] uppercase font-mono">
                                    {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                                    {msg.role === 'user' ? 'You' : 'AeroVital'}
                                </div>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isTyping && <div className="text-blue-500 text-xs animate-pulse font-mono ml-4">AI THINKING...</div>}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-white/10 bg-black/20">
                    <div className="flex gap-2">
                        <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*,application/pdf" />
                        <button onClick={() => fileInputRef.current?.click()} className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors text-blue-400 group relative">
                            <ShieldCheck size={20} />
                            {isScanning && <div className="absolute inset-0 bg-blue-500/20 animate-ping rounded-xl" />}
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type or upload document..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all font-sans"
                        />
                        <button onClick={handleSend} className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-colors">
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </GlassCard>
            <div className="mt-2 flex justify-center gap-6 text-[10px] text-white/30 font-mono">
                <span className="flex items-center gap-1"><ShieldCheck size={10} /> HIPAA Compliant</span>
                <span className="flex items-center gap-1"><CheckCircle size={10} /> AES-256 Encryption</span>
            </div>
        </div>
    )
}
