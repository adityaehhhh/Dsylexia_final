"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { VolumeIcon as VolumeUp, Volume2Icon } from "lucide-react"
import { saveGameData } from "@/lib/game-data"
import { useSound } from "@/hooks/use-sound"
import confetti from "canvas-confetti"
import {UnderwaterBackground } from "@/components/underwater-background"

// Letter pairs that are commonly confused by people with dyslexia
const LETTER_PAIRS = [
  { target: "b", confusable: "d" },
  { target: "p", confusable: "q" },
  { target: "m", confusable: "w" },
  { target: "n", confusable: "u" },
  { target: "g", confusable: "j" },
  { target: "i", confusable: "l" },
]

// Bubble class for physics simulation
class Bubble {
  x: number
  y: number
  radius: number
  letter: string
  vx: number
  vy: number
  color: string
  selected: boolean
  popping: boolean
  popProgress: number
  rotation: number
  rotationSpeed: number
  glowIntensity: number
  glowDirection: number

  constructor(x: number, y: number, radius: number, letter: string) {
    this.x = x
    this.y = y
    this.radius = radius
    this.letter = letter
    this.vx = (Math.random() - 0.5) * 1.5
    this.vy = (Math.random() - 0.5) * 1.5
    this.color = `hsla(${Math.random() * 60 + 180}, 80%, 70%, 0.7)`
    this.selected = false
    this.popping = false
    this.popProgress = 0
    this.rotation = Math.random() * Math.PI * 2
    this.rotationSpeed = (Math.random() - 0.5) * 0.02
    this.glowIntensity = 0.5 + Math.random() * 0.5
    this.glowDirection = Math.random() > 0.5 ? 1 : -1
  }

  update(canvas: HTMLCanvasElement, bubbles: Bubble[], deltaTime: number) {
    if (this.popping) {
      this.popProgress += 0.05 * deltaTime
      if (this.popProgress >= 1) {
        return false // Remove bubble when pop animation completes
      }
      return true
    }

    // Update glow effect
    this.glowIntensity += 0.01 * this.glowDirection * deltaTime
    if (this.glowIntensity > 1) {
      this.glowIntensity = 1
      this.glowDirection = -1
    } else if (this.glowIntensity < 0.5) {
      this.glowIntensity = 0.5
      this.glowDirection = 1
    }

    // Rotate bubble
    this.rotation += this.rotationSpeed * deltaTime

    // Move bubble
    this.x += this.vx * deltaTime
    this.y += this.vy * deltaTime

    // Bounce off walls
    if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
      this.vx *= -1
      this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x))
      // Add a little vertical movement when bouncing off walls
      this.vy += (Math.random() - 0.5) * 0.5
    }
    if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
      this.vy *= -1
      this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y))
      // Add a little horizontal movement when bouncing off top/bottom
      this.vx += (Math.random() - 0.5) * 0.5
    }

    // Gradually slow down
    this.vx *= 0.995
    this.vy *= 0.995

    // Add a slight upward drift (bubbles rise in water)
    this.vy -= 0.01 * deltaTime

    // Collision with other bubbles
    for (let i = 0; i < bubbles.length; i++) {
      const other = bubbles[i]
      if (other === this || other.popping) continue

      const dx = other.x - this.x
      const dy = other.y - this.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const minDistance = this.radius + other.radius

      if (distance < minDistance) {
        // Calculate collision response
        const angle = Math.atan2(dy, dx)
        const targetX = this.x + Math.cos(angle) * minDistance
        const targetY = this.y + Math.sin(angle) * minDistance
        const ax = (targetX - other.x) * 0.05
        const ay = (targetY - other.y) * 0.05

        this.vx -= ax * deltaTime
        this.vy -= ay * deltaTime
        other.vx += ax * deltaTime
        other.vy += ay * deltaTime

        // Add a little dampening
        this.vx *= 0.98
        this.vy *= 0.98
        other.vx *= 0.98
        other.vy *= 0.98
      }
    }

    return true
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()

    if (this.popping) {
      // Draw popping animation
      const scale = 1 + this.popProgress * 0.8
      const alpha = 1 - this.popProgress

      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius * scale, 0, Math.PI * 2)
      ctx.fillStyle = this.color
      ctx.fill()

      // Draw bubble shine
      const shineRadius = this.radius * scale * 0.8
      const shineGradient = ctx.createRadialGradient(
        this.x - shineRadius * 0.3,
        this.y - shineRadius * 0.3,
        0,
        this.x,
        this.y,
        shineRadius,
      )
      shineGradient.addColorStop(0, `rgba(255, 255, 255, ${0.8 * alpha})`)
      shineGradient.addColorStop(1, `rgba(255, 255, 255, 0)`)
      ctx.beginPath()
      ctx.arc(this.x - shineRadius * 0.2, this.y - shineRadius * 0.2, shineRadius * 0.6, 0, Math.PI * 2)
      ctx.fillStyle = shineGradient
      ctx.fill()

      // Draw little bubble particles
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + this.rotation
        const distance = this.radius * this.popProgress * 2.5
        const particleX = this.x + Math.cos(angle) * distance
        const particleY = this.y + Math.sin(angle) * distance
        const particleRadius = this.radius * 0.3 * (1 - this.popProgress)

        ctx.beginPath()
        ctx.arc(particleX, particleY, particleRadius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()

        // Add shine to particles
        const particleShine = ctx.createRadialGradient(
          particleX - particleRadius * 0.3,
          particleY - particleRadius * 0.3,
          0,
          particleX,
          particleY,
          particleRadius,
        )
        particleShine.addColorStop(0, `rgba(255, 255, 255, ${0.8 * alpha})`)
        particleShine.addColorStop(1, `rgba(255, 255, 255, 0)`)
        ctx.beginPath()
        ctx.arc(particleX, particleY, particleRadius, 0, Math.PI * 2)
        ctx.fillStyle = particleShine
        ctx.fill()
      }

      // Draw water ripple effect
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius * scale * 1.2, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * alpha})`
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw letter
      ctx.font = `bold ${this.radius * scale * 1.2}px sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "white"
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
      ctx.shadowBlur = 4
      ctx.fillText(this.letter, this.x, this.y)
      ctx.shadowBlur = 0
    } else {
      // Draw normal bubble
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      ctx.fillStyle = this.selected ? "rgba(100, 200, 255, 0.8)" : this.color

      // Add bubble shine effect
      const gradient = ctx.createRadialGradient(
        this.x - this.radius * 0.3,
        this.y - this.radius * 0.3,
        this.radius * 0.1,
        this.x,
        this.y,
        this.radius,
      )
      gradient.addColorStop(0, `rgba(255, 255, 255, ${0.8 * this.glowIntensity})`)
      gradient.addColorStop(1, this.selected ? "rgba(100, 200, 255, 0.8)" : this.color)
      ctx.fillStyle = gradient
      ctx.fill()

      // Add bubble outline
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
      ctx.lineWidth = 2
      ctx.stroke()

      // Add second smaller shine
      ctx.beginPath()
      ctx.arc(this.x - this.radius * 0.4, this.y - this.radius * 0.4, this.radius * 0.2, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * this.glowIntensity})`
      ctx.fill()

      // Draw letter
      ctx.font = `bold ${this.radius * 1.2}px sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "white"
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
      ctx.shadowBlur = 4
      ctx.fillText(this.letter, this.x, this.y)
      ctx.shadowBlur = 0
    }

    ctx.restore()
  }

  contains(x: number, y: number) {
    const dx = this.x - x
    const dy = this.y - y
    return Math.sqrt(dx * dx + dy * dy) < this.radius
  }

  pop() {
    this.popping = true
    this.popProgress = 0
  }
}

// Marine life class for background animations
// Updated MarineLife class with fish emojis
class MarineLife {
  x: number
  y: number
  type: string
  scale: number
  speed: number
  direction: number
  wiggle: number
  wiggleSpeed: number
  wiggleAmount: number
  emoji: string
  emojiSize: number

  constructor(canvas: HTMLCanvasElement, type: string) {
    this.type = type
    this.scale = 0.5 + Math.random() * 0.5
    this.speed = 0.5 + Math.random() * 1.5
    this.direction = Math.random() > 0.5 ? 1 : -1
    this.wiggle = 0
    this.wiggleSpeed = 0.01 + Math.random() * 0.04
    this.wiggleAmount = 5 + Math.random() * 10
    this.emoji = ["🐠", "🐟", "🐡"][Math.floor(Math.random() * 3)] // Random fish emoji
    this.emojiSize = 60 + Math.random() 
    // Position based on direction
    if (this.direction > 0) {
      this.x = -50
    } else {
      this.x = canvas.width + 50
    }
    this.y = Math.random() * canvas.height
  }

  update(canvas: HTMLCanvasElement, deltaTime: number) {
    // Move horizontally
    this.x += this.speed * this.direction * deltaTime

    // Wiggle vertically
    this.wiggle += this.wiggleSpeed * deltaTime
    this.y += (Math.sin(this.wiggle) * this.wiggleAmount) / 10

    // Check if out of bounds
    if ((this.direction > 0 && this.x > canvas.width + 100) || (this.direction < 0 && this.x < -100)) {
      // Reset position
      if (this.direction > 0) {
        this.x = -50
      } else {
        this.x = canvas.width + 50
      }
      this.y = Math.random() * canvas.height
      // Change emoji sometimes when fish reappears
      if (Math.random() > 0.7) {
        this.emoji = ["🐠", "🐟", "🐡" ][Math.floor(Math.random() * 3)]
      }
      return true
    }

    return true
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
  
    // Set font and alignment before any transformation
    ctx.font = `${this.emojiSize * this.scale}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
  
    ctx.translate(this.x, this.y);
  
    // Flip if going left
    if (this.direction >0) {
      ctx.scale(-1, 1); // flip horizontally
    }
  
    ctx.rotate(Math.sin(this.wiggle) * 0.2);
  
    // Since scale(-1,1) flips X, we need to draw at negative X if direction < 0
    ctx.fillText(this.emoji, this.direction < 0 ? -0 : 0, 0);
  
    ctx.restore();
  }
  
  
}
export default function BubbleBayGame() {
  const router = useRouter()
  const [currentRound, setCurrentRound] = useState(0)
  const [totalRounds] = useState(10)
  const [targetLetter, setTargetLetter] = useState("")
  const [options, setOptions] = useState<string[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [gameData, setGameData] = useState<any[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const bubblesRef = useRef<Bubble[]>([])
  const marineLifeRef = useRef<MarineLife[]>([])
  const lastFrameTimeRef = useRef<number>(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const startTimeRef = useRef<number | null>(null)
  const roundStartTimeRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { playSound } = useSound()

  // Initialize canvas and animation
  useEffect(() => {
    if (!gameStarted || !canvasRef.current) return

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

    // Initialize audio
    audioRef.current = new Audio("/sounds/underwater-ambience.mp3")
    if (audioRef.current) {
      audioRef.current.loop = true
      audioRef.current.volume = 0.3
      audioRef.current.play().catch((e) => console.log("Audio autoplay prevented:", e))
    }

    // In your useEffect where you create marine life:
const newMarineLife: MarineLife[] = []
for (let i = 0; i < 5; i++) {
  newMarineLife.push(new MarineLife(canvas, "fish"))
}
marineLifeRef.current = newMarineLife

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

      // Update and draw marine life
      const updatedMarineLife = [...marineLifeRef.current]
      updatedMarineLife.forEach((life) => life.update(canvas, deltaTime))
      updatedMarineLife.forEach((life) => life.draw(ctx))
      marineLifeRef.current = updatedMarineLife

      // Update and draw bubbles
      const updatedBubbles = bubblesRef.current.filter((bubble) => bubble.update(canvas, bubblesRef.current, deltaTime))
      bubblesRef.current = updatedBubbles

      // Draw bubbles
      updatedBubbles.forEach((bubble) => bubble.draw(ctx))

      // Continue animation
      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animationRef.current = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationRef.current)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [gameStarted])

  // Draw underwater background
  const drawUnderwaterBackground = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, timestamp: number) => {
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, "rgba(100, 200, 255, 0.2)")
    gradient.addColorStop(1, "rgba(0, 100, 200, 0.3)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw light rays
    const rayCount = 5
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

  // Create bubbles when options change
  useEffect(() => {
    if (!gameStarted || !canvasRef.current || options.length === 0) return

    const canvas = canvasRef.current
    const newBubbles: Bubble[] = []
    options.forEach((letter, index) => {
      const radius = Math.min(canvas.width, canvas.height) * 0.12
      const x = Math.random() * (canvas.width - radius * 2) + radius
      const y = Math.random() * (canvas.height - radius * 2) + radius
      newBubbles.push(new Bubble(x, y, radius, letter))
    })
    bubblesRef.current = newBubbles
  }, [options, gameStarted])

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCorrect !== null || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if a bubble was clicked
    for (const bubble of bubblesRef.current) {
      if (bubble.contains(x, y)) {
        handleLetterSelect(bubble.letter, bubble)
        break
      }
    }
  }

  // Start the game
  const startGame = () => {
    playSound("click")
    setGameStarted(true)
    startTimeRef.current = Date.now()
    setupNewRound()
  }

  // Set up a new round with target letter and options
  const setupNewRound = () => {
    // Reset state for new round
    setIsCorrect(null)

    // Select a random letter pair
    const randomPairIndex = Math.floor(Math.random() * LETTER_PAIRS.length)
    const letterPair = LETTER_PAIRS[randomPairIndex]

    // Randomly decide if target letter is the confusable one
    const useConfusable = Math.random() > 0.5
    const target = useConfusable ? letterPair.confusable : letterPair.target

    setTargetLetter(target)

    // Create options array with the target and confusable letters
    // Plus 2 random other letters
    const allLetters = "abcdefghijklmnopqrstuvwxyz".split("")
    const otherLetters = allLetters.filter((l) => l !== letterPair.target && l !== letterPair.confusable)

    // Get 2 random other letters
    const randomLetters: string[] = []
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * otherLetters.length)
      randomLetters.push(otherLetters[randomIndex])
      otherLetters.splice(randomIndex, 1)
    }

    // Combine and shuffle options
    const allOptions = [target, useConfusable ? letterPair.target : letterPair.confusable, ...randomLetters]

    // Shuffle options
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5)
    setOptions(shuffledOptions)

    // Record round start time
    roundStartTimeRef.current = Date.now()
  }

  // Handle letter selection
  const handleLetterSelect = (letter: string, bubble?: Bubble) => {
    if (isCorrect !== null) return // Prevent multiple selections

    const correct = letter === targetLetter
    setIsCorrect(correct)

    if (correct) {
      setScore(score + 1)
      playSound("correct")

      // Trigger confetti for correct answer
      if (canvasRef.current) {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()

        confetti({
          particleCount: 100,
          spread: 70,
          origin: {
            x: (bubble?.x || canvas.width / 2) / window.innerWidth,
            y: (bubble?.y || canvas.height / 2) / window.innerHeight,
          },
          colors: ["#00bcd4", "#2196f3", "#3f51b5", "#4caf50", "#8bc34a"],
        })
      }
    } else {
      playSound("incorrect")
    }

    // Pop the selected bubble
    if (bubble) {
      bubble.pop()
    }

    // Pop all bubbles after a delay
    setTimeout(() => {
      bubblesRef.current.forEach((b) => {
        if (!b.popping) b.pop()
      })
    }, 500)

    // Calculate reaction time
    const reactionTime = roundStartTimeRef.current ? (Date.now() - roundStartTimeRef.current) / 1000 : 0

    // Save round data
    setGameData((prev) => [
      ...prev,
      {
        round: currentRound + 1,
        targetLetter,
        selectedLetter: letter,
        correct,
        reactionTime,
      },
    ])

    // Move to next round after a short delay
    setTimeout(() => {
      if (currentRound < totalRounds - 1) {
        setCurrentRound(currentRound + 1)
        setupNewRound()
      } else {
        completeGame()
      }
    }, 1500)
  }

  // Complete the game and save data
  const completeGame = () => {
    setGameComplete(true)

    // Calculate total game time
    const totalTime = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 0

    // Calculate accuracy
    const accuracy = (score / totalRounds) * 100

    // Save game data
    saveGameData("bubble-bay", {
      rounds: gameData,
      totalTime,
      accuracy,
      score,
    })

    // Play completion sound
    playSound("complete")

    // Trigger celebration confetti
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      colors: ["#00bcd4", "#2196f3", "#3f51b5", "#4caf50", "#8bc34a"],
    })
  }

  // Continue to next game
  const continueToNextGame = () => {
    playSound("click")
    router.push("/games/word-reef")
  }

  // Play letter sound
  const playLetterSound = () => {
    playSound("pop")

    // In a real implementation, this would play the sound of the letter
    console.log(`Playing sound for letter: ${targetLetter}`)
    // Speech synthesis example:
    if (typeof window !== "undefined") {
      const utterance = new SpeechSynthesisUtterance(targetLetter)
      window.speechSynthesis.speak(utterance)
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-500 to-blue-900 flex flex-col items-center justify-center p-4 overflow-hidden relative">
      
     

      <UnderwaterBackground />


      <Card className="max-w-2xl w-full border-4 border-cyan-300 bg-white/90 backdrop-blur-sm shadow-xl relative z-10">
        {!gameStarted ? (
          <div className="text-center space-y-6 p-6">
            <h1 className="text-3xl font-bold text-blue-800">Bubble Bay</h1>
            <div className="relative w-full max-w-md mx-auto aspect-video rounded-lg overflow-hidden shadow-lg mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-300 flex items-center justify-center">
                <img
                  src="/placeholder.svg?height=200&width=400"
                  alt="Bubble Bay scene with floating letter bubbles"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Animated bubbles */}
              <div className="absolute inset-0">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-white/40 backdrop-blur-sm"
                    style={{
                      width: `${Math.random() * 30 + 20}px`,
                      height: `${Math.random() * 30 + 20}px`,
                      left: `${Math.random() * 80 + 10}%`,
                      top: `${Math.random() * 80 + 10}%`,
                      animation: `float ${Math.random() * 10 + 5}s ease-in-out ${Math.random() * 2}s infinite`,
                    }}
                  />
                ))}
              </div>

              {/* Animated fish */}
              <div
                className="absolute text-3xl"
                style={{ left: "20%", top: "30%", animation: "float 8s ease-in-out infinite" }}
              >
                🐠
              </div>
              <div
                className="absolute text-3xl"
                style={{ left: "70%", top: "60%", animation: "float 7s ease-in-out 1s infinite" }}
              >
                🐟
              </div>
              <div
                className="absolute text-2xl"
                style={{ left: "50%", top: "20%", animation: "float 9s ease-in-out 2s infinite" }}
              >
                🦑
              </div>
            </div>
            <p className="text-lg">
  Welcome to Bubble Bay! Listen carefully to the letter sound, then tap the bubble with the matching letter.
  <br />
  <span className="block text-sm text-gray-600 italic mt-2">
    This activity is designed to assess early reading skills commonly impacted by dyslexia, specifically:
    <strong> phonemic awareness</strong> — the ability to hear and isolate individual sounds in words —
    and <strong>letter-sound correspondence</strong>, which involves recognizing the sound that each letter represents.
    Difficulties in these areas can be early signs of dyslexia and are critical for developing strong decoding and reading fluency.
  </span>
</p>

            <div className="flex justify-center">
              <Button
                onClick={startGame}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 animate-pulse hover:animate-none transform hover:scale-105 transition-all"
              >
                Start Game
              </Button>
            </div>
          </div>
        ) : gameComplete ? (
          <div className="text-center space-y-6 p-6">
            <h1 className="text-3xl font-bold text-blue-800">Great Job!</h1>
            <div className="relative w-full max-w-md mx-auto aspect-video rounded-lg overflow-hidden shadow-lg mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-300 flex items-center justify-center">
                <img
                  src="/placeholder.svg?height=200&width=400"
                  alt="Celebration scene with collected letters"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Celebration animations */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl animate-bounce">🎉</div>
              </div>

              {/* Animated marine life celebration */}
              <div
                className="absolute text-4xl"
                style={{ left: "20%", top: "30%", animation: "float 5s ease-in-out infinite" }}
              >
                🐬
              </div>
              <div
                className="absolute text-4xl"
                style={{ left: "70%", top: "60%", animation: "float 6s ease-in-out 1s infinite" }}
              >
                🐙
              </div>
              <div
                className="absolute text-3xl"
                style={{ left: "50%", top: "20%", animation: "float 7s ease-in-out 2s infinite" }}
              >
                🐠
              </div>
              <div
                className="absolute text-3xl"
                style={{ left: "30%", top: "70%", animation: "float 8s ease-in-out 3s infinite" }}
              >
                🦀
              </div>
            </div>
            <p className="text-lg">
              You collected {score} out of {totalRounds} letters in Bubble Bay!
            </p>
            <div className="w-full bg-blue-100 rounded-full h-4 mb-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-500 h-4 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(score / totalRounds) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={continueToNextGame}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transform hover:scale-105 transition-all"
              >
                Continue to Word Reef
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-blue-800">Bubble Bay</h1>
              <div className="text-sm text-blue-600 font-medium bg-blue-100 px-3 py-1 rounded-full">
                Round {currentRound + 1} of {totalRounds}
              </div>
            </div>

            <Progress value={(currentRound / totalRounds) * 100} className="h-2" />

            <div className="text-center space-y-4">
              <p className={`text-lg text-black`}>Burst the bubble with the letter by taping on it:</p>

              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={playLetterSound}
                  className="rounded-full border-2 border-blue-400 hover:bg-blue-100 transition-all"
                >
                  <VolumeUp className="h-6 w-6 text-blue-600" />
                </Button>
                
              </div>
            </div>

            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-b from-cyan-100 to-blue-200 border-2 border-blue-300">
              <canvas ref={canvasRef} onClick={handleCanvasClick} className="w-full h-full cursor-pointer" />

              {isCorrect !== null && (
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-${isCorrect ? "green" : "red"}-500/20 backdrop-blur-sm transition-all duration-300`}
                >
                  <div
                    className={`text-4xl font-bold text-${isCorrect ? "green" : "red"}-500 bg-white text-black p-4 rounded-lg shadow-lg animate-bounce`}
                  >
                    {isCorrect ? "Correct! 🎉" : "Try Again! 🔄"}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Sound toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm z-20"
        onClick={toggleMute}
      >
        {isMuted ? <VolumeUp className="h-5 w-5" /> : <Volume2Icon className="h-5 w-5" />}
      </Button>

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
            transform: translateY(100%) scale(0.5);
            opacity: 0;
          }
          10% {
            opacity: 1;
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
