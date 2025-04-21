"use client";

import {Button} from "@/components/ui/button";
import {useTranslations} from "next-intl";
import {useState} from "react";

const questions = [
  {
    question: "What is the capital of France?",
    answer: "Paris",
  },
  {
    question: "What is the highest mountain in the world?",
    answer: "Mount Everest",
  },
  {
    question: "What is the largest ocean in the world?",
    answer: "Pacific Ocean",
  },
];

const GamePage = () => {
  const t = useTranslations("Game");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % questions.length);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
      <div className="flex justify-center space-x-4 mb-4">
        <Button>{t("randomPartner")}</Button>
        <Button>{t("matchPartner")}</Button>
      </div>
      <div className="border rounded-md p-4">
        <p className="font-semibold">{t("question")}:</p>
        <p className="mb-2">{questions[currentQuestionIndex].question}</p>
        <p className="font-semibold">{t("answer")}:</p>
        <p>{questions[currentQuestionIndex].answer}</p>
      </div>
      <div className="flex justify-end mt-4">
        <Button onClick={handleNextQuestion}>{t("nextQuestion")}</Button>
      </div>
    </div>
  );
};

export default GamePage;
