import {
  Fade,
  Card,
  CardContent,
  Stack,
  IconComponent,
  Icon,
  IconButton,
  Chip,
  Typography,
  Box,
} from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import Link from "next/link";

export default function CanvasItem({
  title,
  index,
  url,
  icon: IconComponent,
  description,
  isCore = false,
  isMobile,
}) {
  return (
    <Link href={`/segments/${url}`} style={{ textDecoration: "none" }}>
      <Fade in timeout={300 + index * 100}>
        <Card
          elevation={2}
          onClick={() => router.push(`/segments/${url}`)}
          sx={{
            height: "100%",
            border: "1px solid blue",
            minHeight: { xs: 120, sm: 140, md: 160 },
            backgroundColor: "rgba(40, 40, 40, 0.7)",
            borderRadius: 3,
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            border: "1px solid rgba(255,255,255,0.1)",
            "&:hover": {
              transform: "translateY(-8px) scale(1.02)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              "& .arrow-icon": {
                transform: "translate(4px, -4px)",
                opacity: 1,
              },
              "& .card-content": {
                transform: "translateY(-4px)",
              },
            },
            "&:active": {
              transform: "translateY(-4px) scale(1.01)",
            },
          }}
        >
          <Stack
            direction={"row"}
            spacing={2}
            justifyContent={"space-between"}
            alignItems={"center"}
            sx={{ p: 2 }}
          >
            <Box sx={{ display: "flex", gap: 2 }}>
              <IconComponent
                sx={{ fontSize: { xs: 20, sm: 24 }, color: "white" }}
              />

              <Chip
                label={index}
                size="small"
                sx={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                }}
              />
            </Box>

            <IconButton
              className="arrow-icon"
              size="small"
              sx={{
                opacity: 0,
                transition: "all 0.3s ease",
                color: "white",
                backgroundColor: "rgba(255,255,255,0.1)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.2)",
                },
              }}
            >
              <ArrowForward fontSize="small" />
            </IconButton>
          </Stack>
          <CardContent
            className="card-content"
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              p: { xs: 2, sm: 2.5, md: 3 },
            }}
          >
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              sx={{
                color: "white",
                fontWeight: 700,
                mb: 1,
                lineHeight: 1.2,
                fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" },
              }}
            >
              {title}
            </Typography>

            {!isMobile && (
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {description}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Fade>
    </Link>
  );
}
