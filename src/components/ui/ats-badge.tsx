import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AtsBadgeProps {
  score: number;
  className?: string;
}

export function AtsBadge({ score, className }: AtsBadgeProps) {
  let colorClass = "bg-red-500/10 text-red-500 border-red-500/20";
  
  if (score >= 80) {
    colorClass = "bg-green-500/10 text-green-500 border-green-500/20";
  } else if (score >= 60) {
    colorClass = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
  }

  return (
    <Badge variant="outline" className={cn(colorClass, "font-medium backdrop-blur-md", className)}>
      ATS {score}%
    </Badge>
  );
}
