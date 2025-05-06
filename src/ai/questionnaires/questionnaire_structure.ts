export enum Difficulty  {
  easy = "easy",
  medium = "medium",
  hard = "hard",
}

export type Question = {
  question: string;
  answers: string[];
  difficulty: Difficulty;
  theme: string;
};

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
    questions.push({
      question: `Question ${i + 1} about ${theme} (difficulty: ${difficulty})`,
      answers: [`Answer 1`, `Answer 2`, `Answer 3`, `Answer 4`],
      difficulty: difficulty,
      theme: theme,
    });
  }
  return questions;
}