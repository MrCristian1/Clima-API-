"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "default" | "primary" | "success" | "danger"
  size?: "sm" | "md" | "lg"
  glow?: boolean
}

export function GlassButton({
  children,
  className,
  variant = "default",
  size = "md",
  glow = false,
  ...props
}: GlassButtonProps) {
  const baseClasses =
    "glass-button rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"

  const variantClasses = {
    default: "text-white hover:text-white",
    primary: "text-blue-100 hover:text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20",
    success: "text-green-100 hover:text-white bg-gradient-to-r from-green-500/20 to-emerald-500/20",
    danger: "text-red-100 hover:text-white bg-gradient-to-r from-red-500/20 to-pink-500/20",
  }

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  }

  const glowClasses = glow ? "pulse-glow" : ""

  return (
    <button className={cn(baseClasses, variantClasses[variant], sizeClasses[size], glowClasses, className)} {...props}>
      {children}
    </button>
  )
}
