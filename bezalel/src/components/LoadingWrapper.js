import NavigationProvider from "./loading/NavigationProvider";

export default function LoadingWrapper({ children }) {
  return <NavigationProvider>{children}</NavigationProvider>;
}
