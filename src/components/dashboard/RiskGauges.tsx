'use client'

interface RiskGaugesProps {
  cardiacRisk?: number
  asthmaRisk?: number
  exerciseSafety?: number
}

function Gauge({ value, max, label, color }: { value: number, max: number, label: string, color: string }) {
  const percentage = (value / max) * 100
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={color}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
          {value.toFixed(1)}
        </div>
      </div>
      <span className="mt-2 text-sm font-semibold text-gray-600">{label}</span>
      <span className="text-xs text-gray-400">/ {max}</span>
    </div>
  )
}

export default function RiskGauges({ cardiacRisk = 0, asthmaRisk = 0, exerciseSafety = 0 }: RiskGaugesProps) {
  const getRiskColor = (val: number, isSafety = false) => {
    if (isSafety) {
      if (val > 70) return 'text-green-500'
      if (val > 40) return 'text-yellow-500'
      return 'text-red-500'
    }
    if (val < 3) return 'text-green-500'
    if (val < 7) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <Gauge
        value={cardiacRisk}
        max={10}
        label="Cardiac"
        color={getRiskColor(cardiacRisk)}
      />
      <Gauge
        value={asthmaRisk}
        max={10}
        label="Asthma"
        color={getRiskColor(asthmaRisk)}
      />
      <Gauge
        value={exerciseSafety}
        max={100}
        label="Safety"
        color={getRiskColor(exerciseSafety, true)}
      />
    </div>
  )
}
