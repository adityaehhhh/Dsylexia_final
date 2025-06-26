export const WORD_SETS_BY_AGE = {
  "4-7": [
    { correct: "cat", incorrect: ["kat", "cet", "ket"] },
    { correct: "dog", incorrect: ["dug", "dawg", "dok"] },
    { correct: "fish", incorrect: ["fich", "phish", "fesh"] },
    { correct: "ball", incorrect: ["bal", "boll", "baul"] },
    { correct: "book", incorrect: ["buk", "booc", "boak"] },
    { correct: "sun", incorrect: ["son", "san", "sen"] },
    { correct: "pen", incorrect: ["pan", "pin", "pyn"] },
    { correct: "hat", incorrect: ["het", "het", "hut"] },
    { correct: "cup", incorrect: ["cap", "kup", "cop"] },
    { correct: "box", incorrect: ["boks", "bex", "boks"] },
  ],
  "8-11": [
    { correct: "ocean", incorrect: ["ocen", "osean", "ocian"] },
    { correct: "beach", incorrect: ["beech", "beatch", "beaach"] },
    { correct: "whale", incorrect: ["wale", "whael", "waile"] },
    { correct: "coral", incorrect: ["cral", "corral", "corel"] },
    { correct: "anchor", incorrect: ["ankor", "ancor", "ancher"] },
    { correct: "coast", incorrect: ["coust", "koast", "cost"] },
    { correct: "shell", incorrect: ["shel", "chell", "shil"] },
    { correct: "pearl", incorrect: ["perl", "purl", "peril"] },
    { correct: "shark", incorrect: ["shak", "sharck", "sherk"] },
    { correct: "wave", incorrect: ["waev", "weiv", "wave"] },
  ],
  "12-16": [
    { correct: "dolphin", incorrect: ["dolfin", "dolfen", "dolphyn"] },
    { correct: "treasure", incorrect: ["tresure", "treasur", "tresur"] },
    { correct: "seaweed", incorrect: ["seeweed", "seawed", "seewead"] },
    { correct: "island", incorrect: ["iland", "ieland", "ilend"] },
    { correct: "sailor", incorrect: ["sailer", "saylor", "saler"] },
    { correct: "lagoon", incorrect: ["lagune", "laggon", "legoon"] },
    { correct: "marine", incorrect: ["mareen", "marin", "mareene"] },
    { correct: "horizon", incorrect: ["horizen", "horison", "horizan"] },
    { correct: "compass", incorrect: ["compas", "cumpass", "kompas"] },
    { correct: "current", incorrect: ["curent", "currant", "kurrent"] },
  ]
};

export const getAgeGroup = (age: number): string => {
  if (age <= 7) return "4-7";
  if (age <= 11) return "8-11";
  return "12-16";
};
