import { Link, useLocation } from "wouter";
import { GradientButton } from "@/components/ui/gradient-button";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b-0 border-white/5">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="text-2xl font-bold tracking-tight cursor-pointer">
            Resume<span className="gradient-text">AI</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features">
            <span className="hover:text-white transition-colors cursor-pointer">Features</span>
          </Link>
          <Link href="/templates">
            <span className="hover:text-white transition-colors cursor-pointer">Templates</span>
          </Link>
          <Link href="#pricing">
            <span className="hover:text-white transition-colors cursor-pointer">Pricing</span>
          </Link>
          <Link href="#about">
            <span className="hover:text-white transition-colors cursor-pointer">About</span>
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-muted-foreground hover:text-white">
              Log in
            </Button>
          </Link>
          <Link href="/dashboard">
            <GradientButton className="h-9 px-4 text-sm">
              Get Started Free
            </GradientButton>
          </Link>
        </div>
      </div>
    </header>
  );
}
