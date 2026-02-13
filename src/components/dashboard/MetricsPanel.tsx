'use client'
import { Wind, Thermometer, Droplets, Activity, Sun, CloudRain } from 'lucide-react'

interface MetricsProps {
  aqi?: number
  pm25?: number
  temperature?: number
  humidity?: number
  windSpeed?: number
  uvIndex?: number
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  color
}: {
  icon: any,
  label: string,
  value: string | number,
  unit: string,
  color: string
}) {
  return (
    <div className={`p-4 rounded-xl ${color} bg-opacity-10 flex items-center space-x-4`}>
      <div className={`p-3 rounded-lg ${color} text-white`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900">
          {value} <span className="text-sm text-gray-500 font-normal">{unit}</span>
        </p>
      </div>
    </div>
  )
}

export default function MetricsPanel({
  aqi = 0,
  pm25 = 0,
  temperature = 0,
  humidity = 0,
  windSpeed = 0,
  uvIndex = 0
}: MetricsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <MetricCard
        icon={Activity}
        label="AQI"
        value={aqi}
        unit=""
        color={aqi > 100 ? 'bg-red-500' : 'bg-green-500'}
      />
      <MetricCard
        icon={CloudRain}
        label="PM2.5"
        value={pm25}
        unit="µg/m³"
        color="bg-purple-500"
      />
      <MetricCard
        icon={Thermometer}
        label="Temp"
        value={temperature}
        unit="°C"
        color="bg-orange-500"
      />
      <MetricCard
        icon={Droplets}
        label="Humidity"
        value={humidity}
        unit="%"
        color="bg-blue-500"
      />
      <MetricCard
        icon={Wind}
        label="Wind"
        value={windSpeed}
        unit="km/h"
        color="bg-gray-500"
      />
      <MetricCard
        icon={Sun}
        label="UV Index"
        value={uvIndex}
        unit=""
        color="bg-yellow-500"
      />
    </div>
  )
}
