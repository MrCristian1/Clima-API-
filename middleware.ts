import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Solo aplicar a rutas de API
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Manejar solicitudes OPTIONS para CORS preflight
    if (request.method === "OPTIONS") {
      const response = new NextResponse(null, { status: 200 })
      response.headers.set("Access-Control-Allow-Origin", "*")
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
      response.headers.set("Access-Control-Max-Age", "86400")
      return response
    }
  }

  return NextResponse.next()
}

// Configurar para que solo se ejecute en rutas de API
export const config = {
  matcher: "/api/:path*",
}
