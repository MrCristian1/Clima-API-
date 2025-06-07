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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log("API: Updating entry with ID:", id)

    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      console.error("API: No authorization header for PUT")
      return setCorsHeaders(NextResponse.json({ error: "No authorization header" }, { status: 401 }))
    }

    const token = authHeader.replace("Bearer ", "")
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError) {
      console.error("API: Auth error for PUT:", userError.message)
      return setCorsHeaders(NextResponse.json({ error: "Invalid token: " + userError.message }, { status: 401 }))
    }

    if (!user) {
      console.error("API: No user found for PUT")
      return setCorsHeaders(NextResponse.json({ error: "No user found with token" }, { status: 401 }))
    }

    const body = await request.json()
    const { personal_note } = body

    console.log("API: Updating note for user:", user.id)

    const { data, error } = await supabase
      .from("weather_entries")
      .update({
        personal_note,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()

    if (error) {
      console.error("API: Error updating entry:", error.message, error.details, error.hint)
      return setCorsHeaders(NextResponse.json({ error: "Database error: " + error.message }, { status: 500 }))
    }

    if (data.length === 0) {
      console.error("API: No entry found to update")
      return setCorsHeaders(NextResponse.json({ error: "Entry not found" }, { status: 404 }))
    }

    console.log("API: Successfully updated entry")
    return setCorsHeaders(NextResponse.json(data[0]))
  } catch (error) {
    console.error("API: Unexpected error in PUT:", error)
    return setCorsHeaders(
      NextResponse.json(
        { error: "Internal server error: " + (error instanceof Error ? error.message : String(error)) },
        { status: 500 },
      ),
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log("API: Deleting entry with ID:", id)

    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      console.error("API: No authorization header for DELETE")
      return setCorsHeaders(NextResponse.json({ error: "No authorization header" }, { status: 401 }))
    }

    const token = authHeader.replace("Bearer ", "")
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      console.error("API: Auth error for DELETE:", userError?.message || "No user found")
      return setCorsHeaders(NextResponse.json({ error: "Invalid token" }, { status: 401 }))
    }

    console.log("API: Deleting entry for user:", user.id)

    const { error } = await supabase.from("weather_entries").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("API: Error deleting entry:", error.message, error.details, error.hint)
      return setCorsHeaders(NextResponse.json({ error: "Database error: " + error.message }, { status: 500 }))
    }

    console.log("API: Successfully deleted entry")
    return setCorsHeaders(NextResponse.json({ message: "Entry deleted successfully" }))
  } catch (error) {
    console.error("API: Unexpected error in DELETE:", error)
    return setCorsHeaders(
      NextResponse.json(
        { error: "Internal server error: " + (error instanceof Error ? error.message : String(error)) },
        { status: 500 },
      ),
    )
  }
}
