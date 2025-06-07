"use client"

import { useEffect, useState } from "react"

export function FloatingShapes() {
  const [shapes, setShapes] = useState<Array<{ id: number; size: number; left: number; delay: number }>>([])

  useEffect(() => {
    const newShapes = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: Math.random() * 100 + 20,
      left: Math.random() * 100,
      delay: Math.random() * 15,
    }))
    setShapes(newShapes)
  }, [])

  return (
    <div className="floating-shapes">
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className="floating-shape"
          style={{
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            left: `${shape.left}%`,
            animationDelay: `${shape.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
