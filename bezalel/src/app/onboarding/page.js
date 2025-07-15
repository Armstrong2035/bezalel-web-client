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

export default function Onboarding() {
  const router = useRouter();
  const ideaExists = false; // <-- set to false to show the idea box
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    ideaExists ? 1 : 0
  );
  const [answers, setAnswers] = useState({});

  const onboardingQuestions = [
    {
      id: "businessIdea",
      emoji: "💡",
      question: "What's your business idea?",
      explanation:
        "Describe your business idea in a few sentences. This helps us create a personalized business model canvas.",
      type: "text-input",
      placeholder:
        "e.g., A SaaS platform that helps small restaurants manage their inventory and reduce food waste...",
    },
    {
      id: "journey",
      emoji: "🚶‍♂️",
      question: "Where are you in the journey?",
      explanation:
        "We ask this to tailor our recommendations to your current stage. Beginners and live business owners need very different support.",
      type: "multiple-choice",
      options: [
        "Just an idea",
        "Doing research",
        "Already started building",
        "Have some traction",
        "Running a live business",
      ],
    },
    {
      id: "goal",
      emoji: "🎯",
      question: "What's your main goal?",
      explanation:
        "Your goal shapes the entire strategy. Whether you're testing or scaling, we guide you accordingly.",
      type: "multiple-choice",
      options: [
        "Start earning from this",
        "Test if it's worth pursuing",
        "Grow into a serious business",
        "Solve a problem I care about",
      ],
    },
    {
      id: "time",
      emoji: "🕒",
      question: "How much time can you give this?",
      explanation:
        "Time is your most limited resource. We won't suggest plans that require more time than you have.",
      type: "multiple-choice",
      options: [
        "Just a few hours a week",
        "8–15 hours a week",
        "15–30 hours a week",
        "Full-time or close to it",
      ],
    },
    {
      id: "experience",
      emoji: "📚",
      question: "What's your experience level?",
      explanation:
        "This helps Bezalel know how much guidance to give. Total beginners get more hand-holding, while experts get more advanced paths.",
      type: "multiple-choice",
      options: [
        "Total beginner",
        "Some business experience",
        "Industry/domain expert",
        "Started a business before",
      ],
    },
    {
      id: "investment",
      emoji: "💰",
      question: "How much can you invest financially (for now)?",
      explanation:
        "Your financial range affects what strategies are realistic. We don't want to suggest something you can't afford.",
      type: "multiple-choice",
      options: [
        "$0 (I'm broke but scrappy)",
        "<$100",
        "$100–$500",
        "$500–$2,000",
        "I'm ready to invest more if it makes sense",
      ],
    },
    {
      id: "archetype",
      emoji: "🧬",
      question: "What type of business is this?",
      explanation:
        "Different types of businesses require very different planning. We use this to apply proven strategy patterns from your category.",
      type: "multiple-choice",
      options: [
        "SaaS",
        "Marketplace",
        "Service Business",
        "EdTech / Online Learning",
        "Consumer App",
        "Local Business",
        "Newsletter / Media",
        "Not sure yet",
      ],
    },
  ];

  const currentQuestion = onboardingQuestions[currentQuestionIndex];
  const progress =
    ((currentQuestionIndex + 1) / onboardingQuestions.length) * 100;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion =
    currentQuestionIndex === onboardingQuestions.length - 1;
  const hasAnswer = answers[currentQuestion.id];

  const handleAnswerChange = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Submit onboarding data
      console.log("Onboarding completed:", answers);
      // Navigate to dashboard or next step
      router.push("/dashboard");
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex((prev) => prev - 1);
  };

  const handleSkip = () => {
    router.push("/segments");
  };

  function renderQuestion() {
    if (currentQuestion.type === "text-input") {
      return (
        <TextField
          fullWidth
          multiline
          rows={4}
          value={answers[currentQuestion.id] || ""}
          onChange={(e) =>
            setAnswers((prev) => ({
              ...prev,
              [currentQuestion.id]: e.target.value,
            }))
          }
          placeholder={currentQuestion.placeholder}
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "white",
              fontSize: { xs: "0.95rem", sm: "1.1rem" },
              fontFamily: "Poppins, sans-serif",
              "& fieldset": {
                borderColor: "rgba(255, 255, 255, 0.2)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(255, 255, 255, 0.3)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "rgba(255, 255, 255, 0.5)",
              },
            },
            "& .MuiInputBase-input::placeholder": {
              color: "rgba(255, 255, 255, 0.5)",
              opacity: 1,
            },
          }}
        />
      );
    }

    // Handle multiple-choice questions
    if (currentQuestion.type === "multiple-choice") {
      return (
        <FormControl component="fieldset" sx={{ width: "100%" }}>
          <RadioGroup
            value={answers[currentQuestion.id] || ""}
            onChange={(e) =>
              setAnswers((prev) => ({
                ...prev,
                [currentQuestion.id]: e.target.value,
              }))
            }
          >
            {currentQuestion.options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={option}
                control={
                  <Radio
                    sx={{
                      color: "rgba(255, 255, 255, 0.5)",
                      "&.Mui-checked": {
                        color: "#ffffff",
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      color: "white",
                      fontSize: { xs: "0.95rem", sm: "1.1rem" },
                      fontWeight: 400,
                    }}
                  >
                    {option}
                  </Typography>
                }
                sx={{
                  margin: "12px 0",
                  padding: { xs: "10px 12px", sm: "12px 16px" },
                  borderRadius: 2,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&.Mui-checked": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      );
    }

    // Optionally, handle other types or return null
    return null;
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
        answer={answers[currentQuestion.id]}
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
