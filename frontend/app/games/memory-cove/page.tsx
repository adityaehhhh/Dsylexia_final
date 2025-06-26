"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { saveGameData } from "@/lib/game-data"
import { useSound } from "@/hooks/use-sound"
import { Volume2Icon, VolumeIcon } from "lucide-react"
import { animated, useSpring, useSprings } from "@react-spring/web"
import { useDrag } from "@use-gesture/react"
import confetti from "canvas-confetti"

// Sea-themed items for memory game
const SEA_ITEMS = [
  { id: 1, name: "Starfish", color: "bg-orange-400", emoji: "🌟" },
  { id: 2, name: "Shell", color: "bg-pink-300", emoji: "🐚" },
  { id: 3, name: "Fish", color: "bg-red-400", emoji: "🐟" },
  { id: 4, name: "Shark", color: "bg-orange-400", emoji: "🦈" },
  { id: 5, name: "Seahorse", color: "bg-yellow-400", emoji: "🦄" },
  { id: 6, name: "Turtle", color: "bg-green-500", emoji: "🐢" },
  { id: 7, name: "Jellyfish", color: "bg-purple-400", emoji: "🪼" },
  { id: 8, name: "Crab", color: "bg-blue-400", emoji: "🦀" },
]

export default function MemoryCoveGame() {
  const router = useRouter()
  const [sequence, setSequence] = useState<number[]>([])
  const [playerSequence, setPlayerSequence] = useState<number[]>([])
  const [isPlayerTurn, setIsPlayerTurn] = useState(false)
  const [level, setLevel] = useState(1)
  const [maxLevel] = useState(6)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [isShowingSequence, setIsShowingSequence] = useState(false)
  const [currentHighlight, setCurrentHighlight] = useState<number | null>(null)
  const [gameData, setGameData] = useState<any[]>([])
  const [maxSequenceReached, setMaxSequenceReached] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [dropZoneItems, setDropZoneItems] = useState<number[]>([])
  const [attempts, setAttempts] = useState(0)
  const maxAttempts = 3
  const bubblesRef = useRef<any[]>([])

  const startTimeRef = useRef<number | null>(null)
  const levelStartTimeRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const { playSound } = useSound()

  // Animation for sequence presentation
  const [sequenceProps, sequenceApi] = useSpring(() => ({
    scale: 1,
    config: { tension: 300, friction: 10 }, // Adjusted for more bouncy effect
  }))

  // Animations for items
  const [itemProps, itemApi] = useSprings(SEA_ITEMS.length, (i) => ({
    scale: 1,
    y: 0,
    zIndex: 0,
    config: { tension: 300, friction: 25 },
  }))

  // Initialize audio and canvas
  useEffect(() => {
    if (!gameStarted) return

    // Initialize audio
    audioRef.current = new Audio("/sounds/underwater-ambience.mp3")
    if (audioRef.current) {
      audioRef.current.loop = true
      audioRef.current.volume = 0.3
      audioRef.current.play().catch((e) => console.log("Audio autoplay prevented:", e))
    }

    // Initialize canvas for background animations
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Set canvas dimensions
      const resizeCanvas = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }

      resizeCanvas()
      window.addEventListener("resize", resizeCanvas)

      // Create bubbles
      bubblesRef.current = Array.from({ length: 30 }, () => ({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 100,
        radius: 5 + Math.random() * 15,
        speed: 1 + Math.random() * 2,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.01 + Math.random() * 0.03,
      }))

      // Animation loop
      const animate = () => {
        if (!ctx) return

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Update and draw bubbles
        bubblesRef.current.forEach((bubble) => {
          // Update position
          bubble.y -= bubble.speed
          bubble.wobble += bubble.wobbleSpeed
          const wobbleX = Math.sin(bubble.wobble) * 2

          // Reset if out of view
          if (bubble.y < -bubble.radius * 2) {
            bubble.y = canvas.height + bubble.radius
            bubble.x = Math.random() * canvas.width
          }

          // Draw bubble
          ctx.beginPath()
          ctx.arc(bubble.x + wobbleX, bubble.y, bubble.radius, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
          ctx.fill()
          ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
          ctx.stroke()

          // Draw shine
          ctx.beginPath()
          ctx.arc(
            bubble.x + wobbleX - bubble.radius * 0.3,
            bubble.y - bubble.radius * 0.3,
            bubble.radius * 0.3,
            0,
            Math.PI * 2,
          )
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
          ctx.fill()
        })

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
    }
  }, [gameStarted])

  // Start the game
  const startGame = () => {
    playSound("click")
    setGameStarted(true)
    startTimeRef.current = Date.now()
    startNewLevel(1)
  }

  // Start a new level
  const startNewLevel = (lvl: number) => {
    setLevel(lvl)
    setAttempts(0)
    levelStartTimeRef.current = Date.now()
    setDropZoneItems([])

    // Generate sequence based on level (level + 1 items)
    const newSequence = []
    for (let i = 0; i < lvl + 1; i++) {
      const randomItemId = Math.floor(Math.random() * SEA_ITEMS.length) + 1
      newSequence.push(randomItemId)
    }

    setSequence(newSequence)
    setPlayerSequence([])

    // Show sequence to player
    showSequence(newSequence)
  }

  // Show sequence to player
  const showSequence = async (seq: number[]) => {
    setIsShowingSequence(true)
    setIsPlayerTurn(false)
    setDropZoneItems([]) // Clear any previous items

    // Show each item in sequence with delay
    for (let i = 0; i < seq.length; i++) {
      await new Promise((resolve) => {
        setTimeout(() => {
          setCurrentHighlight(seq[i])
          playSound("pop")

          // Enhanced animation with larger scale
          sequenceApi.start({ 
            scale: 1.5,
            config: { tension: 300, friction: 10 }
          })
          setTimeout(() => {
            sequenceApi.start({ 
              scale: 1,
              config: { tension: 300, friction: 15 }
            })
            setCurrentHighlight(null)
            resolve(null)
          }, 800) // Increased duration to make it more visible
        }, 1200) // Increased delay between items
      })
    }

    setIsShowingSequence(false)
    setIsPlayerTurn(true)
    playSound("ready")
  }

  // Handle item drag
  const bindDrag = useDrag(({ args: [itemId], active, movement: [x, y], down }) => {
    // Update the dragged item
    itemApi.start((i) => {
      if (SEA_ITEMS[i].id !== itemId) return {}

      return {
        y: down ? y : 0,
        scale: down ? 1.1 : 1,
        zIndex: down ? 10 : 0,
        immediate: (key) => key === "zIndex",
      }
    })

    // Set the currently dragged item
    if (down && !draggedItem) {
      setDraggedItem(itemId)
    } else if (!down && draggedItem) {
      // Check if item was dropped on drop zone
      if (dropZoneRef.current) {
        const dropZoneRect = dropZoneRef.current.getBoundingClientRect()
        const mouseY = y + window.innerHeight / 2 // Approximate mouse position

        if (mouseY < dropZoneRect.bottom && mouseY > dropZoneRect.top) {
          handleItemDrop(itemId)
        }
      }

      setDraggedItem(null)
    }
  })

  // Handle item drop in sequence area
  const handleItemDrop = (itemId: number) => {
    if (!isPlayerTurn || isShowingSequence) return

    playSound("drop")

    // Add item to drop zone
    setDropZoneItems([...dropZoneItems, itemId])

    // Check if the dropped item matches the sequence
    const newPlayerSequence = [...playerSequence, itemId]
    setPlayerSequence(newPlayerSequence)

    // Check if player's sequence matches so far
    const isCorrectSoFar = newPlayerSequence.every((id, index) => id === sequence[index])

    if (!isCorrectSoFar) {
      // Player made a mistake
      handleIncorrectSequence()
      return
    }

    // Check if player completed the sequence
    if (newPlayerSequence.length === sequence.length) {
      handleCorrectSequence()
    }
  }

  // Handle item click (alternative to drag)
  const handleItemClick = (itemId: number) => {
    if (!isPlayerTurn || isShowingSequence || dropZoneItems.length >= sequence.length) return

    playSound("pop")

    // Animate the clicked item
    itemApi.start((i) => {
      if (SEA_ITEMS[i].id !== itemId) return {}

      return {
        scale: [1, 1.2, 1],
        config: { duration: 300 },
      }
    })

    // Add item to player sequence
    handleItemDrop(itemId)
  }

  // Handle correct sequence completion
  const handleCorrectSequence = () => {
    // Update max sequence reached if needed
    if (sequence.length > maxSequenceReached) {
      setMaxSequenceReached(sequence.length)
    }

    // Calculate reaction time
    const reactionTime = levelStartTimeRef.current ? (Date.now() - levelStartTimeRef.current) / 1000 : 0

    // Save level data
    setGameData((prev) => [
      ...prev,
      {
        level,
        sequenceLength: sequence.length,
        correct: true,
        reactionTime,
      },
    ])

    // Play success sound
    playSound("correct")

    // Show success animation
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { x: 0.5, y: 0.6 },
      colors: ["#00bcd4", "#2196f3", "#3f51b5", "#4caf50", "#8bc34a"],
    })

    // Move to next level or complete game
    setTimeout(() => {
      if (level < maxLevel) {
        startNewLevel(level + 1)
      } else {
        completeGame(true)
      }
    }, 1000)
  }

  // Handle incorrect sequence
  const handleIncorrectSequence = () => {
    const newAttempts = attempts + 1
    setAttempts(newAttempts)
    
    // Calculate reaction time
    const reactionTime = levelStartTimeRef.current ? (Date.now() - levelStartTimeRef.current) / 1000 : 0

    // Save level data with the mistake
    setGameData((prev) => [
      ...prev,
      {
        level,
        sequenceLength: sequence.length,
        correct: false,
        reactionTime,
        playerSequenceLength: playerSequence.length + 1,
        attempt: newAttempts,
      },
    ])

    // Play error sound
    playSound("incorrect")

    // Show error animation
    confetti({
      particleCount: 20,
      spread: 50,
      origin: { x: 0.5, y: 0.6 },
      colors: ["#ef4444"],
      gravity: 0.5,
    })

    if (newAttempts >= maxAttempts) {
      // Move to next level after delay
      setTimeout(() => {
        if (level < maxLevel) {
          setAttempts(0)
          startNewLevel(level + 1)
        } else {
          completeGame(false)
        }
      }, 2000)
    } else {
      // Clear the drop zone and player sequence
      setDropZoneItems([])
      setPlayerSequence([])

      // Show the sequence again after a short delay
      setTimeout(() => {
        showSequence(sequence)
      }, 1500)
    }
  }

  // Complete the game and save data
  const completeGame = (success: boolean) => {
    setGameComplete(true)

    // Calculate total game time
    const totalTime = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 0

    // Save game data
    saveGameData("memory-cove", {
      levels: gameData,
      totalTime,
      maxSequenceReached,
      completedAllLevels: success,
    })

    // Play completion sound
    playSound("complete")

    // Trigger celebration confetti
    if (success) {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: ["#00bcd4", "#2196f3", "#3f51b5", "#4caf50", "#8bc34a"],
      })
    }
  }

  // Continue to next game
  const continueToNextGame = () => {
    playSound("click")
    router.push("/games/spell-shore")
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
      {/* Background canvas for bubble animations */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Floating seaweed */}
        <div className="absolute bottom-0 left-10 w-20 h-40 bg-green-600/30 rounded-t-full animate-sway"></div>
        <div
          className="absolute bottom-0 left-40 w-16 h-32 bg-green-500/30 rounded-t-full animate-sway"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-0 right-20 w-24 h-48 bg-green-700/30 rounded-t-full animate-sway"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Coral */}
        <div className="absolute bottom-0 left-1/4 w-32 h-24 bg-pink-500/20 rounded-t-lg animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-40 h-32 bg-orange-500/20 rounded-t-lg animate-pulse"></div>

        {/* Marine life in background */}
        <div className="absolute text-5xl" style={{ left: "10%", top: "20%", animation: "float 15s linear infinite" }}>
          🐬
        </div>
        <div
          className="absolute text-4xl"
          style={{ right: "15%", top: "30%", animation: "float 20s linear 5s infinite reverse" }}
        >
          🐙
        </div>
        <div
          className="absolute text-3xl"
          style={{ left: "20%", bottom: "15%", animation: "float 12s linear 2s infinite" }}
        >
          🐠
        </div>
      </div>

      <Card className="max-w-2xl w-full border-4 border-cyan-300 bg-white/90 backdrop-blur-sm shadow-xl relative z-10">
        {!gameStarted ? (
          <div className="text-center space-y-6 p-6">
            <h1 className="text-3xl font-bold text-blue-800">Memory Cove</h1>
            <div className="relative w-full max-w-md mx-auto aspect-video rounded-lg overflow-hidden shadow-lg mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-300 flex items-center justify-center">
                <img
                  src="/placeholder.svg?height=200&width=400"
                  alt="Memory Cove scene with sea creatures"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Animated sea creatures */}
              <div className="absolute inset-0">
                {SEA_ITEMS.slice(0, 4).map((item, i) => (
                  <div
                    key={i}
                    className="absolute text-3xl"
                    style={{
                      left: `${i * 25 + 5}%`,
                      top: `${Math.random() * 60 + 20}%`,
                      animation: `float ${Math.random() * 5 + 3}s ease-in-out ${Math.random() * 2}s infinite`,
                    }}
                  >
                    {item.emoji}
                  </div>
                ))}
              </div>
            </div>
           <p className="text-lg">
  Welcome to Memory Cove! Watch the sequence of sea creatures, then repeat it in the same order. Each level
  adds one more item to remember!
  <br />
  <span className="block text-sm text-gray-600 italic mt-2">
    This activity assesses <strong>working memory</strong>, a cognitive skill often impacted in individuals with dyslexia.
    Working memory is essential for holding and manipulating information — like remembering a sequence of letters or steps while reading.
    Weaknesses in working memory can make tasks like decoding words, following multi-step instructions, and reading comprehension more difficult.
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
            <h1 className="text-3xl font-bold text-blue-800">Great Memory!</h1>
            <div className="relative w-full max-w-md mx-auto aspect-video rounded-lg overflow-hidden shadow-lg mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-300 flex items-center justify-center">
                <img
                  src="/placeholder.svg?height=200&width=400"
                  alt="Celebration scene with sea creatures"
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
            <p className="text-lg">You remembered sequences of up to {maxSequenceReached} items!</p>
            <div className="w-full bg-blue-100 rounded-full h-4 mb-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-500 h-4 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(maxSequenceReached / (maxLevel + 1)) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={continueToNextGame}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transform hover:scale-105 transition-all"
              >
                Continue to Spell Shore
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-blue-800">Memory Cove</h1>
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {Array.from({ length: maxAttempts }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < maxAttempts - attempts ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-blue-600 font-medium bg-blue-100 px-3 py-1 rounded-full">
                  Level {level} of {maxLevel}
                </div>
              </div>
            </div>

            <Progress value={(level / maxLevel) * 100} className="h-2" />

            <div className="text-center mb-4">
              {isShowingSequence ? (
                <p className="text-lg font-medium text-blue-800 animate-pulse">Watch the sequence...</p>
              ) : isPlayerTurn ? (
                <p className="text-lg font-medium text-blue-800">
                  Your turn! {playerSequence.length > 0 && playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1] 
                    ? "That wasn't correct. Try again!" 
                    : "Repeat the sequence."}
                </p>
              ) : (
                <p className="text-lg font-medium text-blue-800">Get ready...</p>
              )}
            </div>

            {/* Show attempts remaining message */}
            {attempts > 0 && attempts < maxAttempts && (
              <div className="text-center text-amber-600 font-medium animate-bounce">
                {maxAttempts - attempts} {maxAttempts - attempts === 1 ? 'try' : 'tries'} remaining!
              </div>
            )}
            {attempts === maxAttempts && (
              <div className="text-center text-blue-600 font-medium animate-pulse">
                Moving to {level < maxLevel ? 'next level' : 'results'}...
              </div>
            )}

            {/* Drop zone for sequence */}
            <div
              ref={dropZoneRef}
              className="min-h-20 p-4 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300 flex flex-wrap gap-2 mb-4 transition-all"
            >
              {dropZoneItems.length === 0 ? (
                <p className="text-blue-400 w-full text-center">
                  Drag sea creatures here or tap them to form the sequence
                </p>
              ) : (
                dropZoneItems.map((itemId, index) => {
                  const item = SEA_ITEMS.find((i) => i.id === itemId)
                  return (
                    <div
                      key={`dropzone-${index}`}
                      className={`w-16 h-16 ${item?.color} rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-md`}
                    >
                      <span className="text-3xl">{item?.emoji}</span>
                    </div>
                  )
                })
              )}
            </div>

            {/* Sea creatures grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {SEA_ITEMS.map((item, i) => (
                <animated.button
                  key={item.id}
                  {...bindDrag(item.id)}
                  onClick={() => handleItemClick(item.id)}
                  disabled={!isPlayerTurn || isShowingSequence}
                  style={itemProps[i]}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center text-white font-bold relative
                    ${item.color}
                    ${currentHighlight === item.id ? "ring-4 ring-yellow-400 ring-opacity-75 scale-110 shadow-lg shadow-yellow-400/50" : ""}
                    ${isPlayerTurn ? "hover:scale-105 transition-transform cursor-grab active:cursor-grabbing" : "opacity-90"}
                    touch-manipulation
                  `}
                >
                  <animated.div style={currentHighlight === item.id ? sequenceProps : undefined}>
                    <span className="text-4xl">{item.emoji}</span>
                  </animated.div>
                  <span className="absolute bottom-1 text-xs">{item.name}</span>

                  {/* Glow effect when highlighted */}
                  {currentHighlight === item.id && (
                    <div className="absolute inset-0 rounded-lg bg-white/30 animate-pulse"></div>
                  )}

                  {/* Water ripple effect on hover */}
                  <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute inset-0 rounded-full border-2 border-white/30 scale-0 animate-ping"
                        style={{
                          animationDuration: `${1.5 + i * 0.5}s`,
                          animationDelay: `${i * 0.2}s`,
                        }}
                      ></div>
                    ))}
                  </div>
                </animated.button>
              ))}
            </div>

            {/* Sequence progress indicators */}
            <div className="flex justify-center mt-4">
              <div className="flex gap-2">
                {sequence.map((_, index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      index < playerSequence.length
                        ? playerSequence[index] === sequence[index]
                          ? "bg-green-500 scale-110"
                          : "bg-red-500 scale-110"
                        : "bg-gray-300"
                    }`}
                  ></div>
                ))}
              </div>
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
        {isMuted ? <VolumeIcon className="h-5 w-5" /> : <Volume2Icon className="h-5 w-5" />}
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
