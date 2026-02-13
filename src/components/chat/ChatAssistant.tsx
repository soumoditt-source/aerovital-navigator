'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, Bot, User, MessageSquare, Sparkles, ChevronDown, Zap } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import { useUserStore } from '@/stores/userStore'
import { useAtmosphereStore } from '@/stores/atmosphereStore'
import toast from 'react-hot-toast'

type AIModel = 'pathway' | 'gemini' | 'groq' | 'local';

interface ModelConfig {
    name: string;
    icon: string;
    color: string;
    description: string;
}

const AI_MODELS: Record<AIModel, ModelConfig> = {
    pathway: { name: 'Pathway RAG', icon: '🔮', color: 'blue', description: 'Real-time streaming AI' },
    gemini: { name: 'Gemini Pro', icon: '✨', color: 'purple', description: 'Google AI (Free)' },
    groq: { name: 'Groq LLaMA', icon: '⚡', color: 'green', description: 'Ultra-fast inference' },
    local: { name: 'Local AI', icon: '🧠', color: 'orange', description: 'Offline mode' }
};

export default function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; model?: string }[]>([
        { role: 'assistant', content: 'Hello! I am your AeroVital Intelligence Assistant powered by multiple AI models. How can I help you navigate today\'s atmospheric conditions?', model: 'pathway' }
    ])
    const [isTyping, setIsTyping] = useState(false)
    const [selectedModel, setSelectedModel] = useState<AIModel>('pathway')
    const [showModelSelector, setShowModelSelector] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const { user } = useUserStore()
    const { aqi, temperature, pm25, humidity } = useAtmosphereStore()

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
            let reply = '';

            // Build context for AI
            const context = {
                user: user?.name || 'Unknown',
                age: user?.age || 'N/A',
                aqi,
                pm25,
                temperature,
                humidity,
                healthConditions: user?.healthConditions || [],
                query: userMsg
            };

            switch (selectedModel) {
                case 'pathway':
                    reply = await callPathwayAPI(context);
                    break;
                case 'gemini':
                    reply = await callGeminiAPI(context);
                    break;
                case 'groq':
                    reply = await callGroqAPI(context);
                    break;
                case 'local':
                    reply = getLocalResponse(context);
                    break;
            }

            setMessages(prev => [...prev, { role: 'assistant', content: reply, model: selectedModel }])
            setIsTyping(false)

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `⚠️ ${AI_MODELS[selectedModel].name} is unavailable. Switching to local mode...\n\n${getLocalResponse({ aqi, pm25, temperature, humidity, query: userMsg })}`,
                model: 'local'
            }])
            setIsTyping(false)
        }
    }

    // AI API Functions
    async function callPathwayAPI(context: any): Promise<string> {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_PATHWAY_API_URL || 'http://localhost:8001', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: context.query,
                    user_context: `User: ${context.user}, Age: ${context.age}, AQI: ${context.aqi}, PM2.5: ${context.pm25}, Temp: ${context.temperature}°C`
                }),
                signal: AbortSignal.timeout(10000) // 10s timeout
            });

            if (!response.ok) throw new Error('Pathway API error');
            const data = await response.json();
            return data.response || data.message || getLocalResponse(context);
        } catch (error) {
            console.error('Pathway API failed:', error);
            throw error;
        }
    }

    async function callGeminiAPI(context: any): Promise<string> {
        try {
            const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'demo';
            const prompt = `You are AeroVital AI, an atmospheric health assistant. 
            
Current Conditions:
- AQI: ${context.aqi}
- PM2.5: ${context.pm25} µg/m³
- Temperature: ${context.temperature}°C
- Humidity: ${context.humidity}%

User: ${context.user}, Age: ${context.age}
Health Conditions: ${context.healthConditions.join(', ') || 'None'}

User Question: ${context.query}

Provide a helpful, concise response focused on health and safety.`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                }),
                signal: AbortSignal.timeout(15000)
            });

            if (!response.ok) throw new Error('Gemini API error');
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || getLocalResponse(context);
        } catch (error) {
            console.error('Gemini API failed:', error);
            throw error;
        }
    }

    async function callGroqAPI(context: any): Promise<string> {
        try {
            const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
            if (!apiKey) throw new Error('Groq API key not configured');

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama3-8b-8192',
                    messages: [{
                        role: 'system',
                        content: `You are AeroVital AI. Current AQI: ${context.aqi}, PM2.5: ${context.pm25}, Temp: ${context.temperature}°C. User: ${context.user}, Age: ${context.age}.`
                    }, {
                        role: 'user',
                        content: context.query
                    }],
                    max_tokens: 300,
                    temperature: 0.7
                }),
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) throw new Error('Groq API error');
            const data = await response.json();
            return data.choices?.[0]?.message?.content || getLocalResponse(context);
        } catch (error) {
            console.error('Groq API failed:', error);
            throw error;
        }
    }

    function getLocalResponse(context: any): string {
        const { aqi, pm25, temperature, query } = context;
        const q = query.toLowerCase();

        // Health risk assessment
        if (q.includes('safe') || q.includes('outside') || q.includes('run') || q.includes('exercise')) {
            if (aqi > 200) {
                return `⚠️ **UNSAFE CONDITIONS**\n\nAQI is ${aqi} (Very Unhealthy). I strongly recommend:\n• Stay indoors\n• Keep windows closed\n• Use air purifiers\n• Avoid all outdoor activities\n• Wear N95 mask if you must go out`;
            } else if (aqi > 150) {
                return `⚠️ **CAUTION ADVISED**\n\nAQI is ${aqi} (Unhealthy). Recommendations:\n• Limit outdoor time\n• Avoid strenuous exercise\n• Sensitive groups should stay indoors\n• Consider wearing a mask`;
            } else if (aqi > 100) {
                return `✅ **MODERATE CONDITIONS**\n\nAQI is ${aqi}. It's relatively safe, but:\n• Sensitive individuals should limit prolonged outdoor exertion\n• Light exercise is okay\n• Monitor for symptoms`;
            } else {
                return `✅ **GOOD CONDITIONS**\n\nAQI is ${aqi} - excellent! You can:\n• Exercise outdoors safely\n• Enjoy outdoor activities\n• No special precautions needed`;
            }
        }

        // AQI information
        if (q.includes('aqi') || q.includes('air quality')) {
            return `📊 **Current Air Quality**\n\n• AQI: ${aqi}\n• PM2.5: ${pm25} µg/m³\n• Temperature: ${temperature}°C\n\nStatus: ${aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : aqi <= 150 ? 'Unhealthy for Sensitive Groups' : aqi <= 200 ? 'Unhealthy' : 'Very Unhealthy'}`;
        }

        // Health advice
        if (q.includes('health') || q.includes('symptoms')) {
            return `🏥 **Health Guidance**\n\nWith current AQI of ${aqi}:\n\n${aqi > 150 ? '• Watch for: coughing, throat irritation, breathing difficulty\n• Keep rescue medications handy\n• Consult doctor if symptoms worsen' : '• No immediate health concerns\n• Stay hydrated\n• Monitor air quality changes'}`;
        }

        // Default response
        return `I'm your AeroVital AI assistant. Current conditions:\n\n📊 AQI: ${aqi}\n💨 PM2.5: ${pm25} µg/m³\n🌡️ Temp: ${temperature}°C\n\nHow can I help you stay safe today?`;
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
                            {/* Header with Model Selector */}
                            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700">
                                <div className="flex items-center justify-between mb-2">
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

                                {/* Model Selector */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowModelSelector(!showModelSelector)}
                                        className="w-full bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 flex items-center justify-between transition-colors"
                                    >
                                        <span className="text-xs flex items-center gap-2">
                                            <span>{AI_MODELS[selectedModel].icon}</span>
                                            <span className="font-semibold">{AI_MODELS[selectedModel].name}</span>
                                        </span>
                                        <ChevronDown size={14} className={`transition-transform ${showModelSelector ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {showModelSelector && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-white/10 rounded-lg overflow-hidden z-10"
                                            >
                                                {(Object.keys(AI_MODELS) as AIModel[]).map((model) => (
                                                    <button
                                                        key={model}
                                                        onClick={() => {
                                                            setSelectedModel(model);
                                                            setShowModelSelector(false);
                                                            toast.success(`Switched to ${AI_MODELS[model].name}`);
                                                        }}
                                                        className={`w-full px-3 py-2 text-left hover:bg-white/10 transition-colors ${selectedModel === model ? 'bg-white/5' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span>{AI_MODELS[model].icon}</span>
                                                            <div>
                                                                <div className="text-xs font-semibold text-white">{AI_MODELS[model].name}</div>
                                                                <div className="text-[10px] text-white/50">{AI_MODELS[model].description}</div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
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
                                                <div className="whitespace-pre-wrap">{msg.content}</div>
                                                {msg.model && msg.role === 'assistant' && (
                                                    <div className="text-[9px] text-white/30 mt-1 flex items-center gap-1">
                                                        <span>{AI_MODELS[msg.model as AIModel]?.icon}</span>
                                                        <span>{AI_MODELS[msg.model as AIModel]?.name}</span>
                                                    </div>
                                                )}
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
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder="Ask about AQI, exercise, or health..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim() || isTyping}
                                        className="absolute right-2 top-1.5 p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg transition-colors"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                                <p className="text-[10px] text-white/30 text-center mt-2 font-mono italic">
                                    MULTI-MODEL AI • PATHWAY RAG • GEMINI • GROQ
                                </p>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
