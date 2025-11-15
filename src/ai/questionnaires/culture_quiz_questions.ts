export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const cultureQuizQuestions: QuizQuestion[] = [
  {
    question: "Quelle est la capitale de l'Australie ?",
    options: ["Sydney", "Melbourne", "Canberra", "Perth"],
    correctAnswer: "Canberra",
    difficulty: 'easy',
  },
  {
    question: "Qui a écrit 'Orgueil et Préjugés' ?",
    options: ["Jane Austen", "Emily Brontë", "George Eliot", "Virginia Woolf"],
    correctAnswer: "Jane Austen",
    difficulty: 'easy',
  },
  {
    question: "Quel artiste a peint le plafond de la chapelle Sixtine ?",
    options: ["Léonard de Vinci", "Michel-Ange", "Raphaël", "Donatello"],
    correctAnswer: "Michel-Ange",
    difficulty: 'medium',
  },
  {
    question: "En quelle année l'homme a-t-il marché sur la Lune pour la première fois ?",
    options: ["1965", "1969", "1972", "1968"],
    correctAnswer: "1969",
    difficulty: 'medium',
  },
  {
    question: "Quel est l'élément chimique le plus abondant dans l'atmosphère terrestre ?",
    options: ["Oxygène", "Azote", "Argon", "Dioxyde de carbone"],
    correctAnswer: "Azote",
    difficulty: 'medium',
  },
  {
    question: "Qui a développé la théorie de la relativité ?",
    options: ["Isaac Newton", "Galilée", "Albert Einstein", "Nikola Tesla"],
    correctAnswer: "Albert Einstein",
    difficulty: 'hard',
  },
    {
    question: "Quel est le plus long fleuve du monde ?",
    options: ["Le Nil", "L'Amazone", "Le Mississippi", "Le Yangtsé"],
    correctAnswer: "L'Amazone",
    difficulty: 'hard',
  },
  {
    question: "Dans quelle ville se trouvent les ruines de Pompéi ?",
    options: ["Rome", "Naples", "Florence", "Venise"],
    correctAnswer: "Naples",
    difficulty: 'medium',
  },
  {
    question: "Quel compositeur était surnommé le 'Sorcier de Bayreuth' ?",
    options: ["Mozart", "Bach", "Beethoven", "Wagner"],
    correctAnswer: "Wagner",
    difficulty: 'hard',
  },
  {
    question: "Combien de pays composent le Royaume-Uni ?",
    options: ["2", "3", "4", "5"],
    correctAnswer: "4",
    difficulty: 'easy',
  },
];
