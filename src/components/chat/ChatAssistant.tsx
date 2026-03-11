'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, Bot, User, MessageSquare, Sparkles, ChevronDown } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import { useUserStore } from '@/stores/userStore'
import { useAtmosphereStore } from '@/stores/atmosphereStore'
import { useLanguageStore, LANGUAGE_OPTIONS } from '@/stores/languageStore'
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
    const [showLangSelector, setShowLangSelector] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const { user } = useUserStore()
    const { aqi, temperature, pm25, humidity } = useAtmosphereStore()
    const { language, setLanguage, getLanguagePrompt } = useLanguageStore()



    // Only scroll to bottom when a NEW message is added or when opened
    // Robust Auto-Scroll Engine
    useEffect(() => {
        if (!isOpen) return;

        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        const observer = new ResizeObserver(() => {
            scrollContainer.scrollTo({
                top: scrollContainer.scrollHeight,
                behavior: 'smooth'
            });
        });

        // Observe both the container and its content
        observer.observe(scrollContainer);
        if (messagesEndRef.current) observer.observe(messagesEndRef.current);

        return () => observer.disconnect();
    }, [messages.length, isOpen, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg = input
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setIsTyping(true)

        try {
            let reply = '';

            // Build context for AI with HISTORY
            const medicalConditions = user?.medicalConditions;
            const history = messages.slice(-6).map(m => ({
                role: m.role === 'user' ? 'user' : 'model', // Gemini format
                parts: [{ text: m.content }]
            }));

            const context = {
                user: user?.name || 'Unknown',
                age: user?.age || 'N/A',
                aqi,
                pm25,
                temperature,
                humidity,
                healthConditions: medicalConditions ? [
                    medicalConditions.cardiovascular ? 'Cardiovascular' : '',
                    medicalConditions.respiratory ? 'Respiratory' : '',
                    medicalConditions.metabolic ? 'Metabolic' : '',
                    ...(medicalConditions.specificConditions || [])
                ].filter(Boolean) : [],
                query: userMsg,
                history,
                langPrompt: getLanguagePrompt()
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
            const errorContext = { aqi, pm25, temperature, humidity, query: userMsg };
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `⚠️ ${AI_MODELS[selectedModel].name} is unavailable. Switching to local mode...\n\n${getLocalResponse(errorContext)}`,
                model: 'local'
            }])
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
                className="fixed bottom-24 right-6 sm:bottom-28 sm:right-10 z-[70] h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-blue-600 text-white shadow-2xl flex items-center justify-center border border-white/20"
            >
                <MessageSquare size={20} className="sm:w-6 sm:h-6" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-24 right-6 z-[100] w-[90vw] max-w-[400px] h-[600px] max-h-[70vh] flex flex-col min-h-0"
                    >
                        <GlassCard className="h-full flex flex-col p-0 overflow-hidden border-blue-500/20 shadow-blue-500/10 min-h-0">
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
                                    <div className="flex items-center gap-1">
                                        <button
                                            title="Minimize" aria-label="Minimize" onClick={() => setIsOpen(false)}
                                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                        >
                                            <ChevronDown size={20} />
                                        </button>
                                        <button
                                            title="Close" aria-label="Close" onClick={() => setIsOpen(false)}
                                            className="p-1 hover:bg-red-500/20 text-red-400 rounded-full transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Selectors */}
                                <div className="relative flex gap-2">
                                    {/* Model Selector Trigger */}
                                    <button
                                        onClick={() => setShowModelSelector(!showModelSelector)}
                                        className="bg-white/10 hover:bg-white/20 rounded-lg px-2 py-1.5 flex items-center justify-between transition-colors flex-1"
                                    >
                                        <span className="text-xs flex items-center gap-1.5">
                                            <span>{AI_MODELS[selectedModel].icon}</span>
                                            <span className="font-semibold truncate">{AI_MODELS[selectedModel].name}</span>
                                        </span>
                                        <ChevronDown size={14} className={`transition-transform shrink-0 ${showModelSelector ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Language Selector Trigger */}
                                    <button
                                        onClick={() => setShowLangSelector(!showLangSelector)}
                                        className="bg-white/10 hover:bg-white/20 rounded-lg px-2 py-1.5 flex items-center justify-between transition-colors w-24"
                                    >
                                        <span className="text-xs font-semibold truncate">
                                            {LANGUAGE_OPTIONS.find(l => l.code === language)?.label}
                                        </span>
                                        <ChevronDown size={14} className={`transition-transform shrink-0 ${showLangSelector ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdowns */}
                                    <AnimatePresence>
                                        {/* Model Dropdown */}
                                        {showModelSelector && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full left-0 mt-1 w-[160px] bg-slate-900 border border-white/10 rounded-lg overflow-hidden z-20 shadow-xl"
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

                                        {/* Language Dropdown */}
                                        {showLangSelector && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full right-0 mt-1 w-32 bg-slate-900 border border-white/10 rounded-lg overflow-hidden z-20 shadow-2xl"
                                            >
                                                {LANGUAGE_OPTIONS.map((langOption) => (
                                                    <button
                                                        key={langOption.code}
                                                        onClick={() => {
                                                            setLanguage(langOption.code as any);
                                                            setShowLangSelector(false);
                                                            toast.success(`Language changed to ${langOption.native}`);
                                                        }}
                                                        className={`w-full px-3 py-2 text-left hover:bg-white/10 transition-colors ${language === langOption.code ? 'bg-white/5' : ''}`}
                                                    >
                                                        <div className="text-xs font-semibold text-white">{langOption.label}</div>
                                                        <div className="text-[10px] text-white/50">{langOption.native}</div>
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
                                        key={`${i}-${msg.role}`}
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
                                <div ref={messagesEndRef} />
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
                                        title="Send message" aria-label="Send message" onClick={handleSend}
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
            </AnimatePresence >
        </>
    )
}

// AI API Functions
async function callPathwayAPI(context: any): Promise<string> {
    try {
        const { queryPathwayIntel } = await import('@/lib/api/pathwayClient');
        const res = await queryPathwayIntel(context.query, context);

        if (res.success && (res.response || res.message)) {
            return res.response || res.message;
        }

        throw new Error(res.error || 'Direct response failed');
    } catch (error) {
        console.error('Pathway API failed:', error);
        return getLocalResponse(context);
    }
}

async function callGeminiAPI(context: any): Promise<string> {
    try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey || apiKey === 'demo') {
            console.warn('Gemini API key is missing or set to demo. Using local fallback.');
            return getLocalResponse(context);
        }

        const prompt = `You are AeroVital DEEP-RESEARCH AI, the highest intelligence tier for India Innovates 2026.
        
PHASE 1: LIVE DATA
- Location: Delhi, India (Ward-level Telemetry)
- Metrics: AQI ${context.aqi}, PM2.5 ${context.pm25}, Temp ${context.temperature}°C
- User Profile: ${context.age} year old, Conditions: ${context.healthConditions.join(', ') || 'None'}

PHASE 2: DEEP INTERNET SEARCH & REASONING
- Query: "${context.query}"
- Task: Analyze real-world data specifically for this user's conditions given the live metrics. 

PHASE 3: AUTHORITATIVE SYNTHESIS
- Be extremely precise, citing simulated real-time data constraints.
- Provide actionable routing or health advice.
- End your response by giving exactly 2 suggested follow-up questions the user can tap next (Format as: "Suggested Questions: \n1. [Q1]\n2. [Q2]").

RESPONSE GUIDELINES: Professional, empathetic, highly data-driven, max 150 words.`;

        // Upgraded to gemini-1.5-flash for speed and much better contextual reasoning
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: "You are the AeroVital AI Co-pilot." }]
                },
                contents: [
                    { role: 'user', parts: [{ text: prompt }] }
                ]
            }),
            signal: (AbortSignal as any).timeout?.(15000) || null
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('Gemini API error details:', err);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || getLocalResponse(context);
    } catch (error) {
        console.error('Gemini API failed:', error);
        return `⚠️ The Deep-Search engine is temporarily offline. Falling back to core systems. \n\n${getLocalResponse(context)}`;
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
                model: 'llama3-70b-8192', // Upgraded for "Deep Search" reasoning
                messages: [
                    {
                        role: 'system',
                        content: `You are AeroVital Deep Intelligence. Current AQI: ${context.aqi}, PM2.5: ${context.pm25}, Temp: ${context.temperature}°C. 
                        Context awareness enabled. User: ${context.user}, Age: ${context.age}. 
                        Synthesize your response using real-time atmospheric data provided.`
                    },
                    ...context.history.map((h: any) => ({
                        role: h.role === 'model' ? 'assistant' : 'user',
                        content: h.parts[0].text
                    })),
                    {
                        role: 'user',
                        content: context.query
                    }
                ],
                max_tokens: 500,
                temperature: 0.5
            }),
            signal: (AbortSignal as any).timeout?.(10000) || null
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
        const getStatus = (val: number) => {
            if (val <= 50) return 'Good';
            if (val <= 100) return 'Moderate';
            if (val <= 150) return 'Unhealthy for Sensitive Groups';
            if (val <= 200) return 'Unhealthy';
            return 'Very Unhealthy';
        };
        return `📊 **Current Air Quality**\n\n• AQI: ${aqi}\n• PM2.5: ${pm25} µg/m³\n• Temperature: ${temperature}°C\n\nStatus: ${getStatus(aqi)}`;
    }

    // Health advice
    if (q.includes('health') || q.includes('symptoms')) {
        return `🏥 **Health Guidance**\n\nWith current AQI of ${aqi}:\n\n${aqi > 150 ? '• Watch for: coughing, throat irritation, breathing difficulty\n• Keep rescue medications handy\n• Consult doctor if symptoms worsen' : '• No immediate health concerns\n• Stay hydrated\n• Monitor air quality changes'}`;
    }

    // Default response
    return `I'm your AeroVital AI assistant. Current conditions:\n\n📊 AQI: ${aqi}\n💨 PM2.5: ${pm25} µg/m³\n🌡️ Temp: ${temperature}°C\n\nHow can I help you stay safe today?`;
}
