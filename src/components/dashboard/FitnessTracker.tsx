'use client'

import { Dumbbell, Bike, Footprints } from 'lucide-react'
import GlassCard from '../ui/GlassCard'

export default function FitnessTracker() {
  return (
    <GlassCard className="h-full border-white/10 bg-black/40">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Dumbbell size={18} className="text-purple-400" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/70">
            Activity Recommender
          </h3>
        </div>
      </div>

      <div className="space-y-4">
        {[{
          id: 'run',
          icon: Footprints,
          label: 'Outdoor Run',
          status: 'Restricted',
          color: 'red',
          desc: 'High PM2.5 levels detected.'
        }, {
          id: 'bike',
          icon: Bike,
          label: 'Cycling',
          status: 'Moderate',
          color: 'yellow',
          desc: 'Use mask if duration > 30m.'
        }, {
          id: 'gym',
          icon: Dumbbell,
          label: 'Indoor Gym',
          status: 'Recommended',
          color: 'green',
          desc: 'Optimal air quality indoors.'
        }].map((activity) => {
          const statusStyles: Record<string, string> = {
            green: 'bg-green-500/20 text-green-400 border border-green-500/30',
            red: 'bg-red-500/20 text-red-400 border border-red-500/30',
            yellow: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          };
          return (
            <div key={activity.id} className="group flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-white/20">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-${activity.color}-500/20 text-${activity.color}-400 group-hover:scale-110 transition-transform`}>
                  <activity.icon size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{activity.label}</h4>
                  <p className="text-[10px] text-white/50">{activity.desc}</p>
                </div>
              </div>

              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyles[activity.color] || statusStyles.yellow}`}>
                {activity.status}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  )
}
