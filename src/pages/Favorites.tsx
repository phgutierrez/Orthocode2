import { useNavigate } from 'react-router-dom';
import { Heart, Search } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ProcedureCard } from '@/components/ProcedureCard';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { useProcedures } from '@/hooks/useProcedures';
import { Procedure } from '@/types/procedure';
import { useMemo } from 'react';

export default function Favorites() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { procedures, loading } = useProcedures();

  const favoriteProcedures = useMemo(() => {
    if (!Array.isArray(favorites) || !Array.isArray(procedures)) {
      return [];
    }
    return favorites
      .map(id => procedures.find(p => p.id === id))
      .filter(Boolean) as Procedure[];
  }, [favorites, procedures]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const handleSelectProcedure = (procedure: Procedure) => {
    navigate(`/procedure/${procedure.id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border pt-6 pb-4 px-4 safe-area-top">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-6 w-6 text-primary fill-primary/20" />
            <h1 className="text-2xl font-bold text-foreground">Favoritos</h1>
          </div>
          <p className="text-muted-foreground">
            {favorites.length} procedimento{favorites.length !== 1 ? 's' : ''} salvo{favorites.length !== 1 ? 's' : ''}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {favoriteProcedures.length > 0 ? (
            <div className="space-y-3">
              {favoriteProcedures.map((procedure) => (
                <ProcedureCard
                  key={procedure.id}
                  procedure={procedure}
                  isFavorite={true}
                  onToggleFavorite={toggleFavorite}
                  onClick={() => handleSelectProcedure(procedure)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Heart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Nenhum favorito ainda
              </h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Adicione procedimentos aos seus favoritos para acessá-los rapidamente mesmo offline.
              </p>
              <Button onClick={() => navigate('/')} className="gap-2">
                <Search className="h-4 w-4" />
                Buscar procedimentos
              </Button>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
