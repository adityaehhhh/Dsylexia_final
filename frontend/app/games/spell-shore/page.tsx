"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { saveGameData } from "@/lib/game-data"
import { WORD_SETS_BY_AGE, getAgeGroup } from "./word-sets"

import {UnderwaterBackground } from "@/components/underwater-background"

export default function SpellShoreGame() {
  const router = useRouter()
  const [currentRound, setCurrentRound] = useState(0)
  const [totalRounds, setTotalRounds] = useState(10)
  const [correctWord, setCorrectWord] = useState("")
  const [options, setOptions] = useState<string[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [gameData, setGameData] = useState<any[]>([])
  const [playerAge, setPlayerAge] = useState<number>(0)
  const [currentAgeGroup, setCurrentAgeGroup] = useState<string>("")
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [hasTriedEasierLevel, setHasTriedEasierLevel] = useState(false)
  const [shouldSwitchLevel, setShouldSwitchLevel] = useState(false)

  const startTimeRef = useRef<number | null>(null)
  const roundStartTimeRef = useRef<number | null>(null)

  useEffect(() => {
    const playerInfo = localStorage.getItem("playerInfo")
    if (playerInfo) {
      const { age } = JSON.parse(playerInfo)
      setPlayerAge(age)
      setCurrentAgeGroup(getAgeGroup(age))
    }
  }, [])

  useEffect(() => {
    if (failedAttempts >= 3 && currentRound < 5 && !hasTriedEasierLevel && currentAgeGroup !== "4-7") {
      setTotalRounds(5)
      setShouldSwitchLevel(true)
    }
  }, [failedAttempts, currentRound, hasTriedEasierLevel, currentAgeGroup])

  // Start the game
  const startGame = () => {
    setGameStarted(true)
    startTimeRef.current = Date.now()
    setupNewRound()
  }

  // Set up a new round with correct word and options
  const setupNewRound = () => {
    // Reset state for new round
    setIsCorrect(null)

    // Get random word set
    const usedWords = gameData.map((data) => data.correctWord)
    const currentWordSets = WORD_SETS_BY_AGE[currentAgeGroup]
    const availableWordSets = currentWordSets.filter((set) => !usedWords.includes(set.correct))

    // If we've used all words, just pick randomly
    const wordSets = availableWordSets.length > 0 ? availableWordSets : currentWordSets

    const randomIndex = Math.floor(Math.random() * wordSets.length)
    const wordSet = wordSets[randomIndex]

    setCorrectWord(wordSet.correct)

    // Create options array with correct word and 2 incorrect spellings
    const incorrectOptions = [...wordSet.incorrect].sort(() => Math.random() - 0.5).slice(0, 2)

    const allOptions = [wordSet.correct, ...incorrectOptions]

    // Shuffle options
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5)
    setOptions(shuffledOptions)

    // Record round start time
    roundStartTimeRef.current = Date.now()
  }

  const switchToEasierLevel = () => {
    const newAgeGroup = currentAgeGroup === "12-16" ? "8-11" : "4-7"
    setCurrentAgeGroup(newAgeGroup)
    setHasTriedEasierLevel(true)
    setFailedAttempts(0)
    setCurrentRound(0)
    setScore(0)
    setGameData([])
    setTotalRounds(5)
    setupNewRound()
  }

  // Handle word selection
  const handleWordSelect = (word: string) => {
    if (isCorrect !== null) return // Prevent multiple selections

    const correct = word === correctWord
    setIsCorrect(correct)

    if (!correct) {
      setFailedAttempts((prev) => prev + 1)
    }

    if (correct) {
      setScore(score + 1)
    }

    // Calculate reaction time
    const reactionTime = roundStartTimeRef.current ? (Date.now() - roundStartTimeRef.current) / 1000 : 0

    // Save round data
    setGameData((prev) => [
      ...prev,
      {
        round: currentRound + 1,
        correctWord,
        selectedWord: word,
        correct,
        reactionTime,
        ageGroup: currentAgeGroup,
      },
    ])

    // Move to next round after a short delay
    setTimeout(() => {
      if (currentRound === 4 && shouldSwitchLevel) {
        switchToEasierLevel()
      } else if (currentRound < totalRounds - 1) {
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
    saveGameData("spell-shore", {
      rounds: gameData,
      totalTime,
      accuracy,
      score,
    })
  }

  // Continue to next game
  const continueToNextGame = () => {
    router.push("/games/sentence-sea")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-500 to-blue-900 flex flex-col items-center justify-center p-4">
      <UnderwaterBackground/>
      <Card className="max-w-2xl w-full border-4 border-cyan-300 bg-white/90 backdrop-blur-sm shadow-xl p-6">
        {!gameStarted ? (
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold text-blue-800">Spell Shore</h1>
            <p className="text-black">
  Welcome to Spell Shore! Choose the correctly spelled word from the options. Watch out for tricky
  spellings!
  <br />
  <span className="block text-sm text-gray-600 italic mt-2">
    This activity assesses <strong>orthographic processing</strong> — the ability to recognize correct spelling patterns and store word forms in memory.
    Individuals with dyslexia often have difficulty identifying familiar spelling structures and distinguishing similar-looking words.
    Strong orthographic skills are essential for fluent reading and accurate writing.
  </span>
</p>

            <div className="flex justify-center">
              <Button
                onClick={startGame}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
              >
                Start Game
              </Button>
            </div>
          </div>
        ) : gameComplete ? (
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold text-blue-800">Great Spelling!</h1>
            <p className="text-lg">
              You found {score} out of {totalRounds} correctly spelled words!
            </p>
            <div className="w-full bg-blue-100 rounded-full h-4 mb-4">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-500 h-4 rounded-full"
                style={{ width: `${(score / totalRounds) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={continueToNextGame}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
              >
                Continue to Sentence Sea
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-blue-800">Spell Shore</h1>
              <div className="text-sm text-blue-600">
                Round {currentRound + 1} of {totalRounds}
              </div>
            </div>

            <Progress value={(currentRound / totalRounds) * 100} className="h-2" />

            <div className="text-center space-y-4">
              <p className="text-black">Which word is spelled correctly?</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {options.map((word, index) => (
                <button
                  key={index}
                  onClick={() => handleWordSelect(word)}
                  disabled={isCorrect !== null}
                  className={`
                    py-4 px-6 rounded-lg text-xl font-medium
                    ${
                      isCorrect === null
                        ? "bg-gradient-to-r from-blue-400 to-cyan-300 hover:from-blue-500 hover:to-cyan-400 shadow-lg transform hover:scale-105 transition-all"
                        : word === correctWord
                          ? "bg-gradient-to-r from-green-400 to-green-500"
                          : isCorrect === false && word !== correctWord
                            ? "bg-gradient-to-r from-red-400 to-red-500"
                            : "bg-gradient-to-r from-blue-400 to-cyan-300 opacity-70"
                    }
                  `}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
