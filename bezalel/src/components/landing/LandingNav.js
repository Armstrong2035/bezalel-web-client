import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useState } from "react";
import Link from "@/components/loading/NavigationLink";

const fontFamily =
  "'Poppins', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default function LandingNav() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);


  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <List>
        <ListItem
          component={Link}
          href="/auth/signin"
          prefetch={true}
          onNavigate={() => setMobileOpen(false)}
          sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f4" } }}
        >
          <ListItemText
            primary="Sign in"
            sx={{
              "& .MuiListItemText-primary": {
                color: "#1a1a1a",
                fontFamily,
                fontWeight: 500,
                fontSize: "1rem",
              },
            }}
          />
        </ListItem>
        <ListItem
          component={Link}
          href="/auth/signup"
          prefetch={true}
          onNavigate={() => setMobileOpen(false)}
          sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f4" } }}
        >
          <ListItemText
            primary="Get started"
            sx={{
              "& .MuiListItemText-primary": {
                color: "#1a1a1a",
                fontFamily,
                fontWeight: 600,
                fontSize: "1rem",
              },
            }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ backgroundColor: "transparent", borderBottom: "1px solid #f0f0ee" }}
    >
      <Container maxWidth="lg">
        <Toolbar
          sx={{
            justifyContent: "space-between",
            py: { xs: 1, sm: 1.5 },
            px: { xs: 0, sm: 2 },
          }}
        >
          <Box
            component={Link}
            href="/"
            sx={{ cursor: "pointer", textDecoration: "none", "&:hover": { opacity: 0.7 } }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                color: "#1a1a1a",
                fontSize: { xs: "1.2rem", sm: "1.35rem" },
                fontFamily,
              }}
            >
              Bezalel
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Button
                component={Link}
          href="/auth/signin"
          prefetch={true}
          onNavigate={() => setMobileOpen(false)}
                sx={{
                  color: "#666666",
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  fontFamily,
                  "&:hover": { backgroundColor: "#f5f5f4", color: "#1a1a1a" },
                }}
              >
                Sign in
              </Button>
              <Button
                variant="contained"
                component={Link}
          href="/auth/signup"
          prefetch={true}
          onNavigate={() => setMobileOpen(false)}
                sx={{
                  color: "#ffffff",
                  backgroundColor: "#1a1a1a",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  fontFamily,
                  px: 2.5,
                  borderRadius: "7px",
                  "&:hover": { backgroundColor: "#333333" },
                }}
              >
                Get started
              </Button>
            </Box>
          )}

          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ color: "#1a1a1a" }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </Container>

      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 250,
            backgroundColor: "#ffffff",
            border: "none",
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
}
