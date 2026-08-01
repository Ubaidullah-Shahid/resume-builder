import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function GradientButton({ className, children, ...props }: GradientButtonProps) {
  return (
    <Button
      className={cn(
        "relative group overflow-hidden bg-transparent border-0 hover:bg-transparent",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-90 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 blur-md opacity-0 group-hover:opacity-40 transition-opacity" />
      <span className="relative z-10 text-white font-medium flex items-center justify-center gap-2">
        {children}
      </span>
    </Button>
  );
}
