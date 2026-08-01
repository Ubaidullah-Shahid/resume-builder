import { LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function SignOutButton() {
  const { logout } = useAuth();
  const [, navigate] = useLocation();

  function handleSignOut() {
    logout();
    navigate("/");
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
      <LogOut className="w-4 h-4" /> Sign out
    </Button>
  );
}