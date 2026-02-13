import type { Metadata, Viewport } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import { Toaster } from 'react-hot-toast'

import dynamic from 'next/dynamic'

const AppDock = dynamic(() => import('@/components/ui/AppDock'), { ssr: false })
const ChatAssistant = dynamic(() => import('@/components/chat/ChatAssistant'), { ssr: false })
const VoiceAgent = dynamic(() => import('@/components/voice/VoiceAgent'), { ssr: false })
const TutorialManager = dynamic(() => import('@/components/ui/TutorialManager'), { ssr: false })
const PWAInstallPrompt = dynamic(() => import('@/components/ui/PWAInstallPrompt'), { ssr: false })
const EmergencySOS = dynamic(() => import('@/components/ui/EmergencySOS'), { ssr: false })
const PageTransition = dynamic(() => import('@/components/ui/PageTransition'), { ssr: false })

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AeroVital Navigator - Atmospheric Health Protection',
  description: 'Real-time air quality monitoring with personalized health risk assessment',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AeroVital'
  }
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${outfit.className} bg-background text-foreground min-h-screen overflow-x-hidden selection:bg-blue-500/30`}>
        {/* Ambient background glow */}
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-black pointer-events-none" />

        {/* Dynamic Scanlines Overlay for High-Tech feel */}
        <div className="fixed inset-0 z-[999] pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

        <main className="relative z-10 w-full min-h-screen">
          <PageTransition>
            {children}
          </PageTransition>
        </main>

        <AppDock />
        <ChatAssistant />
        <VoiceAgent />
        <EmergencySOS />
        <TutorialManager />
        <PWAInstallPrompt />

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
