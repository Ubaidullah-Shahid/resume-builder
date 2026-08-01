import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, FileText, Layout, Sparkles, BarChart2, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const API_URL = "http://localhost:4000/api";

function getInitials(name?: string) {
  if (!name) return "U";
  return name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location] = useLocation();
  const { user, token } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    function loadCredits() {
      if (!token) return;
      fetch(`${API_URL}/ai/credits`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((body) => setCredits(body.aiCredits))
        .catch(() => {});
    }
    loadCredits();
    window.addEventListener("credits-changed", loadCredits);
    return () => window.removeEventListener("credits-changed", loadCredits);
  }, [token]);

  const navItems = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "My Resumes", icon: FileText, path: "/my-resumes" },
    { name: "Templates", icon: Layout, path: "/templates" },
    { name: "AI Tools", icon: Sparkles, path: "/ai-tools" },
    { name: "Analytics", icon: BarChart2, path: "/analytics" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 bottom-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col z-40",
        isCollapsed ? "w-[64px]" : "w-[260px]"
      )}
    >
      <div className="h-16 flex items-center px-4 justify-between border-b border-sidebar-border">
        {!isCollapsed && (
          <Link href="/">
            <div className="text-xl font-bold tracking-tight cursor-pointer truncate">
              Resume<span className="gradient-text">AI</span>
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 text-muted-foreground", isCollapsed && "mx-auto")}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      <div className="flex-1 py-6 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-4 mb-6">
            <Link href="/settings">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <Avatar>
                  <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name ?? "Guest"}</p>
                  <Badge variant="secondary" className="text-[10px] h-4 mt-0.5 bg-primary/20 text-primary hover:bg-primary/20 capitalize">
                    {user?.role ?? "—"}
                  </Badge>
                </div>
              </div>
            </Link>
          </div>
        )}

        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;

            return (
              <Link key={item.name} href={item.path}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors group",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white",
                    isCollapsed && "justify-center px-0"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon size={18} className={cn(isActive ? "text-primary" : "text-muted-foreground group-hover:text-white")} />
                  {!isCollapsed && <span>{item.name}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">AI Credits</span>
              <span className="font-medium text-primary">{credits ?? "…"}/50</span>
            </div>
            <Progress value={credits !== null ? (credits / 50) * 100 : 0} className="h-1.5" />
          </div>
        ) : (
          <div className="flex justify-center" title={credits !== null ? `${credits}/50 Credits` : "Credits"}>
            <Sparkles size={18} className="text-primary" />
          </div>
        )}
      </div>
    </aside>
  );
}