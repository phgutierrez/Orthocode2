import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, TrendingUp } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { SearchBar } from '@/components/SearchBar';
import { ProcedureCard } from '@/components/ProcedureCard';
import { FilterChips } from '@/components/FilterChips';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { searchProcedures } from '@/data/procedures';
import { useFavorites } from '@/hooks/useFavorites';
import { useProcedures } from '@/hooks/useProcedures';
import { Procedure, AnatomicRegion, ProcedureType } from '@/types/procedure';

export default function Index() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { procedures, loading } = useProcedures();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<AnatomicRegion>();
  const [selectedType, setSelectedType] = useState<ProcedureType>();

  const results = useMemo(() => {
    if (!searchQuery && !selectedRegion && !selectedType) {
      return [];
    }
    if (!Array.isArray(procedures) || procedures.length === 0) {
      return [];
    }
    return searchProcedures(procedures, searchQuery, {
      region: selectedRegion,
      type: selectedType,
    });
  }, [procedures, searchQuery, selectedRegion, selectedType]);

  const recentFavorites = useMemo(() => {
    if (!Array.isArray(favorites) || !Array.isArray(procedures)) {
      return [];
    }
    return favorites
      .slice(0, 3)
      .map(id => procedures.find(p => p.id === id))
      .filter(Boolean) as Procedure[];
  }, [favorites, procedures]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando procedimentos...</p>
      </div>
    );
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelectProcedure = (procedure: Procedure) => {
    navigate(`/procedure/${procedure.id}`);
  };

  const showResults = searchQuery || selectedRegion || selectedType;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="medical-gradient pt-8 pb-12 px-4 safe-area-top">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <Logo size="lg" />
          </div>
          
          <SearchBar 
            onSearch={handleSearch}
            onSelectProcedure={handleSelectProcedure}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 -mt-4">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Filters */}
          <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
            <FilterChips
              selectedRegion={selectedRegion}
              selectedType={selectedType}
              onRegionChange={setSelectedRegion}
              onTypeChange={setSelectedType}
            />
          </div>

          {/* Results or Home Content */}
          {showResults ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                </h2>
                {(searchQuery || selectedRegion || selectedType) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedRegion(undefined);
                      setSelectedType(undefined);
                    }}
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>

              {results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((procedure) => (
                    <ProcedureCard
                      key={procedure.id}
                      procedure={procedure}
                      isFavorite={isFavorite(procedure.id)}
                      onToggleFavorite={toggleFavorite}
                      onClick={() => handleSelectProcedure(procedure)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Nenhum procedimento encontrado para sua busca.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Quick Favorites */}
              {recentFavorites.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Favoritos Recentes</h2>
                  </div>
                  <div className="space-y-3">
                    {recentFavorites.map((procedure) => (
                      <ProcedureCard
                        key={procedure.id}
                        procedure={procedure}
                        isFavorite={true}
                        onToggleFavorite={toggleFavorite}
                        onClick={() => handleSelectProcedure(procedure)}
                      />
                    ))}
                  </div>
                  {favorites.length > 3 && (
                    <Button
                      variant="ghost"
                      className="w-full mt-3"
                      onClick={() => navigate('/favorites')}
                    >
                      Ver todos os favoritos ({favorites.length})
                    </Button>
                  )}
                </section>
              )}

              {/* Popular Procedures */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Procedimentos Populares</h2>
                </div>
                <div className="space-y-3">
                  {procedures.slice(0, 5).map((procedure) => (
                    <ProcedureCard
                      key={procedure.id}
                      procedure={procedure}
                      isFavorite={isFavorite(procedure.id)}
                      onToggleFavorite={toggleFavorite}
                      onClick={() => handleSelectProcedure(procedure)}
                    />
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
