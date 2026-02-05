import { useMemo, useState } from 'react';
import { Package, Plus, Clipboard, Pencil, Trash2, Search, X, Share2, Bell, Check, Heart } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FilterChips } from '@/components/FilterChips';
import { usePackages } from '@/hooks/usePackages';
import { useProcedures } from '@/hooks/useProcedures';
import { useFavorites } from '@/hooks/useFavorites';
import { useUsers } from '@/hooks/useUsers';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { regionLabels, typeLabels, AnatomicRegion, ProcedureType } from '@/types/procedure';
import { searchProcedures } from '@/data/procedures';
import { supabase } from '@/lib/supabase';

export default function Packages() {
  const { user } = useAuth();
  const { packages, addPackage, updatePackage, deletePackage } = usePackages();
  const { procedures, loading } = useProcedures();
  const { favorites } = useFavorites();
  const { users } = useUsers();
  const { notifications, unreadCount, markAsRead, deleteNotification, refetch: refetchNotifications } = useNotifications();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [query, setQuery] = useState('');
  const [packageQuery, setPackageQuery] = useState('');
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [viewingPackageId, setViewingPackageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<AnatomicRegion>();
  const [selectedType, setSelectedType] = useState<ProcedureType>();

  // Filtrar usuários removendo duplicatas e o usuário atual
  const availableUsers = useMemo(() => {
    const uniqueUsers = users.filter((u, index, self) => 
      index === self.findIndex((t) => t.id === u.id)
    );
    return uniqueUsers.filter(u => u.id !== user?.id);
  }, [users, user?.id]);

  const filteredProcedures = useMemo(() => {
    if (!Array.isArray(procedures)) return [];
    
    // Aplicar filtros de região e tipo primeiro
    let filtered = searchProcedures(procedures, query?.trim() ?? '', {
      region: selectedRegion,
      type: selectedType,
    });
    
    // Se não houver query, região ou tipo, mostrar todos
    if (!query?.trim() && !selectedRegion && !selectedType) {
      filtered = procedures;
    }
    
    // Filtrar apenas favoritos se ativado
    if (showOnlyFavorites) {
      filtered = filtered.filter(p => favorites.includes(p.id));
    }
    
    return filtered;
  }, [procedures, query, selectedRegion, selectedType, showOnlyFavorites, favorites]);

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
    setShowOnlyFavorites(false);
    setSelectedRegion(undefined);
    setSelectedType(undefined);
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

  const handleSharePackage = async (packageId: string, toUserId: string) => {
    if (!user?.id) return;

    try {
      // Criar compartilhamento
      const { error: shareError } = await supabase
        .from('shared_packages')
        .insert({
          package_id: packageId,
          from_user_id: user.id,
          to_user_id: toUserId,
          status: 'pending',
        });

      if (shareError) throw shareError;

      // Criar notificação
      const pkg = packages.find(p => p.id === packageId);
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: toUserId,
          type: 'package_share',
          data: {
            package_id: packageId,
            package_name: pkg?.name,
            from_user_name: user.name,
            from_user_id: user.id,
          },
        });

      if (notifError) throw notifError;

      toast({
        title: 'Pacote compartilhado',
        description: 'O usuário receberá uma notificação.',
      });
    } catch (error: any) {
      console.error('Erro ao compartilhar pacote:', error);
      toast({
        title: 'Erro ao compartilhar',
        description: error.message || 'Não foi possível compartilhar o pacote.',
      });
    }
  };

  const handleAcceptShare = async (notificationId: string, shareData: any) => {
    if (!user?.id) return;

    try {
      console.log('Share data raw:', shareData, typeof shareData);
      
      // Parse se for string JSON
      let parsedData = shareData;
      if (typeof shareData === 'string') {
        parsedData = JSON.parse(shareData);
      }
      
      console.log('Share data parsed:', parsedData);
      
      // Extrair o package_id de shareData
      const packageId = parsedData?.package_id;
      console.log('Package ID extraído:', packageId);
      
      if (!packageId) {
        throw new Error('ID do pacote não encontrado na notificação');
      }

      // Buscar pacote compartilhado
      console.log('Buscando pacote com ID:', packageId);
      const { data: packageData, error: fetchError } = await supabase
        .from('packages')
        .select('*, package_procedures(procedure_code)')
        .eq('id', packageId);

      console.log('Resultado da busca:', { packageData, fetchError });
      
      if (fetchError) throw fetchError;
      if (!packageData || packageData.length === 0) {
        throw new Error(`Pacote com ID ${packageId} não encontrado`);
      }

      const sharedPkg = packageData[0];
      console.log('Pacote encontrado:', sharedPkg);

      // Criar cópia do pacote para o usuário
      const payload = {
        name: sharedPkg.name,
        description: sharedPkg.description || '',
        procedureIds: sharedPkg.package_procedures?.map((p: any) => p.procedure_code) || [],
      };

      await addPackage(payload);

      // Atualizar status do compartilhamento
      await supabase
        .from('shared_packages')
        .update({ status: 'accepted' })
        .eq('package_id', packageId)
        .eq('to_user_id', user.id);

      // Deletar notificação
      await deleteNotification(notificationId);

      toast({
        title: 'Pacote adicionado',
        description: 'O pacote foi adicionado aos seus pacotes.',
      });
    } catch (error: any) {
      console.error('Erro ao aceitar compartilhamento:', error);
      toast({
        title: 'Erro ao aceitar',
        description: error.message || 'Não foi possível adicionar o pacote.',
      });
    }
  };

  const handleRejectShare = async (notificationId: string, shareData: any) => {
    if (!user?.id) return;

    try {
      // Atualizar status do compartilhamento
      await supabase
        .from('shared_packages')
        .update({ status: 'rejected' })
        .eq('package_id', shareData.package_id)
        .eq('to_user_id', user.id);

      // Deletar notificação
      await deleteNotification(notificationId);

      toast({
        title: 'Compartilhamento recusado',
        description: 'A solicitação foi removida.',
      });
    } catch (error: any) {
      console.error('Erro ao rejeitar compartilhamento:', error);
      toast({
        title: 'Erro ao rejeitar',
        description: error.message || 'Não foi possível recusar o compartilhamento.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border pt-6 pb-4 px-4 safe-area-top">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Pacotes</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
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
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <Share2 className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto">
                                  {availableUsers.map(u => (
                                    <DropdownMenuItem
                                      key={u.id}
                                      onClick={() => handleSharePackage(pkg.id, u.id)}
                                    >
                                      {u.name || u.email}
                                    </DropdownMenuItem>
                                  ))}
                                  {users.length === 0 ? (
                                    <DropdownMenuItem disabled>
                                      Carregando usuários...
                                    </DropdownMenuItem>
                                  ) : availableUsers.length === 0 ? (
                                    <DropdownMenuItem disabled>
                                      Nenhum outro usuário cadastrado
                                    </DropdownMenuItem>
                                  ) : null}
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                <label className="text-sm font-medium text-foreground">Buscar procedimentos</label>
                <div className="relative">
                  <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
                  <Input
                    className="pl-9"
                    placeholder="Buscar código TUSS, nome, palavras-chave..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
              </div>

              {/* Filtros de região e tipo */}
              <div className="space-y-2">
                <FilterChips
                  selectedRegion={selectedRegion}
                  selectedType={selectedType}
                  onRegionChange={setSelectedRegion}
                  onTypeChange={setSelectedType}
                />
              </div>

              {/* Toggle de favoritos */}
              <div className="flex items-center gap-2">
                <Button
                  variant={showOnlyFavorites ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                >
                  <Heart className={showOnlyFavorites ? "h-4 w-4 fill-current" : "h-4 w-4"} />
                  {showOnlyFavorites ? 'Exibindo favoritos' : 'Exibir apenas favoritos'}
                </Button>
                {(query || selectedRegion || selectedType || showOnlyFavorites) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setQuery('');
                      setSelectedRegion(undefined);
                      setSelectedType(undefined);
                      setShowOnlyFavorites(false);
                    }}
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>

              {filteredProcedures.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {filteredProcedures.length} procedimento{filteredProcedures.length !== 1 ? 's' : ''} disponível{filteredProcedures.length !== 1 ? 'is' : ''}
                    </p>
                    {selectedProcedures.length > 0 && (
                      <p className="text-sm font-medium text-primary">
                        {selectedProcedures.length} selecionado{selectedProcedures.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {filteredProcedures.length > 0 && (
                <div className="grid gap-3 max-h-96 overflow-y-auto pr-1">
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

              {filteredProcedures.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {showOnlyFavorites 
                    ? 'Nenhum favorito encontrado. Adicione procedimentos aos favoritos primeiro.'
                    : 'Nenhum procedimento encontrado. Ajuste os filtros ou busca.'
                  }
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button className="flex-1 gap-2" onClick={handleSubmit}>
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

      {/* Modal de notificações */}
      {showNotifications && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4"
          onClick={() => setShowNotifications(false)}
        >
          <Card 
            className="w-full max-w-md max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="sticky top-0 bg-card border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notificações</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {notifications.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Nenhuma notificação
                </p>
              ) : (
                notifications.map((notification) => {
                  if (notification.type === 'package_share') {
                    return (
                      <Card key={notification.id} className={notification.read ? 'bg-muted/30' : 'border-primary'}>
                        <CardContent className="p-4 space-y-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {notification.data.from_user_name} compartilhou um pacote
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {notification.data.package_name}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 gap-2"
                              onClick={() => {
                                handleAcceptShare(notification.id, notification.data);
                                setShowNotifications(false);
                              }}
                            >
                              <Check className="h-4 w-4" />
                              Adicionar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleRejectShare(notification.id, notification.data)}
                            >
                              Recusar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                  return null;
                })
              )}
            </CardContent>
          </Card>
        </div>
      )}

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
