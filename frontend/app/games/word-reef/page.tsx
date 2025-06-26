"use client"

import { useRef, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { VolumeIcon as VolumeUp, Volume2Icon } from "lucide-react"
import { saveGameData } from "@/lib/game-data"
import { useSound } from "@/hooks/use-sound"
import { animated, useSpring, useSprings } from "@react-spring/web"
import confetti from "canvas-confetti"

import {UnderwaterBackground } from "@/components/underwater-background"

// Word pairs that are commonly confused by people with dyslexia
const WORD_PAIRS = [
  { target: "was", confusable: "saw" },
  { target: "where", confusable: "were" },
  { target: "then", confusable: "than" },
  { target: "there", confusable: "their" },
  { target: "from", confusable: "form" },
  { target: "quite", confusable: "quiet" },
  { target: "blue", confusable: "bleu" },
  { target: "cloud", confusable: "could" },
  { target: "house", confusable: "horse" },
  { target: "boat", confusable: "boot" },
]

// Marine life for animations
const MARINE_LIFE = [
  { emoji: "🐠", name: "Fish" },
  { emoji: "🐙", name: "Octopus" },
  { emoji: "🐬", name: "Dolphin" },
  { emoji: "🦑", name: "Squid" },
  { emoji: "🐡", name: "Pufferfish" },
  { emoji: "🦐", name: "Shrimp" },
  { emoji: "🦀", name: "Crab" },
  { emoji: "🐚", name: "Shell" },
]

export default function WordReefGame() {
  const router = useRouter()
  const [currentRound, setCurrentRound] = useState(0)
  const [totalRounds] = useState(10)
  const [targetWord, setTargetWord] = useState("")
  const [options, setOptions] = useState<string[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [gameData, setGameData] = useState<any[]>([])
  const [hintsUsed, setHintsUsed] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const startTimeRef = useRef<number | null>(null)
  const roundStartTimeRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const { playSound } = useSound()

  // Animation for options
  const [optionSprings, optionApi] = useSprings(3, (i) => ({
    scale: 1,
    y: 0,
    opacity: 1,
    config: { tension: 300, friction: 20 },
  }))

  // Animation for target word
  const [targetSpring, targetApi] = useSpring(() => ({
    scale: 1,
    glow: 0,
    config: { tension: 200, friction: 15 },
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

      // Create marine life
      const marineLife = MARINE_LIFE.map((life) => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseY: Math.random() * canvas.height,
        amplitude: 0.5,
        
        
        size: 80 + Math.random() * 10,
        speedX: (Math.random() - 0.5) * 10,
        speedY: (Math.random() - 0.5) * 20,
        emoji: life.emoji,
      }))

      // Animation loop
      const animate = () => {
        if (!ctx) return

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Update and draw marine life
        marineLife.forEach((life) => {
          // Update position
          life.x += life.speedX
          life.y = life.baseY + Math.sin(Date.now() * 0.002 + life.x) * life.amplitude


          // Wrap around edges
          if (life.x < -50) life.x = canvas.width + 50
          if (life.x > canvas.width + 50) life.x = -50
          if (life.y < -50) life.y = canvas.height + 50
          if (life.y > canvas.height + 50) life.y = -50

          // Draw marine life
          ctx.save()
          ctx.translate(life.x, life.y)
          ctx.rotate(life.rotation)
          ctx.font = `${life.size}px Arial`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(life.emoji, 0, 0)
          ctx.restore()
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
    setupNewRound()
  }

  // Set up a new round with target word and options
  const setupNewRound = () => {
    // Reset state for new round
    setIsCorrect(null)
    setSelectedOption(null)

    // Select a random word pair
    const randomPairIndex = Math.floor(Math.random() * WORD_PAIRS.length)
    const wordPair = WORD_PAIRS[randomPairIndex]

    setTargetWord(wordPair.target)

    // Create options array with the target and confusable words
    // Plus 1 random other word
    const otherWords = WORD_PAIRS.filter((pair) => pair.target !== wordPair.target).map((pair) => pair.target)

    // Get 1 random other word
    const randomIndex = Math.floor(Math.random() * otherWords.length)
    const randomWord = otherWords[randomIndex]

    // Combine and shuffle options
    const allOptions = [wordPair.target, wordPair.confusable, randomWord]

    // Shuffle options
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5)
    setOptions(shuffledOptions)

    // Animate target word
    targetApi.start({
      from: { scale: 0.8, glow: 0 },
      to: { scale: 1, glow: 1 },
    })

    // Animate options
    optionApi.start((i) => ({
      from: { scale: 0.8, y: 20, opacity: 0 },
      to: { scale: 1, y: 0, opacity: 1 },
      delay: 300 + i * 100,
    }))

    // Record round start time
    roundStartTimeRef.current = Date.now()
  }

  // Handle word selection
  const handleWordSelect = (word: string, index: number) => {
    if (isCorrect !== null) return // Prevent multiple selections

    setSelectedOption(word)

    // Animate selected option
    optionApi.start((i) => {
      if (i === index) {
        return {
          scale: 1.1,
          config: { tension: 300, friction: 10 },
        }
      }
      return {
        scale: 0.95,
        opacity: 0.7,
        config: { tension: 300, friction: 20 },
      }
    })

    const correct = word === targetWord

    // Short delay before showing result
    setTimeout(() => {
      setIsCorrect(correct)

      if (correct) {
        setScore(score + 1)
        playSound("correct")

        // Trigger confetti for correct answer
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.5, y: 0.6 },
          colors: ["#00bcd4", "#2196f3", "#3f51b5", "#4caf50", "#8bc34a"],
        })
      } else {
        playSound("incorrect")
      }

      // Calculate reaction time
      const reactionTime = roundStartTimeRef.current ? (Date.now() - roundStartTimeRef.current) / 1000 : 0

      // Save round data
      setGameData((prev) => [
        ...prev,
        {
          round: currentRound + 1,
          targetWord,
          selectedWord: word,
          correct,
          reactionTime,
          hintsUsed,
        },
      ])

      // Move to next round after a delay
      setTimeout(() => {
        if (currentRound < totalRounds - 1) {
          setCurrentRound(currentRound + 1)
          setupNewRound()
        } else {
          completeGame()
        }
      }, 1500)
    }, 500)
  }

  // Play hint sound
  const playHint = () => {
    setHintsUsed(hintsUsed + 1)
    playSound("pop")

    // Animate target word when hint is played
    targetApi.start({
      scale: [1, 1.2, 1],
      glow: [1, 2, 1],
      config: { tension: 300, friction: 10 },
    })

    // In a real implementation, this would play the sound of the word
    if (typeof window !== "undefined") {
      const utterance = new SpeechSynthesisUtterance(targetWord)
      window.speechSynthesis.speak(utterance)
    }
  }

  // Complete the game and save data
  const completeGame = () => {
    setGameComplete(true)

    // Calculate total game time
    const totalTime = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 0

    // Calculate accuracy
    const accuracy = (score / totalRounds) * 100

    // Save game data
    saveGameData("word-reef", {
      rounds: gameData,
      totalTime,
      accuracy,
      score,
      totalHintsUsed: hintsUsed,
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
    router.push("/games/memory-cove")
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
      {/* Background canvas for marine life animations */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Coral reef */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-orange-500/20 to-transparent"></div>
        <div className="absolute bottom-0 left-1/5 w-20 h-24 bg-pink-500/30 rounded-t-lg"></div>
        <div className="absolute bottom-0 right-1/4 w-32 h-40 bg-purple-500/20 rounded-t-lg"></div>

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

        {/* Random bubbles */}
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

      <Card className="max-w-2xl w-full border-4 border-cyan-300 bg-white/90 backdrop-blur-sm shadow-xl relative z-10">
        {!gameStarted ? (
          <div className="text-center space-y-6 p-6">
            <h1 className="text-3xl font-bold text-blue-800">Word Reef</h1>
            <div className="relative w-full max-w-md mx-auto aspect-video rounded-lg overflow-hidden shadow-lg mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-300 flex items-center justify-center">
                <img
                  src="/placeholder.svg?height=200&width=400"
                  alt="Word Reef scene with coral and fish"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Animated marine life */}
              <div className="absolute inset-0">
                <div
                  className="absolute text-4xl"
                  style={{ left: "20%", top: "30%", animation: "float 8s ease-in-out infinite" }}
                >
                  🐠
                </div>
                <div
                  className="absolute text-4xl"
                  style={{ left: "70%", top: "60%", animation: "float 7s ease-in-out 1s infinite" }}
                >
                  🐙
                </div>
                <div
                  className="absolute text-3xl"
                  style={{ left: "50%", top: "20%", animation: "float 9s ease-in-out 2s infinite" }}
                >
                  🦑
                </div>
                <div
                  className="absolute text-3xl"
                  style={{ left: "30%", top: "70%", animation: "float 6s ease-in-out 3s infinite" }}
                >
                  🐡
                </div>
              </div>
            </div>
            <p className="text-black text-lg">
  Welcome to the Word Reef! Find the correct word among similar-looking words. You can click the sound
  button for a hint if you need help.
  <br />
  <span className="block text-sm text-gray-600 italic mt-2">
    This activity targets <strong>visual discrimination</strong> and <strong>phonological decoding</strong>,
    both of which are commonly challenging for individuals with dyslexia.
    It helps assess a child's ability to distinguish between similarly spelled words and connect sounds to the correct written form —
    a critical skill for accurate word recognition and reading fluency.
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
                  alt="Celebration scene with marine life"
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
              You found {score} out of {totalRounds} words in the Word Reef!
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
                Continue to Memory Cove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-blue-800">Word Reef</h1>
              <div className="text-sm text-blue-600 font-medium bg-blue-100 px-3 py-1 rounded-full">
                Round {currentRound + 1} of {totalRounds}
              </div>
            </div>

            <Progress value={(currentRound / totalRounds) * 100} className="h-2" />

            <div className="text-center space-y-4">
              <p className="text-black">Find the correct word:</p>

              <div className="flex justify-center items-center space-x-2">
                {/* <animated.span
                  style={{
                    scale: targetSpring.scale,
                    boxShadow: targetSpring.glow.to((v) => `0 0 ${v * 10}px ${v * 5}px rgba(0, 150, 255, ${v * 0.3})`),
                  }}
                  className="text-2xl font-bold text-blue-800 bg-blue-100 px-4 py-2 rounded-lg inline-block"
                >
                  {targetWord}
                </animated.span> */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={playHint}
                  className="rounded-full border-2 border-blue-400 hover:bg-blue-100 transition-all"
                >
                  <VolumeUp className="h-6 w-6 text-blue-600" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {options.map((word, index) => (
                <animated.button
                  key={index}
                  onClick={() => handleWordSelect(word, index)}
                  disabled={isCorrect !== null}
                  style={{
                    scale: optionSprings[index].scale,
                    y: optionSprings[index].y,
                    opacity: optionSprings[index].opacity,
                  }}
                  className={`
                    py-4 px-6 rounded-lg text-xl font-medium relative overflow-hidden
                    ${
                      isCorrect === null
                        ? "bg-gradient-to-r from-blue-400 to-cyan-300 hover:from-blue-500 hover:to-cyan-400 shadow-lg transform hover:scale-105 transition-all"
                        : word === targetWord
                          ? "bg-gradient-to-r from-green-400 to-green-500"
                          : isCorrect === false && word === selectedOption
                            ? "bg-gradient-to-r from-red-400 to-red-500"
                            : "bg-gradient-to-r from-blue-400 to-cyan-300 opacity-70"
                    }
                  `}
                >
                  {/* Bubble effect on hover */}
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute rounded-full bg-white/20 animate-bubble"
                        style={{
                          width: `${Math.random() * 20 + 10}px`,
                          height: `${Math.random() * 20 + 10}px`,
                          left: `${Math.random() * 100}%`,
                          bottom: `-50px`,
                          animationDuration: `${Math.random() * 5 + 5}s`,
                          animationDelay: `${Math.random() * 5}s`,
                          opacity: 0,
                        }}
                      />
                    ))}
                  </div>

                  {word}

                  {/* Show correct/incorrect indicator */}
                  {isCorrect !== null && word === targetWord && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xl">✓</div>
                  )}
                  {isCorrect === false && word === selectedOption && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xl">✗</div>
                  )}
                </animated.button>
              ))}
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
    </div>
  )
}
