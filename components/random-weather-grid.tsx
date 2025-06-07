"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Thermometer, Droplets, Wind, RefreshCw, Globe, Sparkles, MapPin, Eye } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { GlassButton } from "@/components/glass-button"
import { getWeatherData, type WeatherData } from "@/lib/weather-api"
import { popularCities } from "@/lib/cities"

interface RandomWeatherGridProps {
  onCitySelect: (city: string, weatherData?: WeatherData) => void
}

export function RandomWeatherGrid({ onCitySelect }: RandomWeatherGridProps) {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const getRandomCities = (count = 6) => {
    const shuffled = [...popularCities].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count).map((city) => city.split(",")[0]) // Solo el nombre de la ciudad
  }

  const fetchRandomWeather = async (refresh = false) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)

    try {
      const cities = getRandomCities(6)
      const weatherPromises = cities.map((city) => getWeatherData(city))
      const results = await Promise.all(weatherPromises)
      setWeatherData(results)
    } catch (error) {
      console.error("Error fetching random weather:", error)
    }

    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    fetchRandomWeather()
  }, [])

  const getTemperatureColor = (temp: number) => {
    if (temp >= 30) return "from-red-400 to-orange-400"
    if (temp >= 20) return "from-orange-400 to-yellow-400"
    if (temp >= 10) return "from-yellow-400 to-green-400"
    if (temp >= 0) return "from-blue-400 to-cyan-400"
    return "from-blue-600 to-blue-400"
  }

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase()
    if (lowerCondition.includes("sunny") || lowerCondition.includes("clear")) return "☀️"
    if (lowerCondition.includes("rain")) return "🌧️"
    if (lowerCondition.includes("cloud")) return "☁️"
    if (lowerCondition.includes("snow")) return "❄️"
    if (lowerCondition.includes("storm")) return "⛈️"
    return "🌤️"
  }

  const truncateCity = (cityName: string, maxLength = 20) => {
    if (cityName.length <= maxLength) return cityName
    return cityName.substring(0, maxLength) + "..."
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white text-glow">Clima Mundial</h2>
              <p className="text-white/80">Descubre el clima en diferentes ciudades</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <GlassCard key={i} className="p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-6 bg-white/20 rounded-lg w-2/3"></div>
                <div className="h-12 bg-white/20 rounded-lg w-1/2"></div>
                <div className="h-4 bg-white/20 rounded-lg w-3/4"></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-8 bg-white/20 rounded-lg"></div>
                  <div className="h-8 bg-white/20 rounded-lg"></div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl pulse-glow">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white text-glow">Clima Mundial</h2>
            <p className="text-white/80">Descubre el clima en diferentes ciudades del mundo</p>
          </div>
        </div>

        <GlassButton
          onClick={() => fetchRandomWeather(true)}
          disabled={refreshing}
          variant="primary"
          glow={!refreshing}
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Actualizando..." : "Actualizar"}
        </GlassButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weatherData.map((weather, index) => (
          <GlassCard
            key={weather.city}
            className="cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-white/20 animate-in slide-in-from-bottom-4 p-6"
            style={{ animationDelay: `${index * 150}ms` }}
            onClick={() => onCitySelect(weather.city.split(",")[0], weather)}
            variant="neon"
          >
            {/* Header con ciudad e icono */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-4xl animate-pulse flex-shrink-0">{getWeatherIcon(weather.condition)}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-white text-glow truncate" title={weather.city}>
                    {truncateCity(weather.city, 18)}
                  </h3>
                  <div className="flex items-center gap-1 text-white/70 text-sm">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span>Ahora</span>
                  </div>
                </div>
              </div>
              <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse flex-shrink-0" />
            </div>

            {/* Temperatura principal */}
            <div className="text-center mb-4">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${getTemperatureColor(weather.temperature)} text-black font-bold text-2xl shadow-lg`}
              >
                <Thermometer className="h-5 w-5" />
                {weather.temperature}°C
              </div>
            </div>

            {/* Condición */}
            <div className="text-center mb-4">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md px-3 py-1">
                {weather.condition}
              </Badge>
            </div>

            {/* Datos adicionales */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <GlassCard className="p-3 text-center">
                <Droplets className="h-4 w-4 text-blue-300 mx-auto mb-1" />
                <div className="text-white/80 text-xs">Humedad</div>
                <div className="text-white font-bold">{weather.humidity}%</div>
              </GlassCard>
              <GlassCard className="p-3 text-center">
                <Wind className="h-4 w-4 text-gray-300 mx-auto mb-1" />
                <div className="text-white/80 text-xs">Viento</div>
                <div className="text-white font-bold">{weather.windSpeed} km/h</div>
              </GlassCard>
            </div>

            {/* Descripción */}
            <GlassCard className="p-3 mb-4 aurora">
              <div className="flex items-start gap-2">
                <Eye className="h-4 w-4 text-white/80 mt-0.5 flex-shrink-0" />
                <p className="text-white/90 text-xs leading-relaxed line-clamp-2">{weather.description}</p>
              </div>
            </GlassCard>

            {/* Botón de acción */}
            <GlassButton
              className="w-full"
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onCitySelect(weather.city.split(",")[0], weather)
              }}
            >
              <Eye className="h-4 w-4" />
              Ver detalles y agregar nota
            </GlassButton>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="text-center p-6 aurora">
        <p className="text-white/90 font-medium">
          💡 Haz clic en cualquier ciudad para ver más detalles y agregar tu nota personal
        </p>
      </GlassCard>
    </div>
  )
}
