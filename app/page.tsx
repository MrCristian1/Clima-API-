"use client"

import { useState, useEffect } from "react"
import { supabase, isDemoMode } from "@/lib/supabase"
import { AuthForm } from "@/components/auth-form"
import { WeatherEntryForm } from "@/components/weather-entry-form"
import { WeatherHistory } from "@/components/weather-history"
import { WeatherChart } from "@/components/weather-chart"
import { RandomWeatherGrid } from "@/components/random-weather-grid"
import { FloatingShapes } from "@/components/floating-shapes"
import { GlassCard } from "@/components/glass-card"
import { GlassButton } from "@/components/glass-button"
import { LogOut, CloudSun, ArrowLeft, Sparkles, AlertTriangle, RefreshCw } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { WeatherEntry } from "@/lib/supabase"
import type { WeatherData } from "@/lib/weather-api"

export default function Page() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [demoMode, setDemoMode] = useState(false)
  const [showSpecificSearch, setShowSpecificSearch] = useState(false)
  const [entries, setEntries] = useState<WeatherEntry[]>([])
  const [selectedWeather, setSelectedWeather] = useState<WeatherData | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [sessionChecked, setSessionChecked] = useState(false)

  // Función para forzar el cierre de sesión y limpiar el estado
  const forceReset = async () => {
    console.log("🔄 Forzando reinicio de la aplicación...")

    // Limpiar localStorage
    localStorage.clear()

    // Cerrar sesión en Supabase
    await supabase.auth.signOut()

    // Limpiar estado
    setUser(null)
    setDemoMode(false)
    setAuthError(null)

    // Recargar la página para reiniciar completamente
    window.location.reload()
  }

  useEffect(() => {
    const checkSession = async () => {
      try {
        if (isDemoMode) {
          console.log("🎭 Aplicación en modo demo global")
          setLoading(false)
          setSessionChecked(true)
          return
        }

        // Obtener sesión actual
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("❌ Error al obtener sesión:", sessionError.message)
          setAuthError(`Error de autenticación: ${sessionError.message}`)
          setUser(null)
        } else if (session?.user) {
          console.log("👤 Usuario encontrado en sesión:", session.user.email)

          // Verificar que el token sea válido
          try {
            const {
              data: { user: validUser },
              error: userError,
            } = await supabase.auth.getUser(session.access_token)

            if (userError || !validUser) {
              console.error("❌ Token inválido:", userError?.message)
              setAuthError("Sesión inválida. Por favor, inicia sesión de nuevo.")
              await supabase.auth.signOut()
              setUser(null)
            } else {
              setUser(session.user)
              setAuthError(null)
            }
          } catch (error) {
            console.error("❌ Error validando usuario:", error)
            setAuthError("Error validando sesión. Por favor, inicia sesión de nuevo.")
            setUser(null)
          }
        } else {
          console.log("❌ No hay usuario en sesión")
          setUser(null)
        }
      } catch (error) {
        console.error("❌ Error inesperado en checkSession:", error)
        setAuthError("Error inesperado. Por favor, recarga la página.")
        setUser(null)
      }

      setLoading(false)
      setSessionChecked(true)
    }

    checkSession()

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Cambio de autenticación:", event)

      if (event === "SIGNED_OUT") {
        setUser(null)
        setAuthError(null)
      } else if (session?.user) {
        console.log("🔄 Usuario autenticado:", session.user.email)
        setUser(session.user)
        setAuthError(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    if (demoMode || isDemoMode) {
      console.log("🚪 Saliendo del modo demo")
      setDemoMode(false)
      setUser(null)
      return
    }

    try {
      console.log("🚪 Cerrando sesión del usuario")
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error)
      // Forzar cierre de sesión si falla
      forceReset()
    }
  }

  const handleEntrySaved = () => {
    console.log("🆕 Nueva entrada guardada, incrementando trigger...")
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleDemoLogin = () => {
    console.log("🎭 Activando modo demo...")
    setDemoMode(true)
    setUser({ email: "demo@example.com" } as User)
  }

  const handleCitySelect = (city: string, weatherData?: WeatherData) => {
    console.log("🌍 Ciudad seleccionada:", city, weatherData ? "con datos" : "sin datos")
    if (weatherData) {
      setSelectedWeather(weatherData)
    } else {
      setSelectedWeather(null)
    }
    setShowSpecificSearch(true)
  }

  const handleBackToOverview = () => {
    setShowSpecificSearch(false)
    setSelectedWeather(null) // Limpiar datos seleccionados
  }

  const handleWeatherCleared = () => {
    setSelectedWeather(null) // Limpiar cuando se guarda o cambia el clima
  }

  // Mostrar pantalla de carga hasta que se verifique la sesión
  if (loading || !sessionChecked) {
    return (
      <div className="gradient-bg">
        <FloatingShapes />
        <div className="min-h-screen flex items-center justify-center relative z-10">
          <GlassCard className="p-8 text-center">
            <CloudSun className="h-16 w-16 mx-auto mb-6 text-white animate-pulse" />
            <p className="text-white text-xl font-medium">Cargando tu diario del clima...</p>
            <div className="mt-4 w-32 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
            </div>
          </GlassCard>
        </div>
      </div>
    )
  }

  // Si hay un error de autenticación, mostrar pantalla de error con botón de reinicio
  if (authError) {
    return (
      <div className="gradient-bg">
        <FloatingShapes />
        <div className="min-h-screen flex items-center justify-center relative z-10">
          <GlassCard className="p-8 text-center max-w-md">
            <AlertTriangle className="h-16 w-16 mx-auto mb-6 text-red-300" />
            <h2 className="text-2xl font-bold text-white text-glow mb-4">Error de autenticación</h2>
            <p className="text-white/90 mb-6">{authError}</p>
            <div className="flex flex-col gap-4">
              <GlassButton onClick={forceReset} variant="danger" size="lg" glow>
                <RefreshCw className="h-5 w-5 mr-2" />
                Reiniciar aplicación
              </GlassButton>
              <p className="text-white/70 text-sm">
                Si el problema persiste, intenta borrar las cookies y el almacenamiento local del navegador.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    )
  }

  // Si no hay usuario autenticado, mostrar formulario de inicio de sesión
  if (!user && !demoMode) {
    return <AuthForm onDemoLogin={handleDemoLogin} />
  }

  return (
    <div className="gradient-bg">
      <FloatingShapes />

      {/* Header con fondo sólido */}
      <header className="relative z-20">
        <div
          className="mx-0 mt-0 mb-0 border-b border-indigo-300/30 shadow-lg shadow-indigo-500/20"
          style={{
            background: "linear-gradient(135deg, #4c3d7a 0%, #6b5b95 50%, #5a4b7c 100%)",
          }}
        >
          <div className="w-full px-6 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl shadow-lg">
                  <CloudSun className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white text-glow">Mi Diario del Clima</h1>
                  <p className="text-white/90 text-sm">Tu experiencia personal con el clima</p>
                </div>
                {(demoMode || isDemoMode) && (
                  <Badge className="ml-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold shadow-md">
                    ✨ DEMO
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-white/90 text-sm">Bienvenido,</p>
                  <p className="text-white font-medium">{demoMode ? "Usuario Demo" : user?.email}</p>
                </div>
                <GlassButton variant="danger" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  {demoMode || isDemoMode ? "Salir" : "Cerrar Sesión"}
                </GlassButton>

                {/* Botón de emergencia para reiniciar */}
                <GlassButton variant="danger" onClick={forceReset} title="Reiniciar aplicación">
                  <RefreshCw className="h-4 w-4" />
                </GlassButton>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 pb-8 pt-12">
        {(demoMode || isDemoMode) && (
          <GlassCard className="mx-0 mb-6 aurora">
            <Alert className="bg-transparent border-0">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <AlertDescription className="text-white font-medium">
                <strong>🎭 Modo Demo Activo:</strong> Estás explorando con datos simulados. Configura Supabase para la
                experiencia completa.
              </AlertDescription>
            </Alert>
          </GlassCard>
        )}

        {showSpecificSearch ? (
          // Vista de búsqueda específica
          <div className="space-y-6">
            <GlassButton onClick={handleBackToOverview} glow>
              <ArrowLeft className="h-4 w-4" />
              Volver al clima mundial
            </GlassButton>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <WeatherEntryForm
                  onEntrySaved={handleEntrySaved}
                  isDemo={demoMode || isDemoMode}
                  preloadedWeather={selectedWeather}
                  onWeatherCleared={handleWeatherCleared}
                />
              </div>
              <div className="space-y-6">
                <WeatherHistory
                  refreshTrigger={refreshTrigger}
                  isDemo={demoMode || isDemoMode}
                  onEntriesChange={setEntries}
                  user={user}
                />
                {entries.length > 0 && <WeatherChart entries={entries} />}
              </div>
            </div>
          </div>
        ) : (
          // Vista principal con clima mundial
          <div className="space-y-8">
            <RandomWeatherGrid onCitySelect={handleCitySelect} />

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <WeatherEntryForm
                  onEntrySaved={handleEntrySaved}
                  isDemo={demoMode || isDemoMode}
                  onWeatherCleared={handleWeatherCleared}
                />
              </div>
              <div className="space-y-6">
                <WeatherHistory
                  refreshTrigger={refreshTrigger}
                  isDemo={demoMode || isDemoMode}
                  onEntriesChange={setEntries}
                  user={user}
                />
                {entries.length > 0 && <WeatherChart entries={entries} />}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
