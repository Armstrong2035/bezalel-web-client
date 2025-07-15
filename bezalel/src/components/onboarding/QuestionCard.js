import React from "react";
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Tooltip,
  IconButton,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { HelpOutline } from "@mui/icons-material";

export default function QuestionCard({ question, answer, onAnswerChange }) {
  return (
    <Card
      sx={{
        backgroundColor: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Typography
            variant="h2"
            sx={{ fontSize: { xs: "2.5rem", sm: "3rem" } }}
          >
            {question.emoji}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              variant="h4"
              sx={{
                color: "white",
                fontWeight: 600,
                fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
              }}
            >
              {question.question}
            </Typography>
            <Tooltip
              title={question.explanation}
              placement="top"
              arrow
              sx={{
                "& .MuiTooltip-tooltip": {
                  backgroundColor: "rgba(0,0,0,0.9)",
                  color: "white",
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  maxWidth: 300,
                  padding: "12px 16px",
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,0.1)",
                },
              }}
            >
              <IconButton
                size="small"
                sx={{
                  color: "rgba(255,255,255,0.6)",
                  "&:hover": {
                    color: "rgba(255,255,255,0.9)",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                <HelpOutline fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        {/* Render input based on question type */}
        {question.type === "text-input" ? (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={answer || ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder={question.placeholder}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                fontSize: { xs: "0.95rem", sm: "1.1rem" },
                fontFamily: "Poppins, sans-serif",
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.2)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "rgba(255,255,255,0.5)",
                },
              },
              "& .MuiInputBase-input::placeholder": {
                color: "rgba(255,255,255,0.5)",
                opacity: 1,
              },
            }}
          />
        ) : question.type === "multiple-choice" ? (
          <FormControl component="fieldset" sx={{ width: "100%" }}>
            <RadioGroup
              value={answer || ""}
              onChange={(e) => onAnswerChange(e.target.value)}
            >
              {question.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={
                    <Radio
                      sx={{
                        color: "rgba(255,255,255,0.5)",
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
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "rgba(255,255,255,0.02)",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.05)",
                      borderColor: "rgba(255,255,255,0.2)",
                    },
                    "&.Mui-checked": {
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderColor: "rgba(255,255,255,0.3)",
                    },
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        ) : null}
      </CardContent>
    </Card>
  );
}
