// components/auth/authPage.js
"use client";

import { Grid, Box, Typography, IconButton } from "@mui/material";
import { typographyStyles } from "../../typographyStyles/typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import GoogleAuthProvider from "./GoogleAuthProvider";
import EmailAuthProvider from "./EmailAuthProvider";
import AuthImage from "./AuthImage";
import Mark from "../../../public/images/logos/Mark.png";

export default function AuthPage({ heading, cta, sidebarInfo }) {
  return (
    <Box>
      <Link href="/" style={{ textDecoration: "none" }}>
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
          <Typography sx={{ ...typographyStyles.heading }}>
            {heading}
          </Typography>
          <GoogleAuthProvider cta={cta} />
          {/* <EmailAuthProvider cta={cta} /> */}
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
          <AuthImage src={Mark} />
        </Grid>
      </Grid>
    </Box>
  );
}
