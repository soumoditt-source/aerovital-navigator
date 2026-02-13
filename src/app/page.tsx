/**
 * AEROVITAL NAVIGATOR - Ultimate Landing Experience
 * @author Soumoditya Das <soumoditt@gmail.com>
 */
'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Shield, Wind, Zap } from 'lucide-react'

export default function Landing() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <div ref={containerRef} className="bg-black min-h-[200vh] text-white overflow-hidden relative selection:bg-blue-500/30">

      {/* SECTION 1: HERO */}
      <section className="h-screen relative flex flex-col items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-black to-black opacity-80" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-screen" />
          {/* Grid Floor */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[linear-gradient(to_bottom,transparent_0%,black_100%),repeating-linear-gradient(90deg,rgba(59,130,246,0.1)_0px,rgba(59,130,246,0.1)_1px,transparent_1px,transparent_40px),repeating-linear-gradient(0deg,rgba(59,130,246,0.1)_0px,rgba(59,130,246,0.1)_1px,transparent_1px,transparent_40px)] perspective-[1000px] rotate-x-60" />
        </motion.div>

        <div className="relative z-10 text-center px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="mb-6 relative"
          >
            <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]">
              AEROVITAL
            </h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.5, duration: 1 }}
              className="h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mt-2"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-xl md:text-2xl text-blue-200/70 font-mono tracking-widest uppercase mb-12"
          >
            Atmospheric Intelligence System v2.0
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Link href="/onboarding" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-blue-600 font-lg rounded-full overflow-hidden hover:scale-105 hover:shadow-[0_0_40px_rgba(37,99,235,0.6)]">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              <span className="relative z-10 flex items-center gap-2 uppercase tracking-wider">
                Initialize System <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: FEATURES */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: 'Bio-Shield', desc: 'Real-time health risk assessment based on personalized biological markers.', color: 'blue' },
            { icon: Zap, title: 'Neural Routing', desc: 'AI-driven pathfinding to minimize pollution exposure by up to 45%.', color: 'purple' },
            { icon: Wind, title: 'Atmosphere Scan', desc: 'Live molecular analysis of PM2.5, NO2, and Ozone layers.', color: 'cyan' }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ y: -10 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group cursor-default"
            >
              <div className={`w-16 h-16 rounded-2xl bg-${feature.color}-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_rgba(var(--tw-gradient-stops),0.3)]`}>
                <feature.icon size={32} className={`text-${feature.color}-400`} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-white/50 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 text-center text-white/30 border-t border-white/5">
        <p className="font-mono text-xs uppercase tracking-widest">
          Architected by Soumoditya Das &copy; 2026
        </p>
      </footer>

    </div>
  )
}
