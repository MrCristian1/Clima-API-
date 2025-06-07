"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WeatherCard } from "./weather-card"
import { CitySearch } from "./city-search"
import { GlassCard } from "@/components/glass-card"
import { GlassButton } from "@/components/glass-button"
import { getWeatherData, type WeatherData } from "@/lib/weather-api"
import { isDemoMode } from "@/lib/supabase"
import { supabase } from "@/lib/supabase"
import { Save, Info, Search, PenTool, AlertTriangle } from "lucide-react"

interface WeatherEntryFormProps {
  onEntrySaved: () => void
  isDemo?: boolean
  preloadedWeather?: WeatherData | null
  onWeatherCleared?: () => void
}

export function WeatherEntryForm({
  onEntrySaved,
  isDemo = false,
  preloadedWeather = null,
  onWeatherCleared,
}: WeatherEntryFormProps) {
  const [note, setNote] = useState("")
  const [weather, setWeather] = useState<WeatherData | null>(preloadedWeather)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  // Efecto para manejar datos precargados
  useEffect(() => {
    if (preloadedWeather) {
      console.log("🌍 Cargando clima precargado:", preloadedWeather.city)
      setWeather(preloadedWeather)
    }
  }, [preloadedWeather])

  const handleCitySelect = async (city: string) => {
    if (!city.trim()) return

    setLoading(true)
    try {
      const weatherData = await getWeatherData(city)
      setWeather(weatherData)
      setError(null)
    } catch (error) {
      console.error("Error fetching weather:", error)
      setError("Error al obtener el clima. Intenta de nuevo.")
    }
    setLoading(false)
  }

  const handleSaveEntry = async () => {
    if (!weather || !note.trim()) return

    setSaving(true)
    setError(null)
    setDebugInfo(null)

    try {
      if (isDemo || isDemoMode) {
        // Simular guardado en modo demo
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setNote("")
        setWeather(null)
        onWeatherCleared?.() // Notificar que se limpió el clima
        onEntrySaved()
        setSaving(false)
        return
      }

      // Obtener el token de autenticación
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      if (!token) {
        console.error("❌ No se pudo obtener el token de autenticación para guardar entrada")
        setError("Error de autenticación. Intenta cerrar sesión y volver a iniciar.")
        setSaving(false)
        return
      }

      // Verificar que el usuario existe y obtener su ID
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(token)

      if (userError || !user) {
        console.error("❌ Error obteniendo usuario:", userError?.message || "No se encontró usuario")
        setError("Error de autenticación: " + (userError?.message || "No se encontró usuario"))
        setSaving(false)
        return
      }

      console.log("🔑 Enviando solicitud con token:", token.substring(0, 10) + "...")
      console.log("👤 ID de usuario:", user.id)

      // Información de depuración
      setDebugInfo(`Enviando con token: ${token.substring(0, 10)}... | Usuario: ${user.id}`)

      const entryData = {
        city: weather.city,
        temperature: weather.temperature,
        weather_condition: weather.condition,
        weather_description: weather.description,
        humidity: weather.humidity,
        wind_speed: weather.windSpeed,
        personal_note: note,
        date: new Date().toISOString().split("T")[0],
      }

      console.log("📝 Datos a enviar:", entryData)

      const response = await fetch("/api/weather-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(entryData),
      })

      if (response.ok) {
        setNote("")
        setWeather(null)
        onWeatherCleared?.() // Notificar que se limpió el clima
        onEntrySaved()
        setDebugInfo(null)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Error guardando entrada:", response.status, errorData)

        // Mostrar información detallada del error
        setError(`Error al guardar (${response.status}): ${errorData.error || "Error desconocido"}`)

        // Información adicional para depuración
        setDebugInfo(`Status: ${response.status} | Error: ${JSON.stringify(errorData)}`)
      }
    } catch (error) {
      console.error("Error saving entry:", error)
      setError("Error de conexión. Verifica tu internet e intenta de nuevo.")
      setDebugInfo(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6 relative z-0">
      {/* Buscador de ciudades */}
      <GlassCard className="animate-in slide-in-from-top-4 duration-500 p-6 relative z-20" variant="neon">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl">
            <Search className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white text-glow">Consultar Clima</h3>
            <p className="text-white/80 text-sm">
              {preloadedWeather
                ? `Mostrando clima de ${preloadedWeather.city.split(",")[0]} o busca otra ciudad`
                : "Busca cualquier ciudad del mundo"}
            </p>
          </div>
        </div>
        <CitySearch onCitySelect={handleCitySelect} loading={loading} />
      </GlassCard>

      {/* Mensaje de error */}
      {error && (
        <GlassCard className="p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20">
          <Alert className="bg-transparent border-0">
            <AlertTriangle className="h-5 w-5 text-red-300" />
            <AlertDescription className="text-white font-medium">{error}</AlertDescription>
          </Alert>
        </GlassCard>
      )}

      {/* Información de depuración */}
      {debugInfo && (
        <GlassCard className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
          <Alert className="bg-transparent border-0">
            <Info className="h-5 w-5 text-yellow-300" />
            <AlertDescription className="text-white font-medium text-xs">
              <strong>Información de depuración:</strong> {debugInfo}
            </AlertDescription>
          </Alert>
        </GlassCard>
      )}

      {/* Tarjeta del clima */}
      {weather && <WeatherCard weather={weather} />}

      {/* Formulario de nota */}
      {weather && (
        <GlassCard className="animate-in slide-in-from-bottom-4 duration-500 delay-200 p-6" variant="neon">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl">
              <PenTool className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white text-glow">Agregar Nota Personal</h3>
              <p className="text-white/80 text-sm">
                Comparte tu experiencia con el clima de {weather.city.split(",")[0]}
              </p>
            </div>
          </div>

          {(isDemo || isDemoMode) && (
            <GlassCard className="mb-6 p-4 aurora">
              <Alert className="bg-transparent border-0">
                <Info className="h-4 w-4 text-yellow-300" />
                <AlertDescription className="text-white">
                  <strong>Modo demo:</strong> Los datos se simularán y no se guardarán permanentemente.
                </AlertDescription>
              </Alert>
            </GlassCard>
          )}

          <div className="space-y-4">
            <Label className="text-white font-medium text-lg flex items-center gap-2">
              <span>¿Cómo te sientes con este clima?</span>
              <span className="text-2xl">✨</span>
            </Label>
            <Textarea
              placeholder={`Ejemplo: El clima en ${weather.city.split(",")[0]} está perfecto hoy, me siento muy bien...`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-md resize-none"
            />
            <div className="text-xs text-white/60 text-right">{note.length}/500 caracteres</div>

            <GlassButton
              onClick={handleSaveEntry}
              disabled={saving || !note.trim()}
              className="w-full"
              variant="success"
              size="lg"
              glow={!saving && note.trim().length > 0}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Guardando entrada...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Guardar Entrada del Día
                </>
              )}
            </GlassButton>
          </div>
        </GlassCard>
      )}
    </div>
  )
}
