import { useMemo, useState } from 'react';
import { Package, Plus, Clipboard, Pencil, Trash2, Search, X } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [packageQuery, setPackageQuery] = useState('');
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [viewingPackageId, setViewingPackageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  const favoriteProcedures = useMemo(() => {
    if (!Array.isArray(favorites) || !Array.isArray(procedures)) {
      return [];
    }
    return favorites
      .map(id => procedures.find(p => p.id === id))
      .filter(Boolean) as typeof procedures;
  }, [favorites, procedures]);

  const filteredProcedures = useMemo(() => {
    const safeQuery = query?.trim() ?? '';
    if (!safeQuery) return favoriteProcedures;
    const q = safeQuery.toLowerCase();
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

  const filteredPackages = useMemo(() => {
    const safeQuery = packageQuery?.trim() ?? '';
    if (!safeQuery) return packages;
    const q = safeQuery.toLowerCase();
    return packages.filter((pkg) => {
      return (
        pkg.name?.toLowerCase().includes(q) ||
        pkg.description?.toLowerCase().includes(q)
      );
    });
  }, [packageQuery, packages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const viewingPackage = viewingPackageId ? packages.find(pkg => pkg.id === viewingPackageId) : null;
  const viewingProcedures = viewingPackage
    ? viewingPackage.procedureIds
        .map(procId => procedures.find(item => item.id === procId))
        .filter(Boolean)
    : [];

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

  const handleSubmit = async () => {
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
      description: description.trim(),
      procedureIds: selectedProcedures,
    };

    try {
      if (editingId) {
        await updatePackage(editingId, payload);
        toast({
          title: 'Pacote atualizado',
          description: 'As alterações foram salvas com sucesso.',
        });
      } else {
        await addPackage(payload);
        toast({
          title: 'Pacote criado',
          description: 'Seu pacote foi criado e já está disponível.',
        });
      }

      resetForm();
    } catch (error: any) {
      const message = error?.message || 'Não foi possível salvar o pacote.';
      toast({
        title: 'Erro ao salvar pacote',
        description: message,
      });
    }
  };

  const handleNewPackage = () => {
    resetForm();
    setActiveTab('create');
  };

  const handleEdit = (id: string) => {
    const pkg = packages.find(item => item.id === id);
    if (!pkg) return;
    setEditingId(pkg.id);
    setName(pkg.name);
    setDescription(pkg.description ?? '');
    setSelectedProcedures(pkg.procedureIds);
    setQuery('');
    setActiveTab('create');
  };

  const handleCopyCodes = async (id: string) => {
    const pkg = packages.find(item => item.id === id);
    if (!pkg) return;

    const proceduresList = pkg.procedureIds
      .map(procId => procedures.find(item => item.id === procId))
      .filter(Boolean);

    const formatted = [
      `${pkg.name}`,
      '',
      ...proceduresList.map(proc => `- ${proc!.codes.tuss} - ${proc!.name}`),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(formatted);
      toast({
        title: 'Pacote copiado',
        description: 'O pacote foi copiado para a área de transferência.',
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
          <p className="text-muted-foreground text-sm">
            Agrupe códigos TUSS em pacotes reutilizáveis
          </p>
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="list">Meus Pacotes</TabsTrigger>
              <TabsTrigger value="create">
                {editingId ? 'Editar' : 'Criar Novo'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              {packages.length > 0 && (
                <div className="relative">
                  <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
                  <Input
                    className="pl-9"
                    placeholder="Buscar pacotes..."
                    value={packageQuery}
                    onChange={(event) => setPackageQuery(event.target.value)}
                  />
                </div>
              )}

              {packages.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center space-y-4">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div className="space-y-2">
                      <p className="text-muted-foreground">Nenhum pacote criado ainda</p>
                      <Button onClick={handleNewPackage} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Criar primeiro pacote
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : filteredPackages.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Nenhum pacote encontrado
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredPackages.map((pkg) => {
                    const proceduresList = pkg.procedureIds
                      .map(procId => procedures.find(item => item.id === procId))
                      .filter(Boolean);

                    return (
                      <Card
                        key={pkg.id}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => setViewingPackageId(pkg.id)}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-foreground truncate">
                                {pkg.name}
                              </h3>
                              {pkg.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                  {pkg.description}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                {proceduresList.length} procedimento{proceduresList.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEdit(pkg.id)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => deletePackage(pkg.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {proceduresList.slice(0, 3).map((procedure) => (
                              <Badge key={procedure!.id} variant="secondary" className="text-xs">
                                {procedure!.codes.tuss}
                              </Badge>
                            ))}
                            {proceduresList.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{proceduresList.length - 3}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {packages.length > 0 && (
                <Button 
                  onClick={handleNewPackage} 
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  Criar novo pacote
                </Button>
              )}
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
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

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button className="flex-1 gap-2" onClick={handleSubmit} disabled={favoriteProcedures.length === 0}>
                  <Plus className="h-4 w-4" />
                  {editingId ? 'Salvar alterações' : 'Criar pacote'}
                </Button>
                {editingId && (
                  <Button variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BottomNav />

      {/* Modal de detalhes do pacote */}
      {viewingPackage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 safe-area-bottom">
          <Card className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="sticky top-0 bg-card border-b flex flex-row items-center justify-between space-y-0">
              <CardTitle>{viewingPackage.name}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewingPackageId(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {viewingPackage.description && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Descrição</h3>
                  <p className="text-sm text-muted-foreground">{viewingPackage.description}</p>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Procedimentos ({viewingProcedures.length})</h3>
                <div className="space-y-3">
                  {viewingProcedures.map((procedure) => (
                    <Card key={procedure!.id} className="border">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{procedure!.name}</p>
                            <div className="space-y-1 mt-2">
                              {procedure!.codes.tuss && (
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-medium">TUSS:</span> {procedure!.codes.tuss}
                                </p>
                              )}
                              {procedure!.codes.cbhpm && (
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-medium">CBHPM:</span> {procedure!.codes.cbhpm}
                                </p>
                              )}
                              {procedure!.codes.sus && (
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-medium">SUS:</span> {procedure!.codes.sus}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {regionLabels[procedure!.region]}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {typeLabels[procedure!.type]}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => {
                    handleCopyCodes(viewingPackage.id);
                    setViewingPackageId(null);
                  }}
                >
                  <Clipboard className="h-4 w-4" />
                  Copiar códigos
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setViewingPackageId(null)}
                >
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
