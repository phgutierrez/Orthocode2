import { useMemo, useState } from 'react';
import { Package, Plus, Clipboard, Pencil, Trash2, Search } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { usePackages } from '@/hooks/usePackages';
import { useProcedures } from '@/hooks/useProcedures';
import { useFavorites } from '@/hooks/useFavorites';
import { toast } from '@/components/ui/use-toast';
import { regionLabels, typeLabels } from '@/types/procedure';

export default function Packages() {
  const { packages, addPackage, updatePackage, deletePackage } = usePackages();
  const { procedures, loading } = useProcedures();
  const { favorites } = useFavorites();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [query, setQuery] = useState('');
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);

  const favoriteProcedures = useMemo(() => {
    return favorites
      .map(id => procedures.find(p => p.id === id))
      .filter(Boolean) as typeof procedures;
  }, [favorites, procedures]);

  const filteredProcedures = useMemo(() => {
    if (!query.trim()) return favoriteProcedures;
    const q = query.toLowerCase();
    return favoriteProcedures.filter((procedure) => {
      if (!procedure) return false;
      return (
        procedure.name?.toLowerCase().includes(q) ||
        procedure.codes?.tuss?.toLowerCase().includes(q) ||
        procedure.codes?.cbhpm?.toLowerCase().includes(q) ||
        procedure.codes?.sus?.toLowerCase().includes(q) ||
        procedure.keywords?.some(keyword => keyword?.toLowerCase().includes(q))
      );
    });
  }, [query, favoriteProcedures]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setQuery('');
    setSelectedProcedures([]);
  };

  const handleToggleProcedure = (id: string) => {
    setSelectedProcedures((current) =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({
        title: 'Informe um nome',
        description: 'O pacote precisa de um nome para ser salvo.',
      });
      return;
    }

    if (selectedProcedures.length === 0) {
      toast({
        title: 'Selecione pelo menos um código',
        description: 'Adicione procedimentos TUSS ao pacote antes de salvar.',
      });
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      procedureIds: selectedProcedures,
    };

    if (editingId) {
      updatePackage(editingId, payload);
      toast({
        title: 'Pacote atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
    } else {
      addPackage(payload);
      toast({
        title: 'Pacote criado',
        description: 'Seu pacote foi criado e já está disponível.',
      });
    }

    resetForm();
  };

  const handleEdit = (id: string) => {
    const pkg = packages.find(item => item.id === id);
    if (!pkg) return;
    setEditingId(pkg.id);
    setName(pkg.name);
    setDescription(pkg.description ?? '');
    setSelectedProcedures(pkg.procedureIds);
    setQuery('');
  };

  const handleCopyCodes = async (id: string) => {
    const pkg = packages.find(item => item.id === id);
    if (!pkg) return;

    const codes = pkg.procedureIds
      .map(procId => procedures.find(item => item.id === procId))
      .filter(Boolean)
      .map(proc => proc!.codes.tuss)
      .join('\n');

    try {
      await navigator.clipboard.writeText(codes);
      toast({
        title: 'Códigos copiados',
        description: 'Os códigos TUSS foram copiados para a área de transferência.',
      });
    } catch (error) {
      console.error('Error copying codes:', error);
      toast({
        title: 'Não foi possível copiar',
        description: 'Seu navegador não permitiu a cópia automática.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border pt-6 pb-4 px-4 safe-area-top">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Pacotes</h1>
          </div>
          <p className="text-muted-foreground">
            Crie pacotes para agrupar códigos TUSS e compartilhar rapidamente.
          </p>
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {editingId ? 'Editar pacote' : 'Novo pacote'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nome do pacote</label>
                <Input
                  placeholder="Ex.: Joelho - Artroscopia"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Descrição (opcional)</label>
                <Textarea
                  placeholder="Detalhes adicionais para este pacote"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Adicionar procedimentos dos favoritos</label>
                <div className="relative">
                  <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
                  <Input
                    className="pl-9"
                    placeholder="Buscar nos favoritos"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                {favoriteProcedures.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhum favorito ainda. Adicione procedimentos aos favoritos para criar pacotes.
                  </p>
                )}
              </div>

              {favoriteProcedures.length > 0 && (
                <div className="grid gap-3 max-h-72 overflow-y-auto pr-1">
                  {filteredProcedures.map((procedure) => {
                  const selected = selectedProcedures.includes(procedure.id);
                  return (
                    <button
                      key={procedure.id}
                      type="button"
                      onClick={() => handleToggleProcedure(procedure.id)}
                      className="text-left"
                    >
                      <Card className={selected ? 'border-primary' : ''}>
                        <CardContent className="p-4 flex items-start gap-3">
                          <Checkbox checked={selected} className="mt-1" />
                          <div className="space-y-2">
                            <div>
                              <p className="font-semibold text-foreground">{procedure.name}</p>
                              <p className="text-xs text-muted-foreground">TUSS: {procedure.codes.tuss}</p>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="secondary" className="text-xs">
                                {regionLabels[procedure.region]}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {typeLabels[procedure.type]}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </button>
                  );
                })}
              </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="gap-2" onClick={handleSubmit} disabled={favoriteProcedures.length === 0}>
                  <Plus className="h-4 w-4" />
                  {editingId ? 'Salvar alterações' : 'Criar pacote'}
                </Button>
                {editingId && (
                  <Button variant="ghost" onClick={resetForm}>
                    Cancelar edição
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Seus pacotes</h2>
            {packages.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Nenhum pacote criado ainda. Monte seu primeiro pacote acima.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {packages.map((pkg) => {
                  const proceduresList = pkg.procedureIds
                    .map(procId => procedures.find(item => item.id === procId))
                    .filter(Boolean);

                  return (
                    <Card key={pkg.id}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-semibold text-foreground">{pkg.name}</h3>
                            {pkg.description && (
                              <p className="text-sm text-muted-foreground">{pkg.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {proceduresList.length} código{proceduresList.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(pkg.id)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deletePackage(pkg.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {proceduresList.slice(0, 4).map((procedure) => (
                            <Badge key={procedure!.id} variant="secondary" className="text-xs">
                              {procedure!.codes.tuss}
                            </Badge>
                          ))}
                          {proceduresList.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{proceduresList.length - 4}
                            </Badge>
                          )}
                        </div>

                        <Button variant="outline" className="w-full gap-2" onClick={() => handleCopyCodes(pkg.id)}>
                          <Clipboard className="h-4 w-4" />
                          Copiar códigos TUSS
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
