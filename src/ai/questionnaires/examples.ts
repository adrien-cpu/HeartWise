import { Question, Difficulty } from './questionnaire_structure';

export const EXAMPLE_QUESTIONS_SCIENCE_EASY: Question[] = [
  {
    question: "Quelle est la formule chimique de l'eau ?",
    answers: ["H2O", "CO2", "NaCl", "O2"],
    difficulty: Difficulty.easy,
    theme: "Science",
  },
  {
    question: "Quel est le plus grand organe du corps humain ?",
    answers: ["La peau", "Le foie", "Le cœur", "Le cerveau"],
    difficulty: Difficulty.easy,
    theme: "Science",
  },
];

export const EXAMPLE_QUESTIONS_SCIENCE_MEDIUM: Question[] = [
  {
    question: "Quelle est la vitesse de la lumière dans le vide ?",
    answers: ["299 792 458 m/s", "150 000 km/s", "100 000 m/s", "343 m/s"],
    difficulty: Difficulty.medium,
    theme: "Science",
  },
  {
    question: "Qu'est-ce que la photosynthèse ?",
    answers: ["Processus par lequel les plantes utilisent la lumière pour synthétiser des sucres.", "Processus de respiration des animaux.", "Processus de décomposition des déchets organiques.", "Processus de digestion des animaux."],
    difficulty: Difficulty.medium,
    theme: "Science",
  },
];

export const EXAMPLE_QUESTIONS_SCIENCE_HARD: Question[] = [
  {
    question: "Qu'est-ce que la théorie de la relativité générale d'Einstein ?",
    answers: ["Une théorie de la gravité.", "Une théorie de l'évolution.", "Une théorie de la thermodynamique.", "Une théorie de la mécanique quantique."],
    difficulty: Difficulty.hard,
    theme: "Science",
  },
  {
    question: "Quel est le principe de l'intrication quantique ?",
    answers: ["Deux particules peuvent être liées de telle sorte que l'état de l'une influence l'autre.", "Les particules se comportent différemment en fonction de leur masse.", "Les particules se repoussent toujours.", "Les particules s'attirent toujours."],
    difficulty: Difficulty.hard,
    theme: "Science",
  },
];

export const EXAMPLE_QUESTIONS_HISTORY_EASY: Question[] = [
  {
    question: "En quelle année la Révolution française a-t-elle commencé ?",
    answers: ["1789", "1815", "1776", "1848"],
    difficulty: Difficulty.easy,
    theme: "Histoire",
  },
  {
    question: "Qui était le premier président des États-Unis ?",
    answers: ["George Washington", "Thomas Jefferson", "Abraham Lincoln", "John Adams"],
    difficulty: Difficulty.easy,
    theme: "Histoire",
  },
];

export const EXAMPLE_QUESTIONS_HISTORY_MEDIUM: Question[] = [
  {
    question: "Quelle était la cause principale de la Première Guerre mondiale ?",
    answers: ["Assassinat de l'archiduc François-Ferdinand", "L'expansion du communisme", "La révolution industrielle", "La famine en Europe"],
    difficulty: Difficulty.medium,
    theme: "Histoire",
  },
  {
    question: "Quelle civilisation a construit les pyramides de Gizeh ?",
    answers: ["Les Égyptiens", "Les Mayas", "Les Incas", "Les Grecs"],
    difficulty: Difficulty.medium,
    theme: "Histoire",
  },
];

export const EXAMPLE_QUESTIONS_HISTORY_HARD: Question[] = [
  {
    question: "Quel traité a mis fin à la Première Guerre mondiale ?",
    answers: ["Traité de Versailles", "Traité de Trianon", "Traité de Brest-Litovsk", "Traité de Saint-Germain-en-Laye"],
    difficulty: Difficulty.hard,
    theme: "Histoire",
  },
  {
    question: "Quelle était la signification de la Conférence de Bandung en 1955 ?",
    answers: ["Premier grand sommet des pays non-alignés.", "Création de l'Union Européenne.", "Signature du traité de l'Atlantique Nord.", "Fin de la guerre froide."],
    difficulty: Difficulty.hard,
    theme: "Histoire",
  },
];

export const EXAMPLE_QUESTIONS_GENERAL_CULTURE_EASY: Question[] = [
    {
        question: "Combien de jours y a-t-il dans une année ?",
        answers: ["365", "360", "300", "370"],
        difficulty: Difficulty.easy,
        theme: "Culture générale"
    },
    {
        question: "Quel est le plus grand continent ?",
        answers: ["Asie", "Afrique", "Amérique", "Europe"],
        difficulty: Difficulty.easy,
        theme: "Culture générale"
    },
];

export const EXAMPLE_QUESTIONS_GENERAL_CULTURE_MEDIUM: Question[] = [
    {
        question: "Qui a peint la Joconde ?",
        answers: ["Léonard de Vinci", "Michel-Ange", "Raphaël", "Donatello"],
        difficulty: Difficulty.medium,
        theme: "Culture générale"
    },
    {
        question: "Dans quel pays se trouve la ville de Rio de Janeiro ?",
        answers: ["Brésil", "Argentine", "Mexique", "Colombie"],
        difficulty: Difficulty.medium,
        theme: "Culture générale"
    },
];

export const EXAMPLE_QUESTIONS_GENERAL_CULTURE_HARD: Question[] = [
    {
        question: "Quel est le plus petit pays du monde ?",
        answers: ["Vatican", "Monaco", "Nauru", "Tuvalu"],
        difficulty: Difficulty.hard,
        theme: "Culture générale"
    },
    {
        question: "Combien de fois la France a-t-elle remporté la Coupe du Monde de football ?",
        answers: ["2", "3", "1", "4"],
        difficulty: Difficulty.hard,
        theme: "Culture générale"
    },
];