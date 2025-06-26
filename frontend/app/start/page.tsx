"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Anchor, Fish, FishIcon as Jellyfish, Shell, Turtle } from "lucide-react"

export default function StartPage() {
  const router = useRouter()
  const [playerName, setPlayerName] = useState("")
  const [playerAge, setPlayerAge] = useState("")
  const [avatar, setAvatar] = useState("fish")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Store player info in localStorage
    localStorage.setItem(
      "playerInfo",
      JSON.stringify({
        name: playerName,
        age: Number.parseInt(playerAge),
        avatar: avatar,
        gameStartTime: new Date().toISOString(),
      }),
    )

    router.push("/intro")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-500 to-blue-900 flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full border-4 border-cyan-300 bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-blue-800">Welcome, Ocean Explorer!</CardTitle>
          <CardDescription className="text-center">Tell us about yourself before diving in</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
                className="border-blue-300 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Your Age</Label>
              <Input
                id="age"
                type="number"
                min="4"
                max="12"
                placeholder="How old are you?"
                value={playerAge}
                onChange={(e) => setPlayerAge(e.target.value)}
                required
                className="border-blue-300 focus:border-blue-500"
              />
            </div>

            <div className="space-y-3">
              <Label>Choose Your Sea Buddy</Label>
              <RadioGroup value={avatar} onValueChange={setAvatar} className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <Fish className="h-10 w-10 text-blue-600" />
                  </div>
                  <RadioGroupItem value="fish" id="fish" className="sr-only" />
                  <Label htmlFor="fish" className="cursor-pointer text-sm">
                    Fish
                  </Label>
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
                    <Jellyfish className="h-10 w-10 text-pink-600" />
                  </div>
                  <RadioGroupItem value="jellyfish" id="jellyfish" className="sr-only" />
                  <Label htmlFor="jellyfish" className="cursor-pointer text-sm">
                    Jellyfish
                  </Label>
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <Turtle className="h-10 w-10 text-green-600" />
                  </div>
                  <RadioGroupItem value="turtle" id="turtle" className="sr-only" />
                  <Label htmlFor="turtle" className="cursor-pointer text-sm">
                    Turtle
                  </Label>
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Shell className="h-10 w-10 text-yellow-600" />
                  </div>
                  <RadioGroupItem value="shell" id="shell" className="sr-only" />
                  <Label htmlFor="shell" className="cursor-pointer text-sm">
                    Shell
                  </Label>
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <Anchor className="h-10 w-10 text-red-600" />
                  </div>
                  <RadioGroupItem value="anchor" id="anchor" className="sr-only" />
                  <Label htmlFor="anchor" className="cursor-pointer text-sm">
                    Anchor
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
            disabled={!playerName || !playerAge}
          >
            Dive In!
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
