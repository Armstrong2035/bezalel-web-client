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
import { useAuthRedirect } from "@/components/auth/useAuthRedirect";
import { completeOnboarding, getCurrentUser } from "@/firebase/auth";

export default function Onboarding() {
  const router = useRouter();
  const { loading } = useAuthRedirect();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const onboardingData = useOnboardingStore((state) => state.onboardingData);
  const setOnboardingData = useOnboardingStore(
    (state) => state.setOnboardingData
  );
  const resetOnboardingData = useOnboardingStore(
    (state) => state.resetOnboardingData
  );

  const currentQuestion = onboardingQuestions[currentQuestionIndex];
  const progress =
    ((currentQuestionIndex + 1) / onboardingQuestions.length) * 100;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion =
    currentQuestionIndex === onboardingQuestions.length - 1;
  const hasAnswer = onboardingData[currentQuestion.id];

  const handleAnswerChange = (value) => {
    setOnboardingData({ [currentQuestion.id]: value });
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      const user = getCurrentUser();
      if (user) {
        // Authenticated: complete onboarding and redirect to segments
        try {
          await completeOnboarding(user.uid);
          resetOnboardingData();
        } catch (error) {
          console.error("Failed to complete onboarding:", error);
        }
      } else {
        // Unauthenticated: go to signup
        router.push("/auth/signup");
      }
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex((prev) => prev - 1);
  };

  if (loading) {
    return <Box>Loading...</Box>;
  }

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
