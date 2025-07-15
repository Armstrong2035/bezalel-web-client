import React from "react";
import { Stack, Button } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

export default function NavigationButtons({
  isFirstQuestion,
  isLastQuestion,
  hasAnswer,
  onPrevious,
  onNext,
}) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mt: 4 }}
    >
      <Button
        startIcon={<ArrowBack />}
        onClick={onPrevious}
        disabled={isFirstQuestion}
        sx={{
          color: "rgba(255,255,255,0.7)",
          fontSize: { xs: "0.85rem", sm: "0.875rem" },
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.1)",
          },
          "&.Mui-disabled": {
            color: "rgba(255,255,255,0.3)",
          },
        }}
      >
        Previous
      </Button>
      <Button
        variant="contained"
        endIcon={<ArrowForward />}
        onClick={onNext}
        disabled={!hasAnswer}
        sx={{
          backgroundColor: hasAnswer ? "#ffffff" : "rgba(255,255,255,0.1)",
          color: hasAnswer ? "#000000" : "rgba(255,255,255,0.3)",
          fontSize: { xs: "0.85rem", sm: "0.875rem" },
          "&:hover": {
            backgroundColor: hasAnswer
              ? "rgba(255,255,255,0.9)"
              : "rgba(255,255,255,0.1)",
          },
          px: { xs: 2, sm: 3 },
          py: { xs: 1, sm: 1.5 },
          borderRadius: 2,
        }}
      >
        {isLastQuestion ? "Complete" : "Next"}
      </Button>
    </Stack>
  );
}
