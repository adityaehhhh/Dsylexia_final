export const SENTENCES_BY_AGE = {
  "4-7": [
    {
      correct: ["I", "like", "to", "swim"],
      hint: "What you enjoy doing in water",
    },
    {
      correct: ["The", "fish", "is", "blue"],
      hint: "Color of the fish",
    },
    {
      correct: ["See", "the", "big", "whale"],
      hint: "Looking at a large sea animal",
    },
    {
      correct: ["Look", "at", "my", "shell"],
      hint: "Showing something you found",
    },
    {
      correct: ["Fish", "swim", "in", "water"],
      hint: "Where fish move",
    },
  ],
  "8-11": [
    {
      correct: ["The", "fish", "swims", "in", "the", "ocean"],
      hint: "Action of a fish in water",
    },
    {
      correct: ["Dolphins", "jump", "over", "waves"],
      hint: "What dolphins do above water",
    },
    {
      correct: ["Crabs", "walk", "on", "the", "beach"],
      hint: "Where crabs move around",
    },
    {
      correct: ["The", "turtle", "hides", "in", "shell"],
      hint: "Where a turtle goes for safety",
    },
    {
      correct: ["Sharks", "have", "sharp", "teeth"],
      hint: "What sharks use to bite",
    },
  ],
  "12-16": [
    {
      correct: ["The", "magnificent", "whale", "breaches", "the", "surface"],
      hint: "When a whale jumps out of water",
    },
    {
      correct: ["Sailors", "navigate", "by", "the", "stars"],
      hint: "How people find their way at sea",
    },
    {
      correct: ["Marine", "life", "flourishes", "in", "coral", "reefs"],
      hint: "Where sea creatures thrive",
    },
    {
      correct: ["Ocean", "currents", "affect", "global", "weather"],
      hint: "How oceans impact our climate",
    },
    {
      correct: ["Scientists", "study", "deep", "sea", "creatures"],
      hint: "Research of ocean animals",
    },
  ],
};

export const getAgeGroup = (age: number): string => {
  if (age <= 7) return "4-7";
  if (age <= 11) return "8-11";
  return "12-16";
};

export const getLowerAgeGroup = (currentGroup: string): string | null => {
  if (currentGroup === "12-16") return "8-11";
  if (currentGroup === "8-11") return "4-7";
  return null;
};
