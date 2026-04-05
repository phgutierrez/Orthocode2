import { useNavigate } from 'react-router-dom';
import { Heart, Search, Copy, PackagePlus } from 'lucide-react';
import { ProcedureCard } from '@/components/ProcedureCard';
import { BottomNav } from '@/components/BottomNav';
import { PageShell } from '@/components/PageShell';
import { SidebarNav } from '@/components/SidebarNav';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePackages } from '@/hooks/usePackages';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFavorites } from '@/hooks/useFavorites';
import { useProcedures } from '@/hooks/useProcedures';
import { Procedure } from '@/types/procedure';
import { useMemo, useState } from 'react';

export default function Favorites() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
  const { procedures, loading } = useProcedures();
  const { packages, updatePackage } = usePackages();
  const [selectedProcedureId, setSelectedProcedureId] = useState<string | null>(null);

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

  const handleCopyCode = async (procedure: Procedure) => {
    try {
      await navigator.clipboard.writeText(procedure.codes.tuss);
      toast({
        title: 'Codigo copiado',
        description: 'O codigo TUSS foi copiado.',
      });
    } catch {
      toast({
        title: 'Erro ao copiar',
        description: 'Nao foi possivel copiar o codigo.',
      });
    }
  };

  const handleAddToPackage = async (packageId: string) => {
    const pkg = packages.find((item) => item.id === packageId);
    if (!pkg || !selectedProcedureId) return;
    const nextIds = pkg.procedureIds.includes(selectedProcedureId)
      ? pkg.procedureIds
      : [...pkg.procedureIds, selectedProcedureId];
    try {
      await updatePackage(pkg.id, { procedureIds: nextIds });
      toast({
        title: 'Adicionado ao pacote',
        description: `Procedimento adicionado em "${pkg.name}".`,
      });
    } catch (error: unknown) {
      toast({
        title: 'Erro ao adicionar',
        description: error instanceof Error ? error.message : 'Nao foi possivel adicionar ao pacote.',
      });
    } finally {
      setSelectedProcedureId(null);
    }
  };

  return (
    <>
      <PageShell
        header={
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="h-5 w-5 text-primary fill-primary/15" />
              <h1 className="text-2xl font-semibold text-foreground">Favoritos</h1>
            </div>
            <p className="text-muted-foreground">
              {favorites.length} procedimento{favorites.length !== 1 ? 's' : ''} salvo{favorites.length !== 1 ? 's' : ''}
            </p>
          </div>
        }
        containerClassName="max-w-6xl"
        mainClassName="pb-24"
        sidebar={<SidebarNav />}
        context={
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Acoes rapidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
                Buscar procedimentos
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/packages")}>
                Ver pacotes
              </Button>
            </CardContent>
          </Card>
        }
      >
        {favoriteProcedures.length > 0 ? (
          <div className="space-y-4 max-w-2xl">
            {favoriteProcedures.map((procedure) => (
              <div key={procedure.id} className="space-y-2">
                <ProcedureCard
                  procedure={procedure}
                  isFavorite={true}
                  onToggleFavorite={toggleFavorite}
                  onClick={() => handleSelectProcedure(procedure)}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleCopyCode(procedure)}
                  >
                    <Copy className="h-4 w-4" />
                    Copiar codigo
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => setSelectedProcedureId(procedure.id)}
                  >
                    <PackagePlus className="h-4 w-4" />
                    Adicionar a pacote
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-14 max-w-2xl">
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

      <Dialog open={Boolean(selectedProcedureId)} onOpenChange={() => setSelectedProcedureId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar a pacote</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {packages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum pacote disponivel. Crie um pacote primeiro.
              </p>
            ) : (
              packages.map((pkg) => (
                <Button
                  key={pkg.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAddToPackage(pkg.id)}
                >
                  {pkg.name}
                </Button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
