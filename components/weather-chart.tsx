"use client"

import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, BarChart3, Activity, Target, Zap } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import type { WeatherEntry } from "@/lib/supabase"

interface WeatherChartProps {
  entries: WeatherEntry[]
}

export function WeatherChart({ entries }: WeatherChartProps) {
  if (entries.length === 0) return null

  // Preparar datos para el gráfico
  const chartData = entries
    .slice(0, 7) // Últimas 7 entradas
    .reverse() // Orden cronológico
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
      temperature: entry.temperature,
      humidity: entry.humidity,
      city: entry.city,
      condition: entry.weather_condition,
    }))

  const maxTemp = Math.max(...chartData.map((d) => d.temperature))
  const minTemp = Math.min(...chartData.map((d) => d.temperature))
  const avgTemp = chartData.reduce((sum, d) => sum + d.temperature, 0) / chartData.length

  const tempTrend = chartData.length > 1 ? chartData[chartData.length - 1].temperature - chartData[0].temperature : 0

  const getTemperatureColor = (temp: number) => {
    if (temp >= 25) return "from-red-400 to-orange-400"
    if (temp >= 15) return "from-orange-400 to-yellow-400"
    if (temp >= 5) return "from-yellow-400 to-green-400"
    return "from-blue-400 to-cyan-400"
  }

  return (
    <GlassCard className="w-full animate-in slide-in-from-bottom-4 duration-500 p-6" variant="neon">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-xl pulse-glow">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white text-glow">Tendencia del Clima</h3>
            <p className="text-white/80">Análisis de tus últimas {chartData.length} entradas</p>
          </div>
        </div>
        <Badge
          className={`flex items-center gap-2 px-4 py-2 font-bold ${
            tempTrend > 0
              ? "bg-gradient-to-r from-green-400 to-emerald-400 text-black"
              : tempTrend < 0
                ? "bg-gradient-to-r from-red-400 to-pink-400 text-white"
                : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
          }`}
        >
          {tempTrend > 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : tempTrend < 0 ? (
            <TrendingDown className="h-4 w-4" />
          ) : (
            <Activity className="h-4 w-4" />
          )}
          {tempTrend > 0 ? "+" : ""}
          {tempTrend.toFixed(1)}°C
        </Badge>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <GlassCard className="p-4 text-center aurora">
          <Target className="h-6 w-6 text-red-300 mx-auto mb-2" />
          <div className="text-3xl font-bold text-white text-glow">{maxTemp}°C</div>
          <div className="text-white/80 text-sm font-medium">Máxima</div>
        </GlassCard>
        <GlassCard className="p-4 text-center aurora">
          <Activity className="h-6 w-6 text-green-300 mx-auto mb-2" />
          <div className="text-3xl font-bold text-white text-glow">{avgTemp.toFixed(1)}°C</div>
          <div className="text-white/80 text-sm font-medium">Promedio</div>
        </GlassCard>
        <GlassCard className="p-4 text-center aurora">
          <Zap className="h-6 w-6 text-blue-300 mx-auto mb-2" />
          <div className="text-3xl font-bold text-white text-glow">{minTemp}°C</div>
          <div className="text-white/80 text-sm font-medium">Mínima</div>
        </GlassCard>
      </div>

      {/* Gráfico de barras de temperatura */}
      <div className="space-y-4 mb-8">
        <h4 className="text-lg font-bold text-white text-glow flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-300" />
          Temperatura por día
        </h4>
        <div className="space-y-3">
          {chartData.map((data, index) => {
            const percentage = ((data.temperature - minTemp) / (maxTemp - minTemp || 1)) * 100
            const barColorClass = getTemperatureColor(data.temperature)

            return (
              <div
                key={index}
                className="flex items-center gap-4 animate-in slide-in-from-left-2 duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 text-sm font-medium text-white/80">{data.date}</div>
                <div className="flex-1 relative">
                  <GlassCard className="h-10 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${barColorClass} transition-all duration-1000 ease-out flex items-center justify-end pr-3 shadow-lg`}
                      style={{ width: `${Math.max(percentage, 15)}%` }}
                    >
                      <span className="text-sm font-bold text-black">{data.temperature}°C</span>
                    </div>
                  </GlassCard>
                </div>
                <div className="w-24 text-sm text-white/70 truncate">{data.city}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Gráfico de humedad */}
      <div className="space-y-4 mb-8">
        <h4 className="text-lg font-bold text-white text-glow flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-300" />
          Humedad relativa
        </h4>
        <div className="space-y-3">
          {chartData.map((data, index) => (
            <div
              key={index}
              className="flex items-center gap-4 animate-in slide-in-from-right-2 duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-16 text-sm font-medium text-white/80">{data.date}</div>
              <div className="flex-1 relative">
                <GlassCard className="h-8 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-1000 ease-out flex items-center justify-end pr-3 shadow-lg"
                    style={{ width: `${data.humidity}%` }}
                  >
                    <span className="text-sm font-bold text-black">{data.humidity}%</span>
                  </div>
                </GlassCard>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Condiciones más frecuentes */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-white text-glow flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-300" />
          Condiciones recientes
        </h4>
        <div className="flex flex-wrap gap-3">
          {Array.from(new Set(chartData.map((d) => d.condition))).map((condition, index) => (
            <Badge
              key={condition}
              className="bg-white/20 text-white border-white/30 backdrop-blur-md px-3 py-1 animate-in fade-in duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {condition}
            </Badge>
          ))}
        </div>
      </div>
    </GlassCard>
  )
}
