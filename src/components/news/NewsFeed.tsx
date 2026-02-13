'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Newspaper, ExternalLink, Flame, ShieldAlert } from 'lucide-react'

const MOCK_NEWS = [
    {
        id: 1,
        source: 'WHO Global',
        title: 'New Respiratory Guidelines Released for Urban Areas',
        snippet: 'The World Health Organization has updated its daily exposure limits for PM2.5 in high-density zones.',
        time: '2h ago',
        tag: 'Policy',
        urgent: true
    },
    {
        id: 2,
        source: 'EcoWatch',
        title: 'Heatwave Alert: Temperatures to Peak This Weekend',
        snippet: 'Meteorologists predict record-breaking highs across the central region. Hydration is key.',
        time: '4h ago',
        tag: 'Climate',
        urgent: true
    },
    {
        id: 3,
        source: 'Fitness Daily',
        title: '5 Indoor Cardio Routines for High AQI Days',
        snippet: 'Don\'t let pollution stop your gains. Here are the best HEPA-filtered workouts.',
        time: '6h ago',
        tag: 'Wellness',
        urgent: false
    },
    {
        id: 4,
        source: 'TechGreen',
        title: 'New Algae Bioreactors Placed in City Center',
        snippet: 'Experimental urban trees claim to sequester 50x more carbon than natural oaks.',
        time: '12h ago',
        tag: 'Tech',
        urgent: false
    },
    {
        id: 5,
        source: 'Local Gov',
        title: 'Traffic Restrictions in Zone A due to Smog',
        snippet: 'Odd-even vehicle rotation rules apply starting tomorrow morning.',
        time: '1d ago',
        tag: 'Alert',
        urgent: true
    }
]

export default function NewsFeed() {
    const [news, setNews] = useState(MOCK_NEWS)

    return (
        <div className="flex flex-col gap-4">
            {news.map((item, idx) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${item.urgent ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                }`}>
                                {item.tag}
                            </span>
                            <span className="text-[10px] text-white/40">{item.source} • {item.time}</span>
                        </div>
                        {item.urgent && <ShieldAlert size={14} className="text-red-400 animate-pulse" />}
                    </div>

                    <h3 className="font-bold text-sm mb-1 group-hover:text-blue-400 transition-colors line-clamp-2">
                        {item.title}
                    </h3>
                    <p className="text-xs text-white/60 line-clamp-2">
                        {item.snippet}
                    </p>
                </motion.div>
            ))}
        </div>
    )
}
