import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

import AppDock from '@/components/ui/AppDock'
import ChatAssistant from '@/components/chat/ChatAssistant'
import TutorialManager from '@/components/ui/TutorialManager'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AeroVital Navigator v2.0',
  description: 'Next-Gen Atmospheric Health Protection',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.className} bg-background text-foreground min-h-screen overflow-hidden selection:bg-blue-500/30`}>
        {/* Ambient background glow */}
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-black pointer-events-none" />

        {/* Dynamic Scanlines Overlay for High-Tech feel */}
        <div className="fixed inset-0 z-[999] pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

        <main className="relative z-10 w-full h-full">
          {children}
        </main>

        <AppDock />
        <ChatAssistant />
        <TutorialManager />

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            },
          }}
        />
      </body>
    </html>
  )
}
