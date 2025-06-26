"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { saveGameData } from "@/lib/game-data"
import { UnderwaterBackground } from "@/components/underwater-background"
import { SENTENCES_BY_AGE, getAgeGroup, getLowerAgeGroup } from "./sentence-sets"

export default function SentenceSeaGame() {
  const router = useRouter()
  const [currentRound, setCurrentRound] = useState(0)
  const [totalRounds] = useState(5)
  const [correctSentence, setCorrectSentence] = useState<string[]>([])
  const [scrambledWords, setScrambledWords] = useState<string[]>([])
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [availableWords, setAvailableWords] = useState<string[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [gameData, setGameData] = useState<any[]>([])
  const [hint, setHint] = useState("")
  const [hintsUsed, setHintsUsed] = useState(0)
  const [playerAge, setPlayerAge] = useState<number>(0)
  const [currentAgeGroup, setCurrentAgeGroup] = useState<string>("")
  const [wrongAnswers, setWrongAnswers] = useState(0)
  const [needsEasierQuestions, setNeedsEasierQuestions] = useState(false)
  const [hasTriedEasierLevel, setHasTriedEasierLevel] = useState(false)

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

  // Start the game
  const startGame = () => {
    setGameStarted(true)
    startTimeRef.current = Date.now()
    setupNewRound()
  }

  // Set up a new round with sentence
  const setupNewRound = () => {
    // Reset state for new round
    setIsCorrect(null)
    setSelectedWords([])

    const currentSentences = SENTENCES_BY_AGE[currentAgeGroup]
    const usedSentences = gameData.map((data) => data.sentence.join(" "))
    const availableSentences = currentSentences.filter(
      (sentence) => !usedSentences.includes(sentence.correct.join(" "))
    )

    // If we've used all sentences, just pick randomly
    const sentences = availableSentences.length > 0 ? availableSentences : currentSentences

    const randomIndex = Math.floor(Math.random() * sentences.length)
    const sentence = sentences[randomIndex]

    setCorrectSentence(sentence.correct)
    setHint(sentence.hint)

    // Scramble the words
    const scrambled = [...sentence.correct].sort(() => Math.random() - 0.5)
    setScrambledWords(scrambled)
    setAvailableWords(scrambled)

    // Record round start time
    roundStartTimeRef.current = Date.now()
  }

  // Handle word selection
  const handleWordSelect = (word: string, isAvailable: boolean) => {
    if (isCorrect !== null) return // Prevent selections after round is complete

    if (isAvailable) {
      // Add word to selected words
      setSelectedWords([...selectedWords, word])
      setAvailableWords(availableWords.filter((w) => w !== word))
    } else {
      // Remove word from selected words
      setSelectedWords(selectedWords.filter((w) => w !== word))
      setAvailableWords([...availableWords, word])
    }
  }

  // Check sentence
  const checkSentence = () => {
    const correct = selectedWords.join(" ") === correctSentence.join(" ")
    setIsCorrect(correct)

    if (!correct) {
      setWrongAnswers((prev) => prev + 1)
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
        sentence: correctSentence,
        playerSentence: selectedWords,
        correct,
        reactionTime,
        hintsUsed,
      },
    ])

    // Move to next round after a short delay
    setTimeout(() => {
      if (currentRound === totalRounds - 1) {
        if (wrongAnswers >= Math.floor(totalRounds / 2) && !hasTriedEasierLevel) {
          const easierGroup = getLowerAgeGroup(currentAgeGroup)
          if (easierGroup) {
            setCurrentAgeGroup(easierGroup)
            setHasTriedEasierLevel(true)
            setWrongAnswers(0)
            setCurrentRound(0)
            setScore(0)
            setGameData([])
            setupNewRound()
          } else {
            completeGame()
          }
        } else {
          completeGame()
        }
      } else {
        setCurrentRound(currentRound + 1)
        setupNewRound()
      }
    }, 2000)
  }

  // Show hint
  const showHint = () => {
    setHintsUsed(hintsUsed + 1)
  }

  // Complete the game and save data
  const completeGame = () => {
    setGameComplete(true)

    // Calculate total game time
    const totalTime = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 0

    // Calculate accuracy
    const accuracy = (score / totalRounds) * 100

    // Save game data
    saveGameData("sentence-sea", {
      rounds: gameData,
      totalTime,
      accuracy,
      score,
      totalHintsUsed: hintsUsed,
    })
  }

  // Continue to results
  const continueToResults = () => {
    router.push("/results")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-500 to-blue-900 flex flex-col items-center justify-center p-4">
      <UnderwaterBackground />
      <Card className="max-w-2xl w-full border-4 border-cyan-300 bg-white/90 backdrop-blur-sm shadow-xl p-6">
        {!gameStarted ? (
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold text-blue-800">Sentence Sea</h1>
            <p className="text-black">
  Welcome to Sentence Sea! Arrange the words to form a correct sentence. You can use the hint button if you
  need help.
  <br />
  <span className="block text-sm text-gray-600 italic mt-2">
    This activity assesses <strong>syntax awareness</strong> and <strong>oral language comprehension</strong>,
    which are often affected in individuals with dyslexia. Understanding sentence structure helps with both reading fluency and comprehension.
    Difficulties in recognizing correct word order can signal underlying language processing challenges commonly seen in dyslexia.
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
            <h1 className="text-3xl font-bold text-blue-800">Great Job!</h1>
            <p className="text-lg">
              You arranged {score} out of {totalRounds} sentences correctly!
            </p>
            <div className="w-full bg-blue-100 rounded-full h-4 mb-4">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-500 h-4 rounded-full"
                style={{ width: `${(score / totalRounds) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={continueToResults}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
              >
                See Your Results
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-blue-800">Sentence Sea</h1>
              <div className="text-sm text-blue-600">
                Round {currentRound + 1} of {totalRounds}
              </div>
            </div>

            <Progress value={(currentRound / totalRounds) * 100} className="h-2" />

            <div className="text-center space-y-2">
              <p className="text-black">Arrange the words to form a correct sentence:</p>

              {hintsUsed > 0 && <p className="text-sm text-blue-600 italic">Hint: {hint}</p>}
            </div>

            {/* Selected words area */}
            <div className="min-h-20 p-4 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300 flex flex-wrap gap-2">
              {selectedWords.length === 0 ? (
                <p className="text-blue-400 w-full text-center">Drag words here to form a sentence</p>
              ) : (
                selectedWords.map((word, index) => (
                  <button
                    key={`selected-${index}`}
                    onClick={() => handleWordSelect(word, false)}
                    className="py-1 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    {word}
                  </button>
                ))
              )}
            </div>

            {/* Available words area */}
            <div className="p-4 bg-gray-50 rounded-lg flex flex-wrap gap-2">
              {availableWords.map((word, index) => (
                <button
                  key={`available-${index}`}
                  onClick={() => handleWordSelect(word, true)}
                  className="py-1 px-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  {word}
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={showHint}
                disabled={hintsUsed > 0}
                className="border-blue-400 text-blue-600"
              >
                Show Hint
              </Button>

              <Button
                onClick={checkSentence}
                disabled={selectedWords.length !== correctSentence.length || isCorrect !== null}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
              >
                Check Sentence
              </Button>
            </div>

            {isCorrect !== null && (
              <div
                className={`p-3 rounded-md text-center ${isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
              >
                {isCorrect ? (
                  <p>Correct! Great job!</p>
                ) : (
                  <div>
                    <p>Not quite right. The correct sentence is:</p>
                    <p className="font-medium mt-1">{correctSentence.join(" ")}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
