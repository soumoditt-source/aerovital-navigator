'use client'

import NewsFeed from '@/components/news/NewsFeed'
import { Radio, Rss } from 'lucide-react'

export default function NewsPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans p-4 pb-24 lg:p-8 overflow-y-auto">
            <header className="mb-8 flex items-end justify-between border-b border-white/10 pb-4">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                        <Radio className="text-red-500 animate-pulse" /> Global Intel
                    </h1>
                    <p className="text-sm text-white/50 font-mono tracking-widest mt-2">LIVE ENVIRONMENTAL & HEALTH UPDATES</p>
                </div>
                <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-2 text-xs font-mono text-green-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        STREAM ACTIVE
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto">
                <NewsFeed />
            </main>
        </div>
    )
}
