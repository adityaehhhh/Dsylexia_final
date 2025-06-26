import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-500 to-blue-900 flex flex-col items-center justify-center p-4">
      <Card className="max-w-3xl w-full border-4 border-cyan-300 bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-800">About Ocean Letters</CardTitle>
          <CardDescription className="text-xl">A Gamified Dyslexia Assessment Adventure</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-blue-700">What is Ocean Letters?</h2>
            <p>
              Ocean Letters is an innovative, aquatic-themed assessment tool designed to help identify potential signs of dyslexia in children.
              Through a series of engaging underwater games, the system analyzes various aspects of reading and processing abilities
              to provide insights that can assist in early dyslexia detection.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-blue-700">Assessment Features</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="font-bold">Bubble Bay:</span> Assesses letter recognition patterns and confusion between
                commonly misidentified letters like b/d and p/q.
              </li>
              <li>
                <span className="font-bold">Word Reef:</span> Evaluates word recognition abilities and identifies patterns
                in word processing difficulties.
              </li>
              <li>
                <span className="font-bold">Memory Cove:</span> Measures working memory capacity and sequential processing
                abilities, common challenge areas in dyslexia.
              </li>
              <li>
                <span className="font-bold">Spell Shore:</span> Analyzes spelling patterns and common error types
                associated with dyslexia.
              </li>
              <li>
                <span className="font-bold">Sentence Sea:</span> Evaluates sentence comprehension and word order
                processing capabilities.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-blue-700">Assessment Areas</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Letter recognition and differentiation patterns</li>
              <li>Word processing and recognition capabilities</li>
              <li>Working memory assessment</li>
              <li>Spelling pattern analysis</li>
              <li>Sentence structure comprehension</li>
              <li>Processing speed measurement</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-blue-700">For Parents and Teachers</h2>
            <p>
              Ocean Letters uses advanced algorithms to analyze gameplay patterns and provide preliminary insights
              about potential dyslexia indicators. The assessment generates a detailed report highlighting specific
              areas where patterns typical of dyslexia are observed.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
              <p className="font-bold text-blue-800">Important Note:</p>
              <p>
                While Ocean Letters provides valuable insights, it should not be considered a definitive diagnosis.
                Results should be used as a screening tool and discussed with qualified educational or healthcare
                professionals for proper evaluation and diagnosis.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center p-6">
          <Link href="/">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
            >
              Return to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
