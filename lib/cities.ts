// Base de datos de ciudades populares para autocompletado
export const popularCities = [
  // España
  "Madrid, España",
  "Barcelona, España",
  "Valencia, España",
  "Sevilla, España",
  "Zaragoza, España",
  "Málaga, España",
  "Murcia, España",
  "Palma, España",
  "Las Palmas, España",
  "Bilbao, España",

  // América Latina
  "Buenos Aires, Argentina",
  "Ciudad de México, México",
  "Bogotá, Colombia",
  "Lima, Perú",
  "Santiago, Chile",
  "Caracas, Venezuela",
  "Quito, Ecuador",
  "La Paz, Bolivia",
  "Montevideo, Uruguay",
  "Asunción, Paraguay",
  "San José, Costa Rica",
  "Panamá, Panamá",
  "Guatemala, Guatemala",
  "Tegucigalpa, Honduras",
  "San Salvador, El Salvador",
  "Managua, Nicaragua",

  // Estados Unidos
  "Nueva York, Estados Unidos",
  "Los Ángeles, Estados Unidos",
  "Chicago, Estados Unidos",
  "Houston, Estados Unidos",
  "Phoenix, Estados Unidos",
  "Philadelphia, Estados Unidos",
  "San Antonio, Estados Unidos",
  "San Diego, Estados Unidos",
  "Dallas, Estados Unidos",
  "Miami, Estados Unidos",
  "Las Vegas, Estados Unidos",
  "Boston, Estados Unidos",

  // Europa
  "Londres, Reino Unido",
  "París, Francia",
  "Berlín, Alemania",
  "Roma, Italia",
  "Amsterdam, Países Bajos",
  "Viena, Austria",
  "Praga, República Checa",
  "Estocolmo, Suecia",
  "Oslo, Noruega",
  "Copenhague, Dinamarca",
  "Helsinki, Finlandia",
  "Varsovia, Polonia",
  "Budapest, Hungría",
  "Atenas, Grecia",
  "Lisboa, Portugal",
  "Dublín, Irlanda",
  "Bruselas, Bélgica",

  // Asia
  "Tokio, Japón",
  "Pekín, China",
  "Shanghái, China",
  "Mumbai, India",
  "Delhi, India",
  "Seúl, Corea del Sur",
  "Bangkok, Tailandia",
  "Singapur",
  "Kuala Lumpur, Malasia",
  "Jakarta, Indonesia",
  "Manila, Filipinas",
  "Ho Chi Minh, Vietnam",

  // África
  "El Cairo, Egipto",
  "Lagos, Nigeria",
  "Casablanca, Marruecos",
  "Ciudad del Cabo, Sudáfrica",
  "Nairobi, Kenia",
  "Accra, Ghana",
  "Túnez, Túnez",
  "Argel, Argelia",

  // Oceanía
  "Sídney, Australia",
  "Melbourne, Australia",
  "Brisbane, Australia",
  "Perth, Australia",
  "Auckland, Nueva Zelanda",
  "Wellington, Nueva Zelanda",
]

export function searchCities(query: string, limit = 8): string[] {
  if (!query || query.length < 1) return []

  const normalizedQuery = query.toLowerCase().trim()

  return popularCities
    .filter((city) => city.toLowerCase().includes(normalizedQuery) || city.toLowerCase().startsWith(normalizedQuery))
    .sort((a, b) => {
      // Priorizar ciudades que empiecen con la búsqueda
      const aStarts = a.toLowerCase().startsWith(normalizedQuery)
      const bStarts = b.toLowerCase().startsWith(normalizedQuery)

      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1

      return a.localeCompare(b)
    })
    .slice(0, limit)
}
