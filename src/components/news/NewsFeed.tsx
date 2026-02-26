'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, ShieldAlert } from 'lucide-react'
import { useUserStore } from '@/stores/userStore'
import { useAtmosphereStore } from '@/stores/atmosphereStore'
import { useLanguageStore } from '@/stores/languageStore'

// GDELT API returns data in this shape
interface GDELTArticle {
    url: string;
    urlmobile?: string;
    title: string;
    seendate: string; // Format: YYYYMMDDTHHMMSSZ
    socialimage: string;
    domain: string;
    language: string;
    sourcecountry: string;
}

export default function NewsFeed() {
    const [news, setNews] = useState<GDELTArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isThinking, setIsThinking] = useState(false)
    const { user } = useUserStore()
    const { aqi, temperature } = useAtmosphereStore()
    const { getLanguagePrompt } = useLanguageStore()

    const fetchNews = async () => {
        try {
            setLoading(true);
            setError(false);
            // Query for environment or pollution related news
            const res = await fetch('https://api.gdeltproject.org/api/v2/doc/doc?query=(environment OR pollution OR climate OR emissions)&mode=artlist&maxrecords=10&format=json');
            const data = await res.json();

            if (data?.articles) {
                const rawArticles = data.articles.filter((a: any) => a.title && a.url);

                // Translation & Summarization Middleware
                const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'demo';
                const prompt = `Analyze these global environmental news headlines:\n${JSON.stringify(rawArticles)}\n\nUser Context: ${user ? `${user.name}, Age ${user.age}` : 'Unknown'}. Current Local AQI: ${aqi}. Local Temp: ${temperature}°C.\n\nSelect the 4 most relevant articles and summarize them into brief, engaging snippets (max 2 sentences each). Provide actionable advice if relevant to their local conditions.\n\n${getLanguagePrompt()}\n\nReturn EXACTLY a JSON array of objects with keys: url (string), title (string), seendate (string - keep original format YYYYMMDDTHHMMSSZ), socialimage (string), domain (string). Do not add markdown formatting.`;

                try {
                    setLoading(true);
                    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }]
                        }),
                        signal: (AbortSignal as any).timeout?.(15000) || null
                    });

                    if (geminiRes.ok) {
                        const geminiData = await geminiRes.json();
                        let aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
                        // Strip markdown JSON blocks if the model didn't listen
                        aiResponse = aiResponse.replace(/```json\n/g, '').replace(/```\n/g, '').replace(/```/g, '');
                        const parsedNews = JSON.parse(aiResponse);
                        setNews(parsedNews);
                    } else {
                        // Fallback to raw if logic fails
                        setNews(rawArticles.slice(0, 4));
                    }
                } catch (e) {
                    // Fallback to raw if timeout
                    setNews(rawArticles.slice(0, 4));
                }
            }
        } catch (err) {
            console.error('Failed to fetch live news:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchNews();
        // Refresh every 5 minutes
        const interval = setInterval(fetchNews, 5 * 60 * 1000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatTime = (seendate: string) => {
        try {
            // parsing YYYYMMDDTHHMMSSZ
            const year = Number.parseInt(seendate.substring(0, 4));
            const month = Number.parseInt(seendate.substring(4, 6)) - 1;
            const day = Number.parseInt(seendate.substring(6, 8));
            const hour = Number.parseInt(seendate.substring(9, 11));
            const minute = Number.parseInt(seendate.substring(11, 13));

            const date = new Date(Date.UTC(year, month, day, hour, minute));
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

            if (diffHours < 1) return 'Just now';
            return `${diffHours}h ago`;
        } catch {
            return 'Recent';
        }
    };

    if (loading && news.length === 0) {
        return (
            <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl animate-pulse">
                        <div className="h-4 bg-white/10 w-2/3 rounded mb-3"></div>
                        <div className="h-16 bg-white/5 rounded w-full"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (error && news.length === 0) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl text-center">
                <ShieldAlert className="mx-auto text-red-400 mb-2" size={24} />
                <p className="text-red-300 text-sm font-bold">Live Feed Disconnected</p>
                <button onClick={fetchNews} className="mt-3 text-xs bg-red-500/20 px-4 py-1.5 rounded-full hover:bg-red-500/30 transition-colors">
                    Retry Connection
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <AnimatePresence>
                {news.map((item, idx) => {
                    const isUrgent = item.title.toLowerCase().includes('alert') || item.title.toLowerCase().includes('warning');

                    return (
                        <motion.a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={item.url}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer group flex flex-col gap-3 relative overflow-hidden"
                        >
                            {/* Visual highlight on hover */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${isUrgent ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                                        {isUrgent ? 'Alert' : 'Intel'}
                                    </span>
                                    <span className="text-[10px] text-white/40 uppercase tracking-wider">{item.domain} • {formatTime(item.seendate)}</span>
                                </div>
                                <ExternalLink size={14} className="text-white/30 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm mb-2 group-hover:text-blue-400 transition-colors leading-snug line-clamp-3">
                                        {item.title}
                                    </h3>
                                </div>
                                {item.socialimage && (
                                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-black/40 border border-white/10 relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={item.socialimage}
                                            alt={item.title}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                                e.currentTarget.parentElement!.innerHTML = '<svg class="w-6 h-6 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.a>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}
