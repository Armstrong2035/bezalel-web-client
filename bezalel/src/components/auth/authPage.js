"use client";

import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import AppleIcon from "@mui/icons-material/Apple";
import {
  Grid,
  Box,
  Typography,
  Stack,
  IconButton,
  TextField,
  Button,
  Container,
  Paper,
} from "@mui/material";
import { typographyStyles } from "../../typographyStyles/typography";
import LandingNav from "@/components/landing/LandingNav";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import Image from "next/image";
import Mark from "../../../public/images/logos/Mark.png";
import { useRouter } from "next/navigation";

export default function AuthPage({ heading, cta, subtext, sidebarInfo, href }) {
  const router = useRouter();

  return (
    <Box>
      <Link
        href="/"
        style={{
          textDecoration: "none",
        }}
      >
        <IconButton
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            fontSize: "2rem",
            padding: 2,
          }}
        >
          <ArrowBackIcon sx={{ fontSize: "2rem" }} />
        </IconButton>
      </Link>
      <Grid container sx={{ height: "100vh" }}>
        <Grid
          item
          size={{ xs: 12, md: 8 }}
          sx={{
            height: "100%",
            width: "100%",
            backgroundColor: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography sx={{ ...typographyStyles.heading }}>
              {heading}
            </Typography>
            <Stack direction="column" alignItems="center">
              <Typography>Continue with Google:</Typography>
              <IconButton
                size="large"
                sx={{ borderRadius: "50%", color: "black" }}
              >
                <GoogleIcon />
              </IconButton>
            </Stack>
            <Typography>Or continue with email</Typography>
          </Box>
          <TextField
            label="Email"
            sx={{
              width: "50%",
              "& .MuiOutlinedInput-root": {
                borderRadius: "70.59px",
                backgroundColor: "#cccccc",
                "& fieldset": {
                  border: "none",
                },
                "&:hover fieldset": {
                  border: "none",
                },
                "&.Mui-focused fieldset": {
                  border: "none",
                },
              },
              "& .MuiInputLabel-root": {
                color: "#666666",
              },
              "& .MuiInputBase-input": {
                color: "#333333",
              },
            }}
          />
          {/* <TextField
            label="Password"
            sx={{
              width: "50%",
              "& .MuiOutlinedInput-root": {
                borderRadius: "70.59px",
                backgroundColor: "#cccccc",
                "& fieldset": {
                  border: "none",
                },
                "&:hover fieldset": {
                  border: "none",
                },
                "&.Mui-focused fieldset": {
                  border: "none",
                },
              },
              "& .MuiInputLabel-root": {
                color: "#666666",
              },
              "& .MuiInputBase-input": {
                color: "#333333",
              },
            }}
          /> */}
          <Button
            variant="contained"
            sx={{
              color: "whitesmoke",
              textAlign: "center",
              mt: 2,
              width: "50%",
              fontSize: { xs: "11px", sm: "16px" },
              lineHeight: "20px",
              p: 2,
              backgroundColor: "#4c4c4c",
              borderRadius: "73.2px",
              border: "1px solid rgba(255, 255, 255, 0.7)",
            }}
            onClick={() => router.push(href)}
          >
            {cta}
          </Button>
        </Grid>

        <Grid
          item
          size={{ xs: 12, md: 4 }}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Stack>
            <Image
              src={Mark}
              alt="Bezalel Logo"
              width={300}
              height={300}
              style={{
                width: "100%",
                height: "auto",
                maxWidth: "300px",
                display: "block",
                margin: "0 auto",
              }}
            />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
