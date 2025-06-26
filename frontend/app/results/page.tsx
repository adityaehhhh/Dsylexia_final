"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAllGameData } from "@/lib/game-data";
import { Dialog } from "@headlessui/react";

const WaveLoader = () => (
  <div className="flex flex-col items-center p-4">
    <div className="relative w-16 h-16">
      <div className="absolute w-16 h-16 border-4 border-blue-300 rounded-full animate-[wave_2s_ease-in-out_infinite]"></div>
      <div className="absolute w-16 h-16 border-4 border-blue-400 rounded-full animate-[wave_2s_ease-in-out_0.5s_infinite]"></div>
      <div className="absolute w-16 h-16 border-4 border-blue-500 rounded-full animate-[wave_2s_ease-in-out_1s_infinite]"></div>
      <style jsx>{`
        @keyframes wave {
          0% { transform: scale(0.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </div>
    <p className="mt-4 text-blue-600 animate-bounce">Analyzing your ocean adventure...</p>
  </div>
);

export default function ResultsPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [playerAge, setPlayerAge] = useState(0);
  const [gameResults, setGameResults] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [overallScore, setOverallScore] = useState(0);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [prediction, setPrediction] = useState<{
  prediction: string;
  confidence: number;
} | null>(null);
const [predictionLoading, setPredictionLoading] = useState(false);
const [predictionError, setPredictionError] = useState<string | null>(null);
const [showModal, setShowModal] = useState(true);


//error
  const getDyslexiaPrediction = async (resultData: any) => {
    setPredictionLoading(true);
    setPredictionError(null);

    const loadingElement = document.createElement('div');
    loadingElement.id = 'prediction-loader';
    document.body.appendChild(loadingElement);

    const dataToSend = {
      ...resultData,
      "sentencesea_hints": 0,
    };
    
    try {
      const response = await fetch(
        `${
         "https://dsylexia-final.onrender.com/predict"
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        }
      );


      if (!response.ok) {
        throw new Error("Failed to get prediction");
      }

      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error("Prediction error:", error);
      setPredictionError("Failed to get dyslexia assessment. Please try again.");
    } finally {
      setPredictionLoading(false);
      const loader = document.getElementById('prediction-loader');
      if (loader) {
        loader.remove();
      }
    }
  };

  const saveResults = async () => {
    if (!gameResults || Object.keys(gameResults).length === 0) {
      console.error("No game results to save");
      return;
    }

    setSaveStatus("saving");

    try {
      const resultData = {
        name: playerName,
        age: playerAge,
        bubblebay_accuracy: gameResults["bubble-bay"]?.accuracy || 0,
        bubblebay_time: gameResults["bubble-bay"]?.totalTime || 0,
        bubblebay_score: gameResults["bubble-bay"]?.score || 0,
        wordreef_accuracy: gameResults["word-reef"]?.accuracy || 0,
        wordreef_time: gameResults["word-reef"]?.totalTime || 0,
        wordreef_score: gameResults["word-reef"]?.score || 0,
        wordreef_totalHintsUsed: gameResults["word-reef"]?.totalHintsUsed || 0,
        memorycove_maxSequenceReached:
          gameResults["memory-cove"]?.maxSequenceReached || 0,
        memorycove_completedAllLevels:
          gameResults["memory-cove"]?.completedAllLevels ?1 : 0,
        memorycove_accuracy: gameResults["memory-cove"]?.accuracy || 0,
        memorycove_time: gameResults["memory-cove"]?.totalTime || 0,
        spellshore_accuracy: gameResults["spell-shore"]?.accuracy || 0,
        spellshore_time: gameResults["spell-shore"]?.totalTime || 0,
        spellshore_score: gameResults["spell-shore"]?.score || 0,
        spellshore_fallback_accuracy: gameResults["spell-shore"]?.accuracy || 0,
        spellshore_fallback_time: gameResults["spell-shore"]?.totalTime || 0,
        sentencesea_accuracy: gameResults["sentence-sea"]?.accuracy || 0,
        sentencesea_time: gameResults["sentence-sea"]?.totalTime || 0,
        sentencesea_score: gameResults["sentence-sea"]?.score || 0,
        sentencesea_totalHintsUsed:
          gameResults["sentence-sea"]?.totalHintsUsed || 0,
        sentencesea_fallback_accuracy:
          gameResults["sentence-sea"]?.accuracy || 0,
        sentencesea_fallback_time: gameResults["sentence-sea"]?.totalTime || 0,
        total_game_time:
          (gameResults["bubble-bay"]?.totalTime || 0) +
          (gameResults["word-reef"]?.totalTime || 0) +
          (gameResults["memory-cove"]?.totalTime || 0) +
          (gameResults["spell-shore"]?.totalTime || 0) +
          (gameResults["sentence-sea"]?.totalTime || 0),
        total_hints:
          (gameResults["word-reef"]?.totalHintsUsed || 0) +
          (gameResults["sentence-sea"]?.totalHintsUsed || 0),
      };

      console.log("Saving game results:", resultData);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "https://dyslexia-game.onrender.com"
        }/api/finalResult`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(resultData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save results");
      }

      await getDyslexiaPrediction(resultData);

      setSaveStatus("success");
    } catch (error) {
      console.error("Error saving results:", error);
      setSaveStatus("error");
    }
  };

  useEffect(() => {
    // Get player info from localStorage
    const playerInfo = localStorage.getItem("playerInfo");
    if (playerInfo) {
      try {
        const { name, age } = JSON.parse(playerInfo);
        setPlayerName(name);
        setPlayerAge(age);
      } catch (e) {
        console.error("Error parsing player info:", e);
      }
    }

    // Get all game data
    const results = getAllGameData();
    console.log("Loaded game results:", results);
    setGameResults(results);

    // Calculate overall score
    let totalScore = 0;
    let totalPossible = 0;

    if (results["bubble-bay"]) {
      totalScore += results["bubble-bay"].score;
      totalPossible += 10;
    }

    if (results["word-reef"]) {
      totalScore += results["word-reef"].score;
      totalPossible += 10;
    }

    if (results["memory-cove"]) {
      totalScore += results["memory-cove"].maxSequenceReached;
      totalPossible += 7;
    }

    if (results["spell-shore"]) {
      totalScore += results["spell-shore"].score;
      totalPossible += 10;
    }

    if (results["sentence-sea"]) {
      totalScore += results["sentence-sea"].score;
      totalPossible += 5;
    }

    const calculatedScore = Math.round((totalScore / totalPossible) * 100);
    setOverallScore(calculatedScore);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && Object.keys(gameResults).length > 0) {
      saveResults();
    }
  }, [loading, gameResults]);

  const getSkillAssessment = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 60) return "Developing";
    return "Needs Practice";
  };

  const getRecommendations = (gameId: string, score: number) => {
    const recommendations = {
      "bubble-bay": {
        low: "Practice letter recognition with flashcards or letter games.",
        medium: "Continue practicing similar-looking letters like b/d and p/q.",
        high: "Great job! Keep reading to reinforce letter recognition.",
      },
      "word-reef": {
        low: "Practice reading simple words aloud and identifying them.",
        medium: "Read short stories and identify sight words.",
        high: "Challenge yourself with more complex words and reading materials.",
      },
      "memory-cove": {
        low: "Practice remembering short sequences of items in daily activities.",
        medium: "Play memory games that gradually increase in difficulty.",
        high: "Challenge your memory with longer sequences and patterns.",
      },
      "spell-shore": {
        low: "Practice spelling common words using letter tiles or writing.",
        medium: "Focus on words with similar spelling patterns.",
        high: "Challenge yourself with more complex spelling patterns.",
      },
      "sentence-sea": {
        low: "Practice arranging simple sentences with word cards.",
        medium: "Read sentences aloud and identify the correct word order.",
        high: "Try writing your own sentences and stories.",
      },
    };

    if (score < 60)
      return recommendations[gameId as keyof typeof recommendations].low;
    if (score < 80)
      return recommendations[gameId as keyof typeof recommendations].medium;
    return recommendations[gameId as keyof typeof recommendations].high;
  };

  const getScoreForGame = (gameId: string) => {
    if (!gameResults[gameId]) return 0;

    switch (gameId) {
      case "bubble-bay":
      case "word-reef":
      case "spell-shore":
        return (gameResults[gameId].score / 10) * 100;
      case "memory-cove":
        return (gameResults[gameId].maxSequenceReached / 7) * 100;
      case "sentence-sea":
        return (gameResults[gameId].score / 5) * 100;
      default:
        return 0;
    }
  };

  const restartGame = () => {
    localStorage.removeItem("gameData");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-500 to-blue-900 flex flex-col items-center justify-center p-4">
        <Card className="max-w-3xl w-full border-4 border-cyan-300 bg-white/90 backdrop-blur-sm shadow-xl">
          <CardContent className="p-8 flex justify-center">
            <p className="text-xl">Loading your results...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-500 to-blue-900 flex flex-col items-center justify-center p-4">
      {/* Modal for server notice */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} className="fixed z-50 inset-0 flex items-center justify-center">
        <div className="fixed inset-0 bg-black bg-opacity-40" aria-hidden="true" />
        <div className="relative bg-white rounded-lg shadow-xl max-w-md mx-auto p-6 z-50">
          <Dialog.Title className="text-lg font-bold mb-2 text-blue-800">
            Please Note
          </Dialog.Title>
          <Dialog.Description className="mb-4 text-gray-700">
            Please note that our machine learning model is hosted on a free tier server (Render). Due to this, the server may go into sleep mode after a period of inactivity. When a new request is made, the server takes some time to restart, which may result in a noticeable delay in receiving your result.
            <br /><br />
            We appreciate your patience and understanding!
          </Dialog.Description>
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setShowModal(false)}
              autoFocus
            >
              OK
            </button>
          </div>
        </div>
      </Dialog>
      {/* End Modal */}
      <Card className="max-w-3xl w-full border-4 border-cyan-300 bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-800">
            Ocean Adventure Results
          </CardTitle>
          <CardDescription className="text-xl">
            Great job, {playerName}! You've completed all the challenges!
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 p-6">
          {saveStatus === "success" && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              Results saved successfully!
            </div>
          )}
          {saveStatus === "error" && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              Failed to save results. Please try again.
            </div>
          )}

          <div className="bg-white p-4 rounded-lg border-2 border-blue-200 shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-4 text-blue-800">
            Dyslexia Assessment
          </h2>
    
          {predictionLoading && (
            <div className="flex justify-center items-center">
              <WaveLoader />
            </div>
          )}

          {predictionError && (
            <div className="text-red-600 text-center mb-4">
              {predictionError}
            </div>
          )}

          {prediction && (
            <div className="space-y-3 text-center">
              <div className="text-xl font-semibold">
                Result: {" "}
                <span className={
                  prediction.prediction === "Dyslexic" 
                    ? "text-red-600" 
                    : "text-green-600"
                }>
                  {prediction.prediction}
                </span>
              </div>
              <div className="text-lg">
                Confidence Level: {prediction.confidence}%
              </div>
              <Progress 
                value={prediction.confidence} 
                className="h-2 w-1/2 mx-auto"
              />
              
            </div>
          )}
  </div>


          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Overall Performance</h2>
            <div className="w-full bg-blue-100 rounded-full h-6 mb-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-500 h-6 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ width: `${overallScore}%` }}
              >
                {overallScore}%
              </div>
            </div>
            <p className="text-lg font-medium">
              Overall Assessment:{" "}
              <span className="text-blue-700">
                {getSkillAssessment(overallScore)}
              </span>
            </p>
          </div>

          <div className="grid gap-6">
            <h2 className="text-xl font-bold">Game Performance</h2>

            {/* Bubble Bay */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <h3 className="font-medium">Bubble Bay (Letter Recognition)</h3>
                <span>{getScoreForGame("bubble-bay")}%</span>
              </div>
              <Progress value={getScoreForGame("bubble-bay")} className="h-2" />
              <p className="text-sm text-gray-600">
                {getRecommendations(
                  "bubble-bay",
                  getScoreForGame("bubble-bay")
                )}
              </p>
            </div>

            {/* Word Reef */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <h3 className="font-medium">Word Reef (Word Recognition)</h3>
                <span>{getScoreForGame("word-reef")}%</span>
              </div>
              <Progress value={getScoreForGame("word-reef")} className="h-2" />
              <p className="text-sm text-gray-600">
                {getRecommendations("word-reef", getScoreForGame("word-reef"))}
              </p>
            </div>

            {/* Memory Cove */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <h3 className="font-medium">Memory Cove (Working Memory)</h3>
                <span>{getScoreForGame("memory-cove")}%</span>
              </div>
              <Progress
                value={getScoreForGame("memory-cove")}
                className="h-2"
              />
              <p className="text-sm text-gray-600">
                {getRecommendations(
                  "memory-cove",
                  getScoreForGame("memory-cove")
                )}
              </p>
            </div>

            {/* Spell Shore */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <h3 className="font-medium">Spell Shore (Spelling)</h3>
                <span>{getScoreForGame("spell-shore")}%</span>
              </div>
              <Progress
                value={getScoreForGame("spell-shore")}
                className="h-2"
              />
              <p className="text-sm text-gray-600">
                {getRecommendations(
                  "spell-shore",
                  getScoreForGame("spell-shore")
                )}
              </p>
            </div>

            {/* Sentence Sea */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <h3 className="font-medium">
                  Sentence Sea (Sentence Structure)
                </h3>
                <span>{getScoreForGame("sentence-sea")}%</span>
              </div>
              <Progress
                value={getScoreForGame("sentence-sea")}
                className="h-2"
              />
              <p className="text-sm text-gray-600">
                {getRecommendations(
                  "sentence-sea",
                  getScoreForGame("sentence-sea")
                )}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-2">Next Steps</h3>
            <p>
              This game helps identify areas where you might need more practice.
              Continue playing to improve your skills! Remember, practice makes
              progress!
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center p-6">
          <Button
            onClick={restartGame}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
          >
            Play Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
