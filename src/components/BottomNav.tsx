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
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom z-40">
      <div className="flex items-center justify-between h-16 max-w-lg mx-auto px-2">
        <div className="flex items-center gap-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-colors",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-6 w-6", isActive && "fill-primary/20")} />
                <span className={cn("text-xs font-medium", isActive && "font-semibold")}>
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
            className="flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Sair"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
