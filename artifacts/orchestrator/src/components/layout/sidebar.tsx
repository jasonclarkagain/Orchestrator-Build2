import { Link, useLocation } from "wouter";
import { Activity, TerminalSquare, Box, ToyBrick, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHealthCheck } from "@workspace/api-client-react";

export function Sidebar() {
  const [location] = useLocation();
  const { data: health } = useHealthCheck();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Activity },
    { href: "/tools", label: "Tools", icon: TerminalSquare },
    { href: "/executions", label: "Executions", icon: Box },
    { href: "/plugins", label: "Plugins", icon: ToyBrick },
    { href: "/intent", label: "Intent", icon: Command },
  ];

  return (
    <div className="w-[190px] h-screen bg-sidebar border-r border-sidebar-border flex flex-col font-mono shrink-0">
      <div className="p-4 border-b border-sidebar-border flex items-center gap-2">
        <div className="w-2 h-2 bg-primary animate-pulse-fast"></div>
        <h1 className="text-primary font-bold tracking-widest text-sm">ORCH_2026</h1>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                isActive
                  ? "text-primary bg-sidebar-accent border-r-2 border-primary"
                  : "text-sidebar-foreground/70 hover:text-primary hover:bg-sidebar-accent/50"
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border text-xs flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-none", health?.status === "ok" ? "bg-primary" : "bg-destructive")}></div>
        <span className={cn(health?.status === "ok" ? "text-primary" : "text-destructive")}>
          {health?.status === "ok" ? "SYS_ONLINE" : "SYS_ERROR"}
        </span>
      </div>
    </div>
  );
}
