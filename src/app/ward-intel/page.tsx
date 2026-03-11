/**
 * AEROVITAL v4.0 — Ward Intelligence Page
 * FullStack Shinobi · Soumoditya Das & Team
 * Route: /ward-intel
 *
 * Full-page wrapper for the Ward Intelligence Panel.
 * Provides a back-navigation header and renders the main 5-tab civic dashboard.
 */
'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import WardIntelligencePanel from '@/components/intelligence/WardIntelligencePanel'

export default function WardIntelPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Top navigation bar */}
            <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-6 py-3 flex items-center gap-4">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>

                <div className="ml-auto flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-white/40 font-mono uppercase tracking-wider">
                        Live · Delhi MCD · India Innovates 2026
                    </span>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
                <WardIntelligencePanel />
            </main>

            {/* Footer credit */}
            <footer className="py-4 border-t border-white/5 text-center">
                <p className="text-[11px] text-white/20 font-mono uppercase tracking-widest">
                    AeroVital Navigator v4.0 · FullStack Shinobi · Soumoditya Das &amp; Team · India Innovates 2026
                </p>
            </footer>
        </div>
    )
}
