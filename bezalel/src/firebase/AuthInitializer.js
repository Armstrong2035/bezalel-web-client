import { useEffect } from "react";
import { useAuthStore } from "./authStore";

export const AuthInitializer = ({ children }) => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return unsubscribe;
  }, [initializeAuth]);

  return children;
};
