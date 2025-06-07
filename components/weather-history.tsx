"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calendar,
  MapPin,
  Thermometer,
  Edit2,
  Save,
  X,
  Trash2,
  Info,
  History,
  Heart,
  Wind,
  Droplets,
} from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { GlassButton } from "@/components/glass-button"
import { isDemoMode, mockWeatherEntries, type WeatherEntry } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface WeatherHistoryProps {
  refreshTrigger: number
  isDemo?: boolean
  onEntriesChange?: (entries: WeatherEntry[]) => void
  user?: any // Agregar prop de usuario
}

export function WeatherHistory({ refreshTrigger, isDemo = false, onEntriesChange, user }: WeatherHistoryProps) {
  const [entries, setEntries] = useState<WeatherEntry[]>([])
  const [loading, setLoading] = useState(true) // Cambiar a true para mostrar loading inicial
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNote, setEditNote] = useState("")
  const [userReady, setUserReady] = useState(false)

  const fetchEntries = async (showLoading = false) => {
    if (showLoading) {
      setLoading(true)
    }

    try {
      if (isDemo || isDemoMode) {
        // En modo demo, cargar datos mock inmediatamente
        console.log("🎭 Cargando datos demo del historial...")
        setEntries(mockWeatherEntries)
        onEntriesChange?.(mockWeatherEntries)
        setLoading(false)
        return
      }

      // Solo cargar si hay usuario autenticado
      if (!user) {
        console.log("⏳ Esperando autenticación del usuario...")
        setEntries([])
        onEntriesChange?.([])
        setLoading(false)
        return
      }

      console.log("🔄 Cargando historial del usuario:", user.email)

      // Obtener el token de autenticación
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      if (!token) {
        console.error("❌ No se pudo obtener el token de autenticación")
        setEntries([])
        onEntriesChange?.([])
        setLoading(false)
        return
      }

      const response = await fetch("/api/weather-entries", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Historial del usuario cargado:", data.length, "entradas")
        setEntries(data)
        onEntriesChange?.(data)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("⚠️ Error en API:", response.status, errorData)
        setEntries([])
        onEntriesChange?.([])
      }
    } catch (error) {
      console.error("❌ Error fetching entries:", error)
      // En caso de error con usuario real, mostrar vacío
      if (!isDemo && !isDemoMode) {
        setEntries([])
        onEntriesChange?.([])
      } else {
        // Solo usar mock en modo demo
        setEntries(mockWeatherEntries)
        onEntriesChange?.(mockWeatherEntries)
      }
    }

    setLoading(false)
  }

  // Detectar cuando el usuario está listo
  useEffect(() => {
    if (isDemo || isDemoMode) {
      console.log("🎭 Modo demo activado")
      setUserReady(true)
      fetchEntries(false)
    } else if (user) {
      console.log("👤 Usuario autenticado:", user.email)
      setUserReady(true)
      fetchEntries(false)
    } else {
      console.log("⏳ Esperando autenticación...")
      setUserReady(false)
      setLoading(true)
    }
  }, [user, isDemo]) // Depender del usuario y modo demo

  // Carga cuando cambia el trigger (para nuevas entradas)
  useEffect(() => {
    if (userReady && refreshTrigger > 0) {
      console.log("🔄 Refresh trigger activado:", refreshTrigger)
      fetchEntries(true) // Con loading para refreshes
    }
  }, [refreshTrigger, userReady])

  const handleEdit = (entry: WeatherEntry) => {
    setEditingId(entry.id)
    setEditNote(entry.personal_note)
  }

  const handleSaveEdit = async (id: string) => {
    if (isDemo || isDemoMode) {
      // Simular edición en modo demo
      setEntries(entries.map((entry) => (entry.id === id ? { ...entry, personal_note: editNote } : entry)))
      setEditingId(null)
      setEditNote("")
      return
    }

    try {
      const response = await fetch(`/api/weather-entries/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ personal_note: editNote }),
      })

      if (response.ok) {
        setEntries(entries.map((entry) => (entry.id === id ? { ...entry, personal_note: editNote } : entry)))
        setEditingId(null)
        setEditNote("")
      }
    } catch (error) {
      console.error("Error updating entry:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta entrada?")) return

    if (isDemo || isDemoMode) {
      // Simular eliminación en modo demo con animación
      setEntries(entries.filter((entry) => entry.id !== id))
      return
    }

    try {
      const response = await fetch(`/api/weather-entries/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setEntries(entries.filter((entry) => entry.id !== id))
      }
    } catch (error) {
      console.error("Error deleting entry:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    })
  }

  const getTemperatureColor = (temp: number) => {
    if (temp >= 30) return "from-red-400 to-orange-400"
    if (temp >= 20) return "from-orange-400 to-yellow-400"
    if (temp >= 10) return "from-yellow-400 to-green-400"
    if (temp >= 0) return "from-blue-400 to-cyan-400"
    return "from-blue-600 to-blue-400"
  }

  // Mostrar loading mientras esperamos usuario o cargando datos
  if (loading || !userReady) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl">
            <History className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white text-glow">Mi Historial del Clima</h2>
            <p className="text-white/80">
              {!userReady ? "Esperando autenticación..." : "Cargando tus experiencias climáticas..."}
            </p>
          </div>
        </div>
        {[1, 2].map((i) => (
          <GlassCard key={i} className="p-6 animate-pulse">
            <div className="space-y-4">
              <div className="h-6 bg-white/20 rounded-lg w-1/3"></div>
              <div className="h-4 bg-white/20 rounded-lg w-1/2"></div>
              <div className="h-20 bg-white/20 rounded-lg"></div>
            </div>
          </GlassCard>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 animate-in slide-in-from-top-2 duration-500">
        <div className="p-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl pulse-glow">
          <History className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white text-glow">Mi Historial del Clima</h2>
          <p className="text-white/80">
            {isDemo || isDemoMode
              ? "Experiencias climáticas de demostración"
              : `Tus experiencias climáticas, ${user?.email}`}
          </p>
        </div>
        {entries.length > 0 && (
          <Badge className="bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold px-3 py-1 animate-in fade-in duration-300 delay-200">
            {entries.length} {entries.length === 1 ? "entrada" : "entradas"}
          </Badge>
        )}
      </div>

      {(isDemo || isDemoMode) && (
        <GlassCard className="animate-in slide-in-from-top-3 duration-500 delay-100 p-4 aurora">
          <Alert className="bg-transparent border-0">
            <Info className="h-4 w-4 text-yellow-300" />
            <AlertDescription className="text-white font-medium">
              <strong>Modo demo:</strong> Los cambios no se guardarán permanentemente.
            </AlertDescription>
          </Alert>
        </GlassCard>
      )}

      {entries.length === 0 ? (
        <GlassCard className="animate-in slide-in-from-bottom-4 duration-500 delay-200 p-12 text-center" variant="neon">
          <div className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center pulse-glow">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white text-glow mb-2">No tienes entradas guardadas aún</h3>
              <p className="text-white/80">¡Consulta el clima de tu ciudad y agrega tu primera reflexión personal!</p>
            </div>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {entries.map((entry, index) => (
            <GlassCard
              key={entry.id}
              className={cn(
                "relative transition-all duration-500 hover:shadow-2xl hover:shadow-white/20",
                "animate-in slide-in-from-bottom-4 duration-500 p-6",
              )}
              style={{ animationDelay: `${index * 100}ms` }}
              variant="neon"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-6 w-6 text-blue-300" />
                    <h3 className="text-2xl font-bold text-white text-glow">{entry.city}</h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-white/80">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">{formatDate(entry.date)}</span>
                    </div>

                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${getTemperatureColor(entry.temperature)} text-black font-bold shadow-lg`}
                    >
                      <Thermometer className="h-4 w-4" />
                      <span>{entry.temperature}°C</span>
                    </div>

                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md font-medium px-3 py-1">
                      {entry.weather_condition}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <GlassButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleEdit(entry)}
                    disabled={editingId === entry.id}
                  >
                    <Edit2 className="h-4 w-4" />
                  </GlassButton>
                  <GlassButton variant="danger" size="sm" onClick={() => handleDelete(entry.id)}>
                    <Trash2 className="h-4 w-4" />
                  </GlassButton>
                </div>
              </div>

              {/* Datos del clima */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <GlassCard className="p-4 text-center">
                  <Droplets className="h-5 w-5 text-blue-300 mx-auto mb-2" />
                  <div className="text-white/80 text-sm">Humedad</div>
                  <div className="text-white font-bold text-lg">{entry.humidity}%</div>
                </GlassCard>
                <GlassCard className="p-4 text-center">
                  <Wind className="h-5 w-5 text-gray-300 mx-auto mb-2" />
                  <div className="text-white/80 text-sm">Viento</div>
                  <div className="text-white font-bold text-lg">{entry.wind_speed} km/h</div>
                </GlassCard>
              </div>

              {/* Nota personal */}
              {editingId === entry.id ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <Textarea
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    rows={3}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-md resize-none"
                  />
                  <div className="flex gap-3">
                    <GlassButton variant="success" size="sm" onClick={() => handleSaveEdit(entry.id)} glow>
                      <Save className="h-4 w-4" />
                      Guardar
                    </GlassButton>
                    <GlassButton
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setEditingId(null)
                        setEditNote("")
                      }}
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </GlassButton>
                  </div>
                </div>
              ) : (
                <GlassCard className="p-4 aurora">
                  <p className="text-white/90 italic leading-relaxed font-medium">"{entry.personal_note}"</p>
                </GlassCard>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
