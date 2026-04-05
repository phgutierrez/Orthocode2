import { useNavigate } from 'react-router-dom';
import { Heart, Search } from 'lucide-react';
import { ProcedureCard } from '@/components/ProcedureCard';
import { BottomNav } from '@/components/BottomNav';
import { PageShell } from '@/components/PageShell';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { useProcedures } from '@/hooks/useProcedures';
import { Procedure } from '@/types/procedure';
import { useMemo } from 'react';

export default function Favorites() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { procedures, loading } = useProcedures();

  const procedureById = useMemo(() => {
    return new Map(procedures.map((procedure) => [procedure.id, procedure]));
  }, [procedures]);

  const favoriteProcedures = useMemo(() => {
    if (!Array.isArray(favorites)) {
      return [];
    }
    return favorites
      .map((id) => procedureById.get(id))
      .filter(Boolean) as Procedure[];
  }, [favorites, procedureById]);

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
    <>
      <PageShell
        header={
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Heart className="h-5 w-5 text-primary fill-primary/15" />
              <h1 className="text-2xl font-semibold text-foreground">Favoritos</h1>
            </div>
            <p className="text-muted-foreground">
              {favorites.length} procedimento{favorites.length !== 1 ? 's' : ''} salvo{favorites.length !== 1 ? 's' : ''}
            </p>
          </div>
        }
        containerClassName="max-w-2xl"
        mainClassName="pb-24"
      >
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
          <div className="text-center py-14">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-muted flex items-center justify-center">
              <Heart className="h-8 w-8 text-muted-foreground" />
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
      </PageShell>

      <BottomNav />
    </>
  );
}
