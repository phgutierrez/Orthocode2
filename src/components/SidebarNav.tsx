import { Search, Heart, Package, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Search, label: "Buscar" },
  { path: "/favorites", icon: Heart, label: "Favoritos" },
  { path: "/packages", icon: Package, label: "Pacotes" },
  { path: "/profile", icon: User, label: "Perfil" },
];

export function SidebarNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-6 space-y-2">
      <div className="text-xs uppercase tracking-wide text-muted-foreground px-2">
        Navegacao
      </div>
      <div className="space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive =
            location.pathname === path ||
            (path === "/" && location.pathname.startsWith("/procedure"));
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive && "fill-primary/20")} />
              <span className={cn("font-medium", isActive && "font-semibold")}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
