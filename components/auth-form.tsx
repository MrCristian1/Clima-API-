"use client"

import type React from "react"
import { useState } from "react"
import { supabase, isDemoMode } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FloatingShapes } from "@/components/floating-shapes"
import { GlassCard } from "@/components/glass-card"
import { GlassButton } from "@/components/glass-button"
import { CloudSun, Sparkles, User, Mail, Lock } from "lucide-react"

interface AuthFormProps {
  onDemoLogin: () => void
}

export function AuthForm({ onDemoLogin }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isDemoMode) {
      setMessage("Modo demo activo. Configura Supabase para registro real.")
      return
    }

    setLoading(true)
    setMessage("")

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("¡Registro exitoso! Revisa tu email para confirmar tu cuenta.")
    }
    setLoading(false)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isDemoMode) {
      setMessage("Modo demo activo. Configura Supabase para autenticación real.")
      return
    }

    setLoading(true)
    setMessage("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="gradient-bg">
      <FloatingShapes />
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <GlassCard className="w-full max-w-md p-8" variant="neon">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center mb-4 pulse-glow">
              <CloudSun className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white text-glow mb-2">Mi Diario del Clima</h1>
            <p className="text-white/80">Registra tus experiencias diarias con el clima</p>
          </div>

          {/* Demo Alert */}
          {isDemoMode && (
            <GlassCard className="mb-6 aurora p-4">
              <Alert className="bg-transparent border-0">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <AlertDescription className="text-white">
                  <strong>🎭 Modo Demo:</strong> Explora sin configuración.
                  <GlassButton className="ml-2 px-3 py-1 text-xs" onClick={onDemoLogin} glow>
                    Continuar con demo
                  </GlassButton>
                </AlertDescription>
              </Alert>
            </GlassCard>
          )}

          {/* Tabs */}
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
              <TabsTrigger
                value="signin"
                className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-lg"
              >
                <User className="h-4 w-4 mr-2" />
                Iniciar Sesión
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-lg"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Registrarse
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isDemoMode}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-md"
                    placeholder="tu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Contraseña
                  </Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isDemoMode}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-md"
                    placeholder="••••••••"
                  />
                </div>
                <GlassButton
                  type="submit"
                  className="w-full"
                  variant="primary"
                  disabled={loading || isDemoMode}
                  glow={!loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </GlassButton>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isDemoMode}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-md"
                    placeholder="tu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Contraseña
                  </Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isDemoMode}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-md"
                    placeholder="••••••••"
                  />
                </div>
                <GlassButton
                  type="submit"
                  className="w-full"
                  variant="success"
                  disabled={loading || isDemoMode}
                  glow={!loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {loading ? "Registrando..." : "Crear Cuenta"}
                </GlassButton>
              </form>
            </TabsContent>
          </Tabs>

          {message && (
            <GlassCard className="mt-6 p-4 aurora">
              <p className="text-white text-sm text-center font-medium">{message}</p>
            </GlassCard>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
