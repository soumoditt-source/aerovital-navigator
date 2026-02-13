import Link from 'next/link'
import { ArrowRight, Wind, Shield, Navigation, Activity } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen gradient-hero text-white overflow-hidden">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tighter">AeroVital</h1>
        <div className="flex gap-4">
          <Link href="/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>
          <Link href="/about" className="hover:text-blue-200 transition">About</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 animate-fade-in-up">
          <div className="inline-block px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 text-sm font-medium">
            🚀 Hack For Green Bharat 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Your Breath, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-blue-200">
              Our Battlefield
            </span>
          </h1>
          <p className="text-xl text-blue-100 max-w-lg">
            Preventing 1.7M pollution deaths annually with AI-powered personalized health protection and real-time navigation.
          </p>
          <div className="flex gap-4">
            <Link href="/onboarding" className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2">
              Start Protecting Your Breath
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Feature Grid with Glassmorphism */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition duration-300">
            <Wind className="w-10 h-10 mb-4 text-green-300" />
            <h3 className="font-bold text-lg">Real-Time Intel</h3>
            <p className="text-sm text-blue-100 mt-2">Streaming AQI data every 60s via Pathway.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition duration-300 mt-8">
            <Shield className="w-10 h-10 mb-4 text-purple-300" />
            <h3 className="font-bold text-lg">Health Shield</h3>
            <p className="text-sm text-blue-100 mt-2">Personalized risk assessment for your condition.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition duration-300 -mt-8">
            <Navigation className="w-10 h-10 mb-4 text-blue-300" />
            <h3 className="font-bold text-lg">Clean Routing</h3>
            <p className="text-sm text-blue-100 mt-2">Navigation optimized for lowest pollution exposure.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition duration-300">
            <Activity className="w-10 h-10 mb-4 text-orange-300" />
            <h3 className="font-bold text-lg">Vital Tracking</h3>
            <p className="text-sm text-blue-100 mt-2">Monitor lung health and exercise safety.</p>
          </div>
        </div>
      </div>

      {/* Live Ticker */}
      <div className="bg-black/20 backdrop-blur-sm py-4 overflow-hidden border-t border-white/10">
        <div className="flex gap-12 whitespace-nowrap animate-marquee px-6">
          <span className="text-sm font-mono flex items-center gap-2">🔴 MUMBAI AQI: 387</span>
          <span className="text-sm font-mono flex items-center gap-2">🔴 DELHI AQI: 412</span>
          <span className="text-sm font-mono flex items-center gap-2">🟠 KOLKATA AQI: 156</span>
          <span className="text-sm font-mono flex items-center gap-2">🟢 BANGALORE AQI: 78</span>
          <span className="text-sm font-mono flex items-center gap-2">🔴 MUMBAI AQI: 387</span>
          <span className="text-sm font-mono flex items-center gap-2">🔴 DELHI AQI: 412</span>
          <span className="text-sm font-mono flex items-center gap-2">🟠 KOLKATA AQI: 156</span>
          <span className="text-sm font-mono flex items-center gap-2">🟢 BANGALORE AQI: 78</span>
        </div>
      </div>
    </main>
  )
}
