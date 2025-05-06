import { generateQuestions } from "./questionnaire_generator";
import { Difficulty, Question } from "./questionnaire_structure";
import { describe, it, expect } from "@jest/globals";

describe("generateQuestions", () => {
  it("should return the correct number of questions", () => {
    const theme = "Culture générale";
    const difficulty: Difficulty = Difficulty.easy;
    const numberOfQuestions = 5;
    const questions = generateQuestions(theme, difficulty, numberOfQuestions);
    expect(questions.length).toEqual(numberOfQuestions);
  });

  it("should return questions with the correct difficulty and theme", () => {
    const theme = "Sport";
    const difficulty: Difficulty = Difficulty.medium;
    const numberOfQuestions = 3;
    const questions = generateQuestions(theme, difficulty, numberOfQuestions);

    questions.forEach((question: Question) => {
      expect(question.difficulty).toEqual(difficulty);
      expect(question.theme).toEqual(theme);
    });
  });

  it("should return an empty array if the number of questions is <= 0", () => {
    const theme = "Cinéma";
    const difficulty: Difficulty = Difficulty.hard;
    const numberOfQuestions = 0;
    const questions = generateQuestions(theme, difficulty, numberOfQuestions);
    expect(questions.length).toEqual(0);
  });
});