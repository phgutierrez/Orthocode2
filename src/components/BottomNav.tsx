import { Search, Heart, Package, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Search, label: 'Buscar' },
  { path: '/favorites', icon: Heart, label: 'Favoritos' },
  { path: '/packages', icon: Package, label: 'Pacotes' },
  { path: '/profile', icon: User, label: 'Perfil' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 border-t border-border/70 safe-area-bottom z-40 backdrop-blur">
      <div className="flex items-center justify-between h-14 max-w-lg mx-auto px-3">
        <div className="flex items-center justify-between w-full">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive =
              location.pathname === path ||
              (path === "/" && location.pathname.startsWith("/procedure"));
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-colors",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
                <span className={cn("text-[11px] font-medium", isActive && "font-semibold")}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
