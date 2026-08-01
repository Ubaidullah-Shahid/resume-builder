import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";

const API_URL = "http://localhost:4000/api";

export default function OAuthCallback() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const token = new URLSearchParams(search).get("token");

  useEffect(() => {
    async function finish() {
      if (!token) {
        navigate("/sign-in?error=missing_token");
        return;
      }
      const res = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      const body = await res.json();
      if (!res.ok) {
        navigate("/sign-in?error=oauth_failed");
        return;
      }
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(body.user));
      window.dispatchEvent(new Event("auth-changed"));
      navigate(body.user.role === "admin" ? "/admin" : "/dashboard");
    }
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      Signing you in…
    </div>
  );
}