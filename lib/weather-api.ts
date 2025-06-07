export interface WeatherData {
  temperature: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  city: string
}

export async function getWeatherData(city: string): Promise<WeatherData> {
  const apiKey = process.env.WEATHER_API_KEY || "392c381c3fcb4123920160202250706"

  // Si no hay API key válida, usar datos simulados
  if (!apiKey || apiKey === "demo-key") {
    console.log("🔄 Usando datos simulados del clima")
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockWeatherData: WeatherData = {
      temperature: Math.round(Math.random() * 30 + 5),
      condition: ["Sunny", "Cloudy", "Rainy", "Partly Cloudy"][Math.floor(Math.random() * 4)],
      description: "Datos simulados - Configura WEATHER_API_KEY para datos reales",
      humidity: Math.round(Math.random() * 40 + 30),
      windSpeed: Math.round(Math.random() * 20 + 5),
      city: city,
    }

    return mockWeatherData
  }

  try {
    console.log(`🌍 Consultando clima real para: ${city}`)

    // Llamada real a WeatherAPI con tu API key
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=no&lang=es`,
    )

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error(`Ciudad "${city}" no encontrada. Intenta con otro nombre.`)
      }
      if (response.status === 401) {
        throw new Error("API Key inválida. Verifica tu configuración.")
      }
      if (response.status === 403) {
        throw new Error("Límite de uso de API excedido. Intenta más tarde.")
      }
      throw new Error(`Error del servicio del clima: ${response.status}`)
    }

    const data = await response.json()

    // Transformar la respuesta de WeatherAPI a nuestro formato
    const weatherData: WeatherData = {
      temperature: Math.round(data.current.temp_c),
      condition: data.current.condition.text,
      description: `${data.current.condition.text} - Sensación térmica: ${Math.round(data.current.feelslike_c)}°C`,
      humidity: data.current.humidity,
      windSpeed: Math.round(data.current.wind_kph),
      city: `${data.location.name}, ${data.location.region}, ${data.location.country}`,
    }

    console.log("✅ Datos del clima obtenidos exitosamente desde WeatherAPI")
    return weatherData
  } catch (error) {
    console.error("❌ Error obteniendo datos del clima:", error)

    // Fallback a datos simulados si hay error
    const fallbackData: WeatherData = {
      temperature: Math.round(Math.random() * 25 + 10),
      condition: "Partly Cloudy",
      description: `Error conectando con el servicio del clima: ${error instanceof Error ? error.message : "Error desconocido"}`,
      humidity: 50,
      windSpeed: 10,
      city: city,
    }

    return fallbackData
  }
}

// Función para validar si la API key está configurada
export function isWeatherApiConfigured(): boolean {
  const apiKey = process.env.WEATHER_API_KEY || "392c381c3fcb4123920160202250706"
  return !!(apiKey && apiKey !== "demo-key" && apiKey.length > 10)
}
