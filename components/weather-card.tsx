"use client"

import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/glass-card"
import { Cloud, Sun, CloudRain, Wind, Droplets, Zap, CloudSnow, Eye, Thermometer } from "lucide-react"
import type { WeatherData } from "@/lib/weather-api"
import { isWeatherApiConfigured } from "@/lib/weather-api"

interface WeatherCardProps {
  weather: WeatherData
}

export function WeatherCard({ weather }: WeatherCardProps) {
  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase()

    if (lowerCondition.includes("sunny") || lowerCondition.includes("clear") || lowerCondition.includes("soleado")) {
      return <Sun className="h-12 w-12 text-yellow-300 animate-pulse drop-shadow-lg" />
    }
    if (lowerCondition.includes("rain") || lowerCondition.includes("drizzle") || lowerCondition.includes("lluvia")) {
      return <CloudRain className="h-12 w-12 text-blue-300 animate-bounce drop-shadow-lg" />
    }
    if (lowerCondition.includes("snow") || lowerCondition.includes("nieve")) {
      return <CloudSnow className="h-12 w-12 text-blue-200 animate-pulse drop-shadow-lg" />
    }
    if (lowerCondition.includes("cloud") || lowerCondition.includes("nublado")) {
      return <Cloud className="h-12 w-12 text-gray-300 animate-pulse drop-shadow-lg" />
    }
    if (lowerCondition.includes("storm") || lowerCondition.includes("thunder") || lowerCondition.includes("tormenta")) {
      return <Zap className="h-12 w-12 text-purple-300 animate-pulse drop-shadow-lg" />
    }

    return <Sun className="h-12 w-12 text-yellow-300 drop-shadow-lg" />
  }

  const getTemperatureColor = (temp: number) => {
    if (temp >= 30) return "from-red-400 to-orange-400"
    if (temp >= 20) return "from-orange-400 to-yellow-400"
    if (temp >= 10) return "from-yellow-400 to-green-400"
    if (temp >= 0) return "from-blue-400 to-cyan-400"
    return "from-blue-600 to-blue-400"
  }

  const isRealData = isWeatherApiConfigured()

  return (
    <GlassCard className="w-full animate-in slide-in-from-bottom-4 duration-500 p-6 relative z-10" variant="neon">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="animate-in zoom-in-50 duration-300">{getWeatherIcon(weather.condition)}</div>
          <div className="animate-in slide-in-from-left-2 duration-300 delay-100">
            <h3 className="text-2xl font-bold text-white text-glow">{weather.city}</h3>
            <p className="text-white/80">Clima actual</p>
          </div>
        </div>
        <div className="animate-in slide-in-from-right-2 duration-300 delay-200">
          <Badge
            className={`${
              isRealData
                ? "bg-gradient-to-r from-green-400 to-emerald-400 text-black"
                : "bg-gradient-to-r from-yellow-400 to-orange-400 text-black"
            } font-bold px-3 py-1`}
          >
            {isRealData ? "🌍 Datos Reales" : "🎭 Simulado"}
          </Badge>
        </div>
      </div>

      {/* Temperatura principal */}
      <div className="text-center py-6 animate-in fade-in duration-500 delay-300">
        <div
          className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r ${getTemperatureColor(weather.temperature)} text-black font-bold text-4xl shadow-2xl`}
        >
          <Thermometer className="h-8 w-8" />
          {weather.temperature}°C
        </div>
        <div className="text-xl text-white/90 mt-3 font-medium">{weather.condition}</div>
      </div>

      {/* Grid de datos */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <GlassCard className="p-4 text-center animate-in slide-in-from-left-3 duration-300 delay-400">
          <Droplets className="h-6 w-6 text-blue-300 mx-auto mb-2" />
          <div className="text-white/80 text-sm">Humedad</div>
          <div className="text-white font-bold text-lg">{weather.humidity}%</div>
        </GlassCard>

        <GlassCard className="p-4 text-center animate-in slide-in-from-right-3 duration-300 delay-500">
          <Wind className="h-6 w-6 text-gray-300 mx-auto mb-2" />
          <div className="text-white/80 text-sm">Viento</div>
          <div className="text-white font-bold text-lg">{weather.windSpeed} km/h</div>
        </GlassCard>
      </div>

      {/* Descripción */}
      <GlassCard className="p-4 animate-in fade-in duration-500 delay-600 aurora">
        <div className="flex items-start gap-3">
          <Eye className="h-5 w-5 text-white/80 mt-0.5 flex-shrink-0" />
          <p className="text-white/90 leading-relaxed">{weather.description}</p>
        </div>
      </GlassCard>

      {!isRealData && (
        <GlassCard className="p-4 mt-4 animate-in slide-in-from-bottom-2 duration-300 delay-700 bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <p className="text-white font-medium">Modo de demostración</p>
              <p className="text-white/80 text-sm mt-1">
                Configura WEATHER_API_KEY para obtener datos meteorológicos reales
              </p>
            </div>
          </div>
        </GlassCard>
      )}
    </GlassCard>
  )
}
