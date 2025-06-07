import { createClient } from "@supabase/supabase-js"

// Usar valores por defecto si las variables de entorno no están configuradas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-key"

// Verificar si estamos en modo demo
export const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Log para debugging en producción
if (typeof window !== "undefined") {
  console.log("🔍 Modo demo:", isDemoMode)
  console.log("🔗 Supabase URL configurada:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("🔑 Supabase Key configurada:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type WeatherEntry = {
  id: string
  user_id: string
  city: string
  date: string
  temperature: number
  weather_condition: string
  weather_description: string
  humidity: number
  wind_speed: number
  personal_note: string
  created_at: string
  updated_at: string
}

// Mock data para modo demo
export const mockWeatherEntries: WeatherEntry[] = [
  {
    id: "1",
    user_id: "demo-user",
    city: "Madrid",
    date: "2024-01-15",
    temperature: 18,
    weather_condition: "Sunny",
    weather_description: "Cielo despejado con brisa ligera",
    humidity: 45,
    wind_speed: 12,
    personal_note: "Día perfecto para salir a caminar por el Retiro. El sol me dio mucha energía.",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    user_id: "demo-user",
    city: "Barcelona",
    date: "2024-01-14",
    temperature: 22,
    weather_condition: "Partly Cloudy",
    weather_description: "Parcialmente nublado con temperatura agradable",
    humidity: 60,
    wind_speed: 8,
    personal_note: "Clima ideal para trabajar desde la terraza. Las nubes daban un toque perfecto al paisaje.",
    created_at: "2024-01-14T14:30:00Z",
    updated_at: "2024-01-14T14:30:00Z",
  },
]
