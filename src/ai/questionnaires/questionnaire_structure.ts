export enum Difficulty {
  easy = "easy",
  medium = "medium",
  hard = "hard",
}

export type Answer = {
  text: string;
  traits: string[];
};

export type Question = {
  question: string;
  answers: Answer[];
  difficulty: Difficulty;
  theme: string;
};

// This function is a placeholder for generating mock questions and is not used by the main questionnaire generator.
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
      answers: [
        { text: `Answer 1`, traits: ['trait1'] },
        { text: `Answer 2`, traits: ['trait2'] },
        { text: `Answer 3`, traits: ['trait3'] },
        { text: `Answer 4`, traits: ['trait4'] },
      ],
      difficulty: difficulty,
      theme: theme,
    });
  }
  return questions;
}
