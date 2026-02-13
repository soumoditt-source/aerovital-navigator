import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

import AppDock from '@/components/ui/AppDock'

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
      <body className={`${outfit.className} bg-background text-foreground min-h-screen overflow-hidden`}>
        {/* Ambient background glow */}
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-black pointer-events-none" />

        {children}
        <AppDock />
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
