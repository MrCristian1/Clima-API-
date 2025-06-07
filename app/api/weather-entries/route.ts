import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Función auxiliar para configurar los headers CORS
function setCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  return response
}

// Manejar preflight OPTIONS requests para CORS
export async function OPTIONS() {
  return setCorsHeaders(NextResponse.json({}, { status: 200 }))
}

export async function GET(request: NextRequest) {
  try {
    // Obtener el token de autorización del header
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      console.error("API: No authorization header provided")
      return setCorsHeaders(NextResponse.json({ error: "No authorization header" }, { status: 401 }))
    }

    // Configurar el cliente de Supabase con el token del usuario
    const token = authHeader.replace("Bearer ", "")
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError) {
      console.error("API: Error getting user from token:", userError.message)
      return setCorsHeaders(NextResponse.json({ error: "Invalid token: " + userError.message }, { status: 401 }))
    }

    if (!user) {
      console.error("API: No user found with token")
      return setCorsHeaders(NextResponse.json({ error: "No user found with token" }, { status: 401 }))
    }

    console.log("API: Getting entries for user:", user.id)

    // Obtener las entradas del usuario
    const { data, error } = await supabase
      .from("weather_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })

    if (error) {
      console.error("API: Error fetching entries:", error.message, error.details, error.hint)
      return setCorsHeaders(NextResponse.json({ error: "Database error: " + error.message }, { status: 500 }))
    }

    console.log("API: Successfully fetched", data?.length || 0, "entries")
    return setCorsHeaders(NextResponse.json(data))
  } catch (error) {
    console.error("API: Unexpected error:", error)
    return setCorsHeaders(
      NextResponse.json(
        { error: "Internal server error: " + (error instanceof Error ? error.message : String(error)) },
        { status: 500 },
      ),
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      console.error("API: No authorization header provided for POST")
      return setCorsHeaders(NextResponse.json({ error: "No authorization header" }, { status: 401 }))
    }

    const token = authHeader.replace("Bearer ", "")
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      console.error("API: Auth error for POST:", userError?.message || "No user found")
      return setCorsHeaders(NextResponse.json({ error: "Invalid token or no user" }, { status: 401 }))
    }

    console.log("API: Creating entry for user:", user.id)

    const body = await request.json()
    const { city, date, temperature, weather_condition, weather_description, humidity, wind_speed, personal_note } =
      body

    console.log("API: Entry data:", { city, date, temperature, weather_condition })
    console.log("API: User ID for insertion:", user.id)

    // Usar el cliente de Supabase con el token del usuario para respetar RLS
    const supabaseWithAuth = supabase.auth.setSession({
      access_token: token,
      refresh_token: "",
    })

    const { data, error } = await supabase
      .from("weather_entries")
      .insert([
        {
          user_id: user.id,
          city,
          date,
          temperature,
          weather_condition,
          weather_description,
          humidity,
          wind_speed,
          personal_note,
        },
      ])
      .select()

    if (error) {
      console.error("API: Error inserting entry:", error.message, error.details, error.hint)
      return setCorsHeaders(NextResponse.json({ error: "Database error: " + error.message }, { status: 500 }))
    }

    console.log("API: Successfully created entry with ID:", data?.[0]?.id)
    return setCorsHeaders(NextResponse.json(data[0], { status: 201 }))
  } catch (error) {
    console.error("API: Unexpected error in POST:", error)
    return setCorsHeaders(
      NextResponse.json(
        { error: "Internal server error: " + (error instanceof Error ? error.message : String(error)) },
        { status: 500 },
      ),
    )
  }
}
