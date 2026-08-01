import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { isAuthenticated, isAdmin } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      // No valid session in this browser at all (new browser, incognito,
      // cleared storage, pasted link, etc.) — send to Sign In, not Sign Up.
      navigate(`/sign-in?redirect=${encodeURIComponent(location)}`);
    } else if (adminOnly && !isAdmin) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isAdmin, location, navigate]);

  if (!isAuthenticated) return null;
  if (adminOnly && !isAdmin) return null;

  return <>{children}</>;
}