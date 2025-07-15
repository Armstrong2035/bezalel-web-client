import AuthPage from "@/components/auth/authPage";

export default function SignIn() {
  return (
    <AuthPage
      heading={"Sign up"}
      cta={"Sign up"}
      sidebarInfo={"Welcome to Bezalel."}
      href={"/onboarding"}
    />
  );
}
