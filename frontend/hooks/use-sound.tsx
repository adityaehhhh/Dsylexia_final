"use client"

import { useCallback, useEffect, useRef } from "react"

// Sound effects mapping
const SOUNDS = {
  click: "/sounds/click.mp3",
  pop: "/sounds/pop.mp3",
  correct: "/sounds/correct.mp3",
  incorrect: "/sounds/incorrect.mp3",
  complete: "/sounds/complete.mp3",
  drop: "/sounds/drop.mp3",
  ready: "/sounds/ready.mp3",
}

type SoundType = keyof typeof SOUNDS

export function useSound() {
  const soundsRef = useRef<Record<SoundType, HTMLAudioElement | null>>({
    click: null,
    pop: null,
    correct: null,
    incorrect: null,
    complete: null,
    drop: null,
    ready: null,
  })

  // Initialize sounds
  useEffect(() => {
    // Preload sounds
    Object.entries(SOUNDS).forEach(([key, url]) => {
      const audio = new Audio(url)
      audio.preload = "auto"
      soundsRef.current[key as SoundType] = audio
    })

    // Cleanup
    return () => {
      Object.values(soundsRef.current).forEach((audio) => {
        if (audio) {
          audio.pause()
          audio.src = ""
        }
      })
    }
  }, [])

  // Play sound function
  const playSound = useCallback((type: SoundType) => {
    const sound = soundsRef.current[type]
    if (sound) {
      // Reset and play
      sound.currentTime = 0
      sound.play().catch((e) => console.log("Sound play prevented:", e))
    }
  }, [])

  return { playSound }
}
