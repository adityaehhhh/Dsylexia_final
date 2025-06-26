"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { animated, useSpring } from "@react-spring/web"
import { useSound } from "@/hooks/use-sound"
import { VolumeIcon, Volume2Icon } from "lucide-react"

export default function IntroPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [playerName, setPlayerName] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { playSound } = useSound()

  // Animation for character
  const [characterProps, characterApi] = useSpring(() => ({
    y: 0,
    config: { tension: 100, friction: 10 },
  }))

  // Animation for text bubble
  const [textProps, textApi] = useSpring(() => ({
    opacity: 0,
    y: 20,
    config: { tension: 300, friction: 20 },
  }))

  // Animation for background elements
  const [bgProps, bgApi] = useSpring(() => ({
    scale: 1,
    rotate: 0,
    config: { duration: 10000, loop: true },
  }))

  useEffect(() => {
    // Get player info from localStorage
    const playerInfo = localStorage.getItem("playerInfo")
    if (playerInfo) {
      const { name } = JSON.parse(playerInfo)
      setPlayerName(name)
    }

    // Start background animation
    bgApi.start({ scale: 1.05, rotate: 5, loop: true })

    // Initialize audio
    audioRef.current = new Audio("/sounds/ocean-ambience.mp3")
    if (audioRef.current) {
      audioRef.current.loop = true
      audioRef.current.volume = 0.3
      audioRef.current.play().catch((e) => console.log("Audio autoplay prevented:", e))
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [bgApi])

  useEffect(() => {
    // Animate character and text when step changes
    characterApi.start({ y: -10, immediate: true })
    characterApi.start({ y: 0, delay: 100 })

    textApi.start({ opacity: 0, y: 20, immediate: true })
    textApi.start({ opacity: 1, y: 0, delay: 300 })

    playSound("pop")
  }, [currentStep, characterApi, textApi, playSound])

  const storySteps = [
    {
      text: `Welcome to the magical underwater kingdom, ${playerName || "explorer"}! I'm Ariel, the guardian mermaid of these waters.`,
      image: "/source.gif?height=300&width=400",
      animation: "wave",
    },
    {
      text: "Our ocean is in trouble! The magical letters that help sea creatures communicate have been scattered by a powerful current.",
      image: "/sadariel.gif?height=300&width=400",
      animation: "worried",
    },
    {
      text: "Without these letters, the sea creatures can't read spells to keep our coral reefs healthy and our waters clean!",
      image: "/read.gif?height=300&width=400",
      animation: "point",
    },
    {
      text: "We need your help to collect the letters by completing special challenges in different parts of the ocean.",
      image: "/save.gif?height=300&width=400",
      animation: "excited",
    },
    {
      text: "Are you ready to help save our underwater kingdom? Let's start our adventure in the Bubble Bay!",
      image: "/excited.gif?height=300&width=400",
      animation: "cheer",
    },
  ]

  const handleNext = () => {
    playSound("click")
    if (currentStep < storySteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push("/games/bubble-bay")
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  // Floating bubbles in background
  const bubbles = Array.from({ length: 15 }, (_, i) => {
    const size = Math.random() * 30 + 10
    const left = Math.random() * 100
    const animDuration = Math.random() * 20 + 10
    const delay = Math.random() * 10

    return (
      <div
        key={i}
        className="absolute rounded-full bg-cyan-200/30 backdrop-blur-sm"
        style={{
          width: size + "px",
          height: size + "px",
          left: `${left}%`,
          bottom: "-50px",
          animation: `float ${animDuration}s ease-in-out ${delay}s infinite`,
        }}
      />
    )
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-500 to-blue-900 flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Floating bubbles background */}
      {bubbles}

      {/* Animated background elements */}
      <animated.div
        className="absolute w-64 h-64 bg-cyan-300/10 rounded-full blur-3xl"
        style={{
          ...bgProps,
          top: "20%",
          left: "20%",
        }}
      />
      <animated.div
        className="absolute w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"
        style={{
          ...bgProps,
          bottom: "10%",
          right: "15%",
        }}
      />

      <Card className="max-w-2xl w-full border-4 border-cyan-300 bg-white/90 backdrop-blur-sm shadow-xl relative z-10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-full md:w-1/2 rounded-lg overflow-hidden shadow-lg relative">
              {/* Character animation container */}
              <animated.div style={characterProps} className="relative">
                <img
                  src={storySteps[currentStep].image || "/placeholder.svg"}
                  alt={`Story scene ${currentStep + 1}`}
                  className="w-full h-auto"
                />

                
              </animated.div>
            </div>

            <div className="w-full md:w-1/2 space-y-6">
              <animated.div
                style={textProps}
                className="min-h-[150px] bg-blue-50 rounded-lg p-4 border border-blue-200 relative"
              >
                <p className="text-lg">{storySteps[currentStep].text}</p>
                <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-blue-50 border-l border-b border-blue-200 transform rotate-45"></div>
              </animated.div>

              <Button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105"
              >
                {currentStep < storySteps.length - 1 ? "Continue" : "Start Adventure"}
              </Button>
            </div>
          </div>
        </CardContent>
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

      {/* Page transition animation */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-100vh);
          }
        }
        
        @keyframes wave {
          0%, 100% {
            transform: rotate(-10deg);
          }
          50% {
            transform: rotate(10deg);
          }
        }
      `}</style>
    </div>
  )
}
