'use client'
import { Dumbbell, Trees, Flame, Footprints } from 'lucide-react'

export default function FitnessTracker() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Fitness Tracker</h3>
        <span className="text-sm text-gray-500">Day 15 of 30</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '50%' }}></div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Dumbbell size={20} />
          </div>
          <div>
            <p className="font-bold">Indoor HIIT</p>
            <p className="text-xs text-gray-500">Recommended (AQI High)</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-2">20 minutes • 4 exercises</p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div>
          <Footprints className="mx-auto text-gray-400 mb-1" size={16} />
          <p className="font-bold">7,847</p>
          <p className="text-xs text-gray-500">Steps</p>
        </div>
        <div>
          <Flame className="mx-auto text-orange-400 mb-1" size={16} />
          <p className="font-bold">347</p>
          <p className="text-xs text-gray-500">Cal</p>
        </div>
        <div>
          <Trees className="mx-auto text-green-400 mb-1" size={16} />
          <p className="font-bold">2</p>
          <p className="text-xs text-gray-500">Trees</p>
        </div>
      </div>

      <button className="w-full mt-6 bg-blue-600 text-white rounded-xl py-2 font-semibold hover:bg-blue-700 transition">
        Start Workout
      </button>
    </div>
  )
}
