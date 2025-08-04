"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
  TextField,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  Info,
  HelpOutline,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Heading from "@/components/onboarding/Heading";
import ProgressBar from "@/components/onboarding/ProgressBar";
import QuestionCard from "@/components/onboarding/QuestionCard";
import NavigationButtons from "@/components/onboarding/NavigationButtons";
import onboardingQuestions from "../../components/onboarding/helpers/onboardingData";
import { useOnboardingStore } from "@/stores/onboardingStore";

export default function Onboarding() {
  const router = useRouter();

  const ideaExists = false; // <-- set to false to show the idea box
  // If true, the first question will be skipped. Useful for the previous onboarding flow which bega from the landing page.
  // If false, the first question will be shown, allowing users to enter their business idea

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    ideaExists ? 1 : 0
  );
  const onboardingData = useOnboardingStore((state) => state.onboardingData);
  const setOnboardingData = useOnboardingStore(
    (state) => state.setOnboardingData
  );
  //local state variable to store answers.

  const currentQuestion = onboardingQuestions[currentQuestionIndex];
  //keep track of the current question based on the index. Questions from the onboardingQuestions array.

  const progress =
    ((currentQuestionIndex + 1) / onboardingQuestions.length) * 100;
  // Calculate progress as a percentage based on the current question index.
  const isFirstQuestion = currentQuestionIndex === 0;
  // Check if the current question is the first one.
  // If true, the "Previous" button will be disabled.
  const isLastQuestion =
    currentQuestionIndex === onboardingQuestions.length - 1;
  // Check if the current question is the last one.
  // If true, the "Next" button will be disabled.
  const hasAnswer = onboardingData[currentQuestion.id];

  // Check if the current question has an answer. User cannot proceed without answering the current question.

  const handleAnswerChange = (value) => {
    setOnboardingData({ [currentQuestion.id]: value });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Submit onboarding data
      console.log("Onboarding completed:", onboardingData);

      // Navigate to dashboard or next step
      router.push("/auth/signup");
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex((prev) => prev - 1);
  };

  const handleSkip = () => {
    router.push("/auth/signup");
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Heading
        title="Clarity in Motion"
        explanation="This will take about 2-3 minutes and help us create your personalized business plan with actionable next steps."
      />
      <ProgressBar
        progress={progress}
        currentStep={currentQuestionIndex + 1}
        totalSteps={onboardingQuestions.length}
      />
      <QuestionCard
        question={currentQuestion}
        answer={onboardingData[currentQuestion.id]}
        onAnswerChange={handleAnswerChange}
      />
      <NavigationButtons
        isFirstQuestion={isFirstQuestion}
        isLastQuestion={isLastQuestion}
        hasAnswer={!!hasAnswer}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </Container>
  );
}
