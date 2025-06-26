// Helper functions to save and retrieve game data

// Save game data for a specific game
export const saveGameData = (gameId: string, data: any) => {
  try {
    // Get existing game data from localStorage
    const existingDataString = localStorage.getItem("gameData")
    const existingData = existingDataString ? JSON.parse(existingDataString) : {}

    // Add new game data
    existingData[gameId] = data

    // Save back to localStorage
    localStorage.setItem("gameData", JSON.stringify(existingData))

    return true
  } catch (error) {
    console.error("Error saving game data:", error)
    return false
  }
}

// Get game data for a specific game
export const getGameData = (gameId: string) => {
  try {
    const dataString = localStorage.getItem("gameData")
    if (!dataString) return null

    const data = JSON.parse(dataString)
    return data[gameId] || null
  } catch (error) {
    console.error("Error retrieving game data:", error)
    return null
  }
}

// Get all game data
export const getAllGameData = () => {
  try {
    const dataString = localStorage.getItem("gameData")
    if (!dataString) return {}

    return JSON.parse(dataString)
  } catch (error) {
    console.error("Error retrieving all game data:", error)
    return {}
  }
}

// Clear all game data
export const clearAllGameData = () => {
  try {
    localStorage.removeItem("gameData")
    return true
  } catch (error) {
    console.error("Error clearing game data:", error)
    return false
  }
}
