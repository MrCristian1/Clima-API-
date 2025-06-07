"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "dark" | "neon"
  hover?: boolean
}

export function GlassCard({ children, className, variant = "default", hover = true }: GlassCardProps) {
  const baseClasses = "rounded-2xl transition-all duration-300 backdrop-blur-sm"

  const variantClasses = {
    default: "bg-white/30 border border-white/40 text-black",
    dark: "bg-neutral-200/30 border border-neutral-400/40 text-black",
    neon: "bg-white/10 border border-white/50 text-white",
  }

  const hoverClasses = hover
    ? "hover:shadow-md hover:shadow-white/20" // QUITAR hover:scale-105
    : ""

  return <div className={cn(baseClasses, variantClasses[variant], hoverClasses, className)}>{children}</div>
}
