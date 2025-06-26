// "use client"

// import React, { useEffect, useRef } from "react"

// export function UnderwaterBackground() {
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const animationRef = useRef<number>(0)
//   const lastFrameTimeRef = useRef<number>(0)
//   const marineLifeRef = useRef<MarineLife[]>([])

//   // Initialize canvas and animation
//   useEffect(() => {
//     if (!canvasRef.current) return

//     const canvas = canvasRef.current
//     const ctx = canvas.getContext("2d")
//     if (!ctx) return

//     // Set canvas dimensions
//     const resizeCanvas = () => {
//       const container = canvas.parentElement
//       if (container) {
//         canvas.width = container.clientWidth
//         canvas.height = container.clientHeight
//       }
//     }

//     resizeCanvas()
//     window.addEventListener("resize", resizeCanvas)

//     // Create marine life
//     const newMarineLife: MarineLife[] = []
//     for (let i = 0; i < 5; i++) {
//       newMarineLife.push(new MarineLife(canvas, "fish"))
//     }
//     marineLifeRef.current = newMarineLife

//     // Animation loop
//     let lastTime = 0
//     const animate = (timestamp: number) => {
//       if (!canvas || !ctx) return

//       // Calculate delta time for smooth animations
//       if (!lastTime) lastTime = timestamp
//       const deltaTime = Math.min(32, timestamp - lastTime) / 16 // Cap at 60fps equivalent
//       lastTime = timestamp
//       lastFrameTimeRef.current = timestamp

//       // Clear canvas
//       ctx.clearRect(0, 0, canvas.width, canvas.height)

//       // Draw underwater background
//       drawUnderwaterBackground(ctx, canvas, timestamp)

//       // Update and draw marine life
//       const updatedMarineLife = [...marineLifeRef.current]
//       updatedMarineLife.forEach((life) => life.update(canvas, deltaTime))
//       updatedMarineLife.forEach((life) => life.draw(ctx))
//       marineLifeRef.current = updatedMarineLife

//       // Continue animation
//       animationRef.current = requestAnimationFrame(animate)
//     }

//     // Start animation
//     animationRef.current = requestAnimationFrame(animate)

//     // Cleanup
//     return () => {
//       window.removeEventListener("resize", resizeCanvas)
//       cancelAnimationFrame(animationRef.current)
//     }
//   }, [])

//   // Draw underwater background
//   const drawUnderwaterBackground = (
//     ctx: CanvasRenderingContext2D,
//     canvas: HTMLCanvasElement,
//     timestamp: number
//   ) => {
//     // Create gradient background
//     const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
//     gradient.addColorStop(0, "rgba(100, 200, 255, 0.2)")
//     gradient.addColorStop(1, "rgba(0, 100, 200, 0.3)")
//     ctx.fillStyle = gradient
//     ctx.fillRect(0, 0, canvas.width, canvas.height)

//     // Draw light rays
//     const rayCount = 4
//     for (let i = 0; i < rayCount; i++) {
//       const x = canvas.width * (i / rayCount + 0.1)
//       const width = canvas.width * 0.1
//       const speed = 2000 + i * 500
//       const offset = (timestamp % speed) / speed

//       const rayGradient = ctx.createLinearGradient(x, 0, x + width, canvas.height)
//       rayGradient.addColorStop(0, "rgba(255, 255, 255, 0.1)")
//       rayGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.05)")
//       rayGradient.addColorStop(1, "rgba(255, 255, 255, 0)")

//       ctx.beginPath()
//       ctx.moveTo(x, 0)
//       ctx.lineTo(x + width, 0)
//       ctx.lineTo(x + width * 1.5 + Math.sin(offset * Math.PI * 2) * width * 0.5, canvas.height)
//       ctx.lineTo(x + Math.sin(offset * Math.PI * 2) * width * 0.5, canvas.height)
//       ctx.closePath()
//       ctx.fillStyle = rayGradient
//       ctx.fill()
//     }

//     // Draw some random floating particles
//     const particleCount = 20
//     for (let i = 0; i < particleCount; i++) {
//       const x = (Math.sin(timestamp / 2000 + i) * 0.5 + 0.5) * canvas.width
//       const y = (Math.cos(timestamp / 1500 + i * 0.7) * 0.5 + 0.5) * canvas.height
//       const size = 1 + Math.sin(timestamp / 1000 + i * 0.3) * 1

//       ctx.beginPath()
//       ctx.arc(x, y, size, 0, Math.PI * 2)
//       ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
//       ctx.fill()
//     }
//   }

//   return (
//     <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
//       {/* Canvas for marine life and bubbles */}
//       <canvas ref={canvasRef} className="w-full h-full" />

//       {/* Decorative elements */}
//       <div className="absolute top-0 left-0 w-full h-full">
//         <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
//         <div
//           className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl animate-pulse"
//           style={{ animationDelay: "1s" }}
//         ></div>

//         {/* Floating seaweed */}
//         <div className="absolute bottom-0 left-10 w-20 h-40 bg-green-600/30 rounded-t-full animate-sway"></div>
//         <div
//           className="absolute bottom-0 left-40 w-16 h-32 bg-green-500/30 rounded-t-full animate-sway"
//           style={{ animationDelay: "0.5s" }}
//         ></div>
//         <div
//           className="absolute bottom-0 right-20 w-24 h-48 bg-green-700/30 rounded-t-full animate-sway"
//           style={{ animationDelay: "1s" }}
//         ></div>

//         {/* Coral */}
//         <div className="absolute bottom-0 left-1/4 w-32 h-24 bg-pink-500/20 rounded-t-lg animate-pulse"></div>
//         <div className="absolute bottom-0 right-1/4 w-40 h-32 bg-orange-500/20 rounded-t-lg animate-pulse"></div>

//         {/* Random bubbles */}
//         {Array.from({ length: 15 }).map((_, i) => (
//           <div
//             key={i}
//             className="absolute rounded-full bg-white/30 backdrop-blur-sm animate-bubble"
//             style={{
//               width: `${Math.random() * 20 + 10}px`,
//               height: `${Math.random() * 20 + 10}px`,
//               left: `${Math.random() * 100}%`,
//               bottom: `-50px`,
//               animationDuration: `${Math.random() * 10 + 10}s`,
//               animationDelay: `${Math.random() * 5}s`,
//             }}
//           />
//         ))}
//       </div>

//       {/* Animation keyframes */}
//       <style jsx global>{`
//         @keyframes float {
//           0%, 100% {
//             transform: translateY(0) rotate(0deg);
//           }
//           50% {
//             transform: translateY(-20px) rotate(5deg);
//           }
//         }
        
//         @keyframes sway {
//           0%, 100% {
//             transform: rotate(-5deg) scaleY(1);
//           }
//           50% {
//             transform: rotate(5deg) scaleY(1.05);
//           }
//         }
        
//         @keyframes bubble {
//           0% {
//             transform: translateY(100%) scale(0.5);
//             opacity: 0;
//           }
//           10% {
//             opacity: 1;
//           }
//           100% {
//             transform: translateY(-100vh) scale(1.2);
//             opacity: 0;
//           }
//         }
//       `}</style>
//     </div>
//   )
// }

// // Marine life class for background animations
// class MarineLife {
//   x: number
//   y: number
//   type: string
//   scale: number
//   speed: number
//   direction: number
//   wiggle: number
//   wiggleSpeed: number
//   wiggleAmount: number
//   image: HTMLImageElement | null

//   constructor(canvas: HTMLCanvasElement, type: string) {
//     this.type = type
//     this.scale = 0.5 + Math.random() * 0.5
//     this.speed = 0.5 + Math.random() * 1.5
//     this.direction = Math.random() > 0.5 ? 1 : -1
//     this.wiggle = 0
//     this.wiggleSpeed = 0.02 + Math.random() * 0.04
//     this.wiggleAmount = 5 + Math.random() * 10

//     // Position based on direction
//     if (this.direction > 0) {
//       this.x = -50
//     } else {
//       this.x = canvas.width + 50
//     }
//     this.y = Math.random() * canvas.height

//     // Load image
//     this.image = null
//     const img = new Image()
//     img.src = `/placeholder.svg?height=50&width=100`
//     img.onload = () => {
//       this.image = img
//     }
//   }

//   update(canvas: HTMLCanvasElement, deltaTime: number) {
//     // Move horizontally
//     this.x += this.speed * this.direction * deltaTime

//     // Wiggle vertically
//     this.wiggle += this.wiggleSpeed * deltaTime
//     this.y += (Math.sin(this.wiggle) * this.wiggleAmount) / 10

//     // Check if out of bounds
//     if ((this.direction > 0 && this.x > canvas.width + 100) || (this.direction < 0 && this.x < -100)) {
//       // Reset position
//       if (this.direction > 0) {
//         this.x = -50
//       } else {
//         this.x = canvas.width + 50
//       }
//       this.y = Math.random() * canvas.height
//       return true
//     }

//     return true
//   }

//   draw(ctx: CanvasRenderingContext2D) {
//     if (!this.image) return

//     ctx.save()
//     ctx.translate(this.x, this.y)
//     ctx.scale(this.direction * this.scale, this.scale)
//     ctx.rotate(Math.sin(this.wiggle) * 0.1)

//     // Draw marine life
//     ctx.drawImage(this.image, -50, -25, 100, 50)

//     ctx.restore()
//   }
// }

"use client"

import React, { useEffect, useRef } from "react"

export function UnderwaterBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const lastFrameTimeRef = useRef<number>(0)
  

  // Initialize canvas and animation
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Create marine life
    

    // Animation loop
    let lastTime = 0
    const animate = (timestamp: number) => {
      if (!canvas || !ctx) return

      // Calculate delta time for smooth animations
      if (!lastTime) lastTime = timestamp
      const deltaTime = Math.min(32, timestamp - lastTime) / 16 // Cap at 60fps equivalent
      lastTime = timestamp
      lastFrameTimeRef.current = timestamp

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw underwater background
      drawUnderwaterBackground(ctx, canvas, timestamp)


      // Continue animation
      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animationRef.current = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  // Draw underwater background
  const drawUnderwaterBackground = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    timestamp: number
  ) => {
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, "rgba(100, 200, 255, 0.2)")
    gradient.addColorStop(1, "rgba(0, 100, 200, 0.3)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw light rays
    const rayCount = 4
    for (let i = 0; i < rayCount; i++) {
      const x = canvas.width * (i / rayCount + 0.1)
      const width = canvas.width * 0.1
      const speed = 2000 + i * 500
      const offset = (timestamp % speed) / speed

      const rayGradient = ctx.createLinearGradient(x, 0, x + width, canvas.height)
      rayGradient.addColorStop(0, "rgba(255, 255, 255, 0.1)")
      rayGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.05)")
      rayGradient.addColorStop(1, "rgba(255, 255, 255, 0)")

      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + width, 0)
      ctx.lineTo(x + width * 1.5 + Math.sin(offset * Math.PI * 2) * width * 0.5, canvas.height)
      ctx.lineTo(x + Math.sin(offset * Math.PI * 2) * width * 0.5, canvas.height)
      ctx.closePath()
      ctx.fillStyle = rayGradient
      ctx.fill()
    }

    // Draw some random floating particles
    const particleCount = 20
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.sin(timestamp / 2000 + i) * 0.5 + 0.5) * canvas.width
      const y = (Math.cos(timestamp / 1500 + i * 0.7) * 0.5 + 0.5) * canvas.height
      const size = 1 + Math.sin(timestamp / 1000 + i * 0.3) * 1

      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
      ctx.fill()
    }
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      {/* Canvas for marine life and bubbles */}
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Coral */}
        <div className="absolute bottom-0 left-1/4 w-32 h-24 bg-pink-500/20 rounded-t-lg animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-40 h-32 bg-orange-500/20 rounded-t-lg animate-pulse"></div>
        <div className="absolute bottom-0 left-1/2 w-32 h-24 bg-pink-500/20 rounded-t-lg animate-pulse"></div>
//         <div className="absolute bottom-0 right-1/2 w-40 h-32 bg-orange-500/20 rounded-t-lg animate-pulse"></div>




        {/* Improved bubbles */}
        {Array.from({ length: 15 }).map((_, i) => {
          const size = Math.random() * 30 + 20; // Larger bubbles (20-50px)
          return (
            <div
              key={i}
              className="absolute rounded-full bg-white/30 backdrop-blur-sm animate-bubble"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${Math.random() * 100}%`,
                bottom: `-50px`,
                animationDuration: `${Math.random() * 10 + 10}s`,
                animationDelay: `${Math.random() * 5}s`,
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
              }}
            />
          )
        })}
      </div>

      {/* Animation keyframes */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        
        @keyframes sway {
          0%, 100% {
            transform: rotate(-5deg) scaleY(1);
          }
          50% {
            transform: rotate(5deg) scaleY(1.05);
          }
        }
        
        @keyframes bubble {
          0% {
            transform: translateY(0) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100vh) scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

