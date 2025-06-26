import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-500 to-blue-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <Card className="border-4 border-cyan-300 bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-blue-800">Ocean Letters</CardTitle>
            <CardDescription className="text-xl text-blue-600">The Underwater Adventure</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6 p-6">
            <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-300 flex items-center justify-center">
                <img
                  src="/start2.gif?height=200&width=400"
                  alt="Underwater scene with colorful fish and sea creatures"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <p className="text-center text-lg">
              Join Ariel the Mermaid on an underwater adventure to collect the lost magical letters! Complete fun
              challenges to help sea creatures and assess for Dyslexia.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 p-6">
            <Link href="/start" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold"
              >
                Start New Game
              </Button>
            </Link>
            <Link href="/about" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full border-blue-500 text-blue-700 hover:bg-blue-50">
                About This Game
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
