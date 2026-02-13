import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AeroVital Navigator',
  description: 'AI-Powered Atmospheric Health Protection',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
