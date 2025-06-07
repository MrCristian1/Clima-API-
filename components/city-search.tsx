"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Clock } from "lucide-react"
import { GlassButton } from "@/components/glass-button"
import { searchCities } from "@/lib/cities"
import { cn } from "@/lib/utils"

interface CitySearchProps {
  onCitySelect: (city: string) => void
  loading?: boolean
  className?: string
}

export function CitySearch({ onCitySelect, loading = false, className }: CitySearchProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Cargar búsquedas recientes del localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recent-weather-searches")
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error("Error loading recent searches:", error)
      }
    }
  }, [])

  // Actualizar sugerencias cuando cambia la query
  useEffect(() => {
    if (query.length > 0) {
      const cities = searchCities(query, 6)
      setSuggestions(cities)
      setShowSuggestions(true)
      setSelectedIndex(-1)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [query])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleCitySelect = (city: string) => {
    const cityName = city.split(",")[0] // Extraer solo el nombre de la ciudad
    setQuery(cityName)
    setShowSuggestions(false) // Cerrar inmediatamente
    setSelectedIndex(-1)

    // Guardar en búsquedas recientes
    const newRecent = [city, ...recentSearches.filter((r) => r !== city)].slice(0, 5)
    setRecentSearches(newRecent)
    localStorage.setItem("recent-weather-searches", JSON.stringify(newRecent))

    onCitySelect(cityName)

    // Limpiar el input después de un breve delay para mejor UX
    setTimeout(() => {
      setQuery("")
    }, 50) // Reducir delay
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleCitySelect(suggestions[selectedIndex])
        } else if (query.trim()) {
          handleCitySelect(query.trim())
        }
        break
      case "Escape":
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSearch = () => {
    if (query.trim()) {
      handleCitySelect(query.trim())
      setShowSuggestions(false) // Cerrar sugerencias inmediatamente
      setQuery("")
    }
  }

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className={cn("relative w-full", className)}>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            placeholder="Busca una ciudad... (ej: Madrid, Barcelona, París)"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true)
            }}
            onBlur={() => {
              // Delay para permitir clicks en sugerencias
              setTimeout(() => setShowSuggestions(false), 150)
            }}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-md pr-12 transition-all duration-200 focus:ring-2 focus:ring-white/30"
          />
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
        </div>
        <GlassButton
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          variant="primary"
          glow={!loading && query.trim().length > 0}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">{loading ? "Buscando..." : "Buscar"}</span>
        </GlassButton>
      </div>

      {/* Sugerencias con fondo sólido */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 z-[99999] rounded-xl border border-indigo-300/30 shadow-xl shadow-indigo-500/20 overflow-hidden animate-in slide-in-from-top-2 duration-200"
          style={{
            background: "linear-gradient(145deg, #5b4b8a, #7e6cb8)",
          }}
        >
          {suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-bold text-white/90 uppercase tracking-wide border-b border-white/20 bg-indigo-600/40">
                🌍 Ciudades sugeridas
              </div>
              {suggestions.map((city, index) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-indigo-500/40 transition-all duration-200 flex items-center gap-3",
                    selectedIndex === index && "bg-indigo-600/50 text-white",
                  )}
                >
                  <MapPin className="h-4 w-4 text-blue-300" />
                  <span className="text-white font-medium">{city}</span>
                </button>
              ))}
            </div>
          )}

          {/* Búsquedas recientes */}
          {recentSearches.length > 0 && query.length === 0 && (
            <div className="border-t border-white/20 py-2">
              <div className="px-4 py-2 text-xs font-bold text-white/90 uppercase tracking-wide bg-purple-600/40">
                🕒 Búsquedas recientes
              </div>
              {recentSearches.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className="w-full text-left px-4 py-3 hover:bg-purple-500/40 transition-all duration-200 flex items-center gap-3"
                >
                  <Clock className="h-4 w-4 text-purple-300" />
                  <span className="text-white/90">{city}</span>
                </button>
              ))}
            </div>
          )}

          {suggestions.length === 0 && query.length > 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-white/90 text-sm">No se encontraron ciudades con "{query}"</p>
              <p className="text-white/70 text-xs mt-1">Presiona Enter para buscar de todas formas</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
