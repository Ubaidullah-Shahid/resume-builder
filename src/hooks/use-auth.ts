import { useState, useEffect, useCallback } from "react";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
  createdAt: string;
}

function readUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(readUser());

  useEffect(() => {
    function sync() {
      setUser(readUser());
    }
    window.addEventListener("storage", sync);
    window.addEventListener("auth-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth-changed", sync);
    };
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-changed"));
  }, []);

  return {
    user,
    token: typeof window !== "undefined" ? sessionStorage.getItem("token") : null,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    logout,
  };
}