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
import { useRouter } from "next/navigation";

export default function LandingNav() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = {
    left: {
      logo: "Bezalel",
      url: "/",
    },
    right: [
      {
        title: "How to build a business",
        href: "/blog",
      },
      {
        title: "Sign up",
        href: "/onboarding",
      },
      {
        title: "Sign in",
        href: "/auth/signin",
      },
    ],
  };

  const handleNavigation = (href) => {
    router.push(href);
    setMobileOpen(false); // Close mobile menu after navigation
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Mobile drawer content
  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <List>
        {navItems.right.map((item, index) => (
          <ListItem
            key={index}
            onClick={() => handleNavigation(item.href)}
            sx={{
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <ListItemText
              primary={item.title}
              sx={{
                "& .MuiListItemText-primary": {
                  color: "whitesmoke",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  fontSize: "1.1rem",
                },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ backgroundColor: "transparent" }}
    >
      <Container maxWidth="lg">
        <Toolbar
          sx={{
            justifyContent: "space-between",
            py: { xs: 1, sm: 2 }, // Responsive padding
            px: { xs: 0, sm: 2 }, // Responsive horizontal padding
          }}
        >
          {/* Left side - Logo */}
          <Box
            onClick={() => handleNavigation(navItems.left.url)}
            sx={{
              cursor: "pointer",
              "&:hover": { opacity: 0.8 },
            }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                color: "whitesmoke",
                fontSize: { xs: "1.25rem", sm: "1.5rem" }, // Responsive logo size
                fontFamily: "Poppins, sans-serif",
              }}
            >
              {navItems.left.logo}
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box
              sx={{
                display: "flex",
                gap: { sm: 2, md: 3 },
                alignItems: "center",
              }}
            >
              {navItems.right.map((item, index) => (
                <Button
                  key={index}
                  onClick={() => handleNavigation(item.href)}
                  sx={{
                    color: "whitesmoke",
                    textTransform: "none",
                    fontWeight: 500,
                    fontSize: { sm: "0.85rem", md: "0.95rem" }, // Responsive font size
                    fontFamily: "Poppins, sans-serif",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  {item.title}
                </Button>
              ))}
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                color: "whitesmoke",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 250,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            backdropFilter: "blur(10px)",
            border: "none",
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
}
