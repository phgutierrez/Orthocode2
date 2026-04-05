import { Search, Heart, Info, Package, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Search, label: 'Buscar' },
  { path: '/favorites', icon: Heart, label: 'Favoritos' },
  { path: '/packages', icon: Package, label: 'Pacotes' },
  { path: '/about', icon: Info, label: 'Sobre' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 border-t border-border/70 safe-area-bottom z-40 backdrop-blur">
      <div className="flex items-center justify-between h-14 max-w-lg mx-auto px-3">
        <div className="flex items-center gap-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors",
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

        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground px-2 hidden sm:block">
            {user?.name}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
