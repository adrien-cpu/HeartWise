import { Question, Difficulty } from './questionnaire_structure';

export const THEMES = [
  "Cinéma",
  "Musique",
  "Histoire",
  "Géographie",
  "Science",
  "Littérature",
  "Sport",
  "Cuisine",
  "Voyage",
  "Art",
];

export function generateQuestions(
  theme: string,
  difficulty: Difficulty,
  numberOfQuestions: number
): Question[] {
  if (numberOfQuestions <= 0) {
    return [];
  }

  const questions: Question[] = [];
  for (let i = 0; i < numberOfQuestions; i++) {
    let questionText: string;
    const answers: string[] = [];

    switch (difficulty) {
      case Difficulty.easy:
        questionText = `[EASY - ${theme}] Question ${i + 1}?`;
        answers.push(`Answer ${i + 1} A`);
        answers.push(`Answer ${i + 1} B`);
        answers.push(`Answer ${i + 1} C`);
        answers.push(`Answer ${i + 1} D`);
        break;
      case Difficulty.medium:
        questionText = `[MEDIUM - ${theme}] Question ${i + 1}?`;
        answers.push(`Answer ${i + 1} A`);
        answers.push(`Answer ${i + 1} B`);
        answers.push(`Answer ${i + 1} C`);
        answers.push(`Answer ${i + 1} D`);
        break;
      case Difficulty.hard:
        questionText = `[HARD - ${theme}] Question ${i + 1}?`;
        answers.push(`Answer ${i + 1} A`);
        answers.push(`Answer ${i + 1} B`);
        answers.push(`Answer ${i + 1} C`);
        answers.push(`Answer ${i + 1} D`);
        break;
      default:
        questionText = `[UNKNOWN - ${theme}] Question ${i + 1}?`;
        answers.push(`Answer ${i + 1} A`);
        answers.push(`Answer ${i + 1} B`);
        answers.push(`Answer ${i + 1} C`);
        answers.push(`Answer ${i + 1} D`);
        break;
    }
    
    questions.push({
      question: questionText,
      answers: answers,
      difficulty: difficulty,
      theme: theme,
    });
  }

  return questions;
}