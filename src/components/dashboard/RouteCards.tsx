'use client'

interface RouteCardsProps {
  onRouteSelect: (id: string) => void
  routes: any[] // Using any for now, better to use proper type
}

export default function RouteCards({ onRouteSelect, routes = [] }: RouteCardsProps) {
  if (routes.length === 0) return null

  return (
    <div className="space-y-4">
      {routes.map((route) => (
        <div
          key={route.id}
          onClick={() => onRouteSelect(route.id)}
          className={`cursor-pointer p-4 rounded-xl border-2 transition-all hover:scale-105 ${route.type === 'safest' ? 'border-green-500 bg-green-50' :
              route.type === 'fastest' ? 'border-blue-500 bg-blue-50' :
                'border-purple-500 bg-purple-50'
            }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-lg uppercase">{route.type}</span>
            <span className="text-2xl">{
              route.type === 'safest' ? '🥇' :
                route.type === 'fastest' ? '🥈' : '🥉'
            }</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500">Exposure</p>
              <p className="font-bold">{route.exposure} AQI·min</p>
            </div>
            <div>
              <p className="text-gray-500">Duration</p>
              <p className="font-bold">{route.duration} min</p>
            </div>
            <div>
              <p className="text-gray-500">Avg AQI</p>
              <p className="font-bold">{route.avgAqi}</p>
            </div>
            <div>
              <p className="text-gray-500">Distance</p>
              <p className="font-bold">{route.distance} km</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
