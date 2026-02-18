import { useMemo, useState } from 'react';
import { Package, Bell } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePackages } from '@/hooks/usePackages';
import { usePrivatePackages } from '@/hooks/usePrivatePackages';
import { useOpmes } from '@/hooks/useOpmes';
import { useProcedures } from '@/hooks/useProcedures';
import { useFavorites } from '@/hooks/useFavorites';
import { useUsers } from '@/hooks/useUsers';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { usePackageSharing } from '@/hooks/usePackageSharing';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import type { PrivatePackage, OpmeItem } from '@/types/package';
import { NotificationsModal } from './packages/NotificationsModal';
import { PackageDetailModal } from './packages/PackageDetailModal';
import { PrivatePackageDetailModal } from './packages/PrivatePackageDetailModal';
import { PackageList } from './packages/PackageList';
import { PackageForm } from './packages/PackageForm';
import { PrivatePackageList } from './packages/PrivatePackageList';
import { PrivatePackageForm } from './packages/PrivatePackageForm';
import { OpmeForm } from './packages/OpmeForm';

export default function Packages() {
  const { user } = useAuth();
  const { packages, addPackage, updatePackage, deletePackage } = usePackages();
  const {
    packages: privatePackages,
    addPackage: addPrivatePackage,
    updatePackage: updatePrivatePackage,
    deletePackage: deletePrivatePackage,
  } = usePrivatePackages();
  const { opmes, addOpme, updateOpme, deleteOpme } = useOpmes();
  const { procedures, loading } = useProcedures();
  const { favorites } = useFavorites();
  const { users } = useUsers();
  const { notifications, unreadCount, deleteNotification } = useNotifications();
  const procedureById = useMemo(() => {
    return new Map(procedures.map((procedure) => [procedure.id, procedure]));
  }, [procedures]);
  const { sharePackage, acceptShare, rejectShare } = usePackageSharing({
    packages,
    privatePackages,
    addPackage,
    addPrivatePackage,
    deleteNotification,
  });

  // UI State
  const [viewingPackageId, setViewingPackageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [primaryTab, setPrimaryTab] = useState<'standard' | 'private' | 'opme'>('standard');
  const [privateActiveTab, setPrivateActiveTab] = useState('list');
  const [viewingPrivatePackageId, setViewingPrivatePackageId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Standard Package Form State
  const [editingPackage, setEditingPackage] = useState<{
    id: string;
    name: string;
    description: string;
    procedureIds: string[];
  } | null>(null);

  // Private Package Form State
  const [editingPrivatePackage, setEditingPrivatePackage] = useState<PrivatePackage | null>(null);

  // Filtrar usuários removendo duplicatas e o usuário atual
  const availableUsers = useMemo(() => {
    const uniqueUsers = users.filter((u, index, self) =>
      index === self.findIndex((t) => t.id === u.id)
    );
    return uniqueUsers.filter(u => u.id !== user?.id);
  }, [users, user?.id]);

  const getPorteScore = (porte?: string) => {
    if (!porte) return -1;
    const match = String(porte).trim().toUpperCase().match(/(\d+)([A-Z])?/);
    if (!match) return -1;
    const num = Number.parseInt(match[1], 10);
    const letter = match[2] ? match[2].charCodeAt(0) - 64 : 0;
    return num * 100 + letter;
  };

  const sortProceduresByPorte = (list: typeof procedures) => {
    return [...list].sort((a, b) => {
      const scoreA = getPorteScore(a?.porte);
      const scoreB = getPorteScore(b?.porte);
      if (scoreA !== scoreB) return scoreB - scoreA;
      return (a?.name || '').localeCompare(b?.name || '');
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const viewingPackage = viewingPackageId ? packages.find(pkg => pkg.id === viewingPackageId) : null;
  const viewingProcedures = viewingPackage
    ? sortProceduresByPorte(
      viewingPackage.procedureIds
        .map(procId => procedureById.get(procId))
        .filter(Boolean) as typeof procedures
    )
    : [];

  const viewingPrivatePackage = viewingPrivatePackageId
    ? privatePackages.find(pkg => pkg.id === viewingPrivatePackageId)
    : null;
  const viewingPrivateProcedures = viewingPrivatePackage
    ? sortProceduresByPorte(
      viewingPrivatePackage.procedureIds
        .map(procId => procedureById.get(procId))
        .filter(Boolean) as typeof procedures
    )
    : [];
  const viewingPrivateOpmes = viewingPrivatePackage
    ? viewingPrivatePackage.opmeIds
      .map(opmeId => opmes.find(item => item.id === opmeId))
      .filter(Boolean) as OpmeItem[]
    : [];

  // Standard Package Handlers
  const handleNewPackage = () => {
    setEditingPackage(null);
    setActiveTab('create');
  };

  const handleEditPackage = (id: string) => {
    const pkg = packages.find(item => item.id === id);
    if (!pkg) return;
    setEditingPackage({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description ?? '',
      procedureIds: pkg.procedureIds,
    });
    setActiveTab('create');
  };

  const handleSubmitPackage = async (data: { name: string; description: string; procedureIds: string[] }) => {
    if (!data.name.trim()) {
      toast({
        title: 'Informe um nome',
        description: 'O pacote precisa de um nome para ser salvo.',
      });
      return;
    }

    if (data.procedureIds.length === 0) {
      toast({
        title: 'Selecione pelo menos um código',
        description: 'Adicione procedimentos TUSS ao pacote antes de salvar.',
      });
      return;
    }

    try {
      if (editingPackage?.id) {
        await updatePackage(editingPackage.id, data);
        toast({
          title: 'Pacote atualizado',
          description: 'As alterações foram salvas com sucesso.',
        });
      } else {
        await addPackage(data);
        toast({
          title: 'Pacote criado',
          description: 'Seu pacote foi criado e já está disponível.',
        });
      }

      setEditingPackage(null);
      setActiveTab('list');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Não foi possível salvar o pacote.';
      toast({
        title: 'Erro ao salvar pacote',
        description: message,
      });
    }
  };

  const handleCancelPackage = () => {
    setEditingPackage(null);
    setActiveTab('list');
  };

  // Private Package Handlers
  const handleNewPrivatePackage = () => {
    setEditingPrivatePackage(null);
    setPrivateActiveTab('create');
  };

  const handleEditPrivatePackage = (id: string) => {
    const pkg = privatePackages.find(item => item.id === id);
    if (!pkg) return;
    setEditingPrivatePackage(pkg);
    setPrivateActiveTab('create');
  };

  const handleSubmitPrivatePackage = async (data: {
    name: string;
    description: string;
    procedureIds: string[];
    opmeIds: string[];
    surgeonValue: number;
    anesthetistValue: number;
    assistantValue: number;
  }) => {
    if (!data.name.trim()) {
      toast({
        title: 'Informe um nome',
        description: 'O pacote particular precisa de um nome para ser salvo.',
      });
      return;
    }

    if (data.procedureIds.length === 0) {
      toast({
        title: 'Selecione pelo menos um código',
        description: 'Adicione procedimentos TUSS ao pacote particular antes de salvar.',
      });
      return;
    }

    const payload: Omit<PrivatePackage, 'id' | 'createdAt' | 'updatedAt'> = {
      name: data.name,
      description: data.description,
      procedureIds: data.procedureIds,
      opmeIds: data.opmeIds,
      surgeonValue: data.surgeonValue,
      anesthetistValue: data.anesthetistValue,
      assistantValue: data.assistantValue,
    };

    try {
      if (editingPrivatePackage?.id) {
        await updatePrivatePackage(editingPrivatePackage.id, payload);
        toast({
          title: 'Pacote particular atualizado',
          description: 'As alterações foram salvas com sucesso.',
        });
      } else {
        await addPrivatePackage(payload);
        toast({
          title: 'Pacote particular criado',
          description: 'Seu pacote particular foi criado e já está disponível.',
        });
      }

      setEditingPrivatePackage(null);
      setPrivateActiveTab('list');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Não foi possível salvar o pacote particular.';
      toast({
        title: 'Erro ao salvar pacote',
        description: message,
      });
    }
  };

  const handleCancelPrivatePackage = () => {
    setEditingPrivatePackage(null);
    setPrivateActiveTab('list');
  };

  const handleImportFromStandardPackage = (packageId: string) => {
    const pkg = packages.find(item => item.id === packageId);
    if (!pkg) return;

    // Count procedures that will be added (form handles the actual import)
    const count = pkg.procedureIds.length;

    toast({
      title: 'Códigos importados',
      description: `${count} procedimento${count !== 1 ? 's' : ''} do pacote "${pkg.name}" ${count !== 1 ? 'foram adicionados' : 'foi adicionado'}.`,
    });
  };

  // OPME Handlers
  const handleAddOpme = async (data: { name: string; description: string; value: number }) => {
    try {
      await addOpme(data);
      toast({
        title: 'OPME criado',
        description: 'Seu OPME foi criado e já está disponível.',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Não foi possível salvar o OPME.';
      toast({
        title: 'Erro ao salvar OPME',
        description: message,
      });
    }
  };

  const handleUpdateOpme = async (id: string, data: { name: string; description: string; value: number }) => {
    try {
      await updateOpme(id, data);
      toast({
        title: 'OPME atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Não foi possível salvar o OPME.';
      toast({
        title: 'Erro ao salvar OPME',
        description: message,
      });
    }
  };

  // Copy Handlers
  const handleCopyCodes = async (id: string) => {
    const pkg = packages.find(item => item.id === id);
    if (!pkg) return;

    const proceduresList = sortProceduresByPorte(
      pkg.procedureIds
        .map(procId => procedureById.get(procId))
        .filter(Boolean) as typeof procedures
    );

    const formatted = [
      `${pkg.name}`,
      ...(pkg.description ? [pkg.description, ''] : ['']),
      ...proceduresList.map(proc => `- ${proc!.codes.tuss} - ${proc!.name} (Porte ${proc!.porte || '-'})`),
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

  const handleCopyPrivatePackage = async (id: string) => {
    const pkg = privatePackages.find(item => item.id === id);
    if (!pkg) return;

    const proceduresList = sortProceduresByPorte(
      pkg.procedureIds
        .map(procId => procedureById.get(procId))
        .filter(Boolean) as typeof procedures
    );

    const opmeList = pkg.opmeIds
      .map(opmeId => opmes.find(item => item.id === opmeId))
      .filter(Boolean) as OpmeItem[];

    const formatted = [
      `${pkg.name}`,
      ...(pkg.description ? [pkg.description, ''] : ['']),
      `Valores:`,
      `- Cirurgião principal: ${formatCurrency(pkg.surgeonValue)}`,
      `- Anestesista: ${formatCurrency(pkg.anesthetistValue)}`,
      `- Auxiliar: ${formatCurrency(pkg.assistantValue)}`,
      '',
      `OPMEs (${opmeList.length}):`,
      ...(opmeList.length > 0
        ? opmeList.map((item) => `- ${item.name} (${formatCurrency(item.value)})`)
        : ['- Nenhum OPME selecionado']),
      '',
      'Procedimentos:',
      ...proceduresList.map(proc => `- ${proc!.codes.tuss} - ${proc!.name} (Porte ${proc!.porte || '-'})`),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(formatted);
      toast({
        title: 'Pacote copiado',
        description: 'O pacote particular foi copiado para a área de transferência.',
      });
    } catch (error) {
      console.error('Error copying private package:', error);
      toast({
        title: 'Não foi possível copiar',
        description: 'Seu navegador não permitiu a cópia automática.',
      });
    }
  };

  // Share Handlers
  const handleSharePackage = async (packageId: string, toUserId: string, packageType: 'standard' | 'private') => {
    try {
      await sharePackage(packageId, toUserId, packageType);
      toast({
        title: 'Pacote compartilhado',
        description: 'O usuário receberá uma notificação.',
      });
    } catch (error: unknown) {
      console.error('Erro ao compartilhar pacote:', error);
      toast({
        title: 'Erro ao compartilhar',
        description: error instanceof Error ? error.message : 'Não foi possível compartilhar o pacote.',
      });
    }
  };

  const handleAcceptShare = async (notificationId: string, shareData: Notification['data']) => {
    try {
      await acceptShare(notificationId, shareData);
      let packageType: 'standard' | 'private' = 'standard';
      try {
        const parsed = (typeof shareData === 'string' ? JSON.parse(shareData) : shareData) as { package_type?: string };
        packageType = parsed?.package_type === 'private' ? 'private' : 'standard';
      } catch {
        packageType = 'standard';
      }
      toast({
        title: 'Pacote adicionado',
        description: packageType === 'private'
          ? 'O pacote particular foi adicionado aos seus pacotes.'
          : 'O pacote foi adicionado aos seus pacotes.',
      });
    } catch (error: unknown) {
      console.error('Erro ao aceitar compartilhamento:', error);
      toast({
        title: 'Erro ao aceitar',
        description: error instanceof Error ? error.message : 'Não foi possível adicionar o pacote.',
      });
    }
  };

  const handleRejectShare = async (notificationId: string, shareData: Notification['data']) => {
    try {
      await rejectShare(notificationId, shareData);
      toast({
        title: 'Compartilhamento recusado',
        description: 'A solicitação foi removida.',
      });
    } catch (error: unknown) {
      console.error('Erro ao rejeitar compartilhamento:', error);
      toast({
        title: 'Erro ao rejeitar',
        description: error instanceof Error ? error.message : 'Não foi possível recusar o compartilhamento.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Modern Header with Gradient */}
      <header className="border-b border-border safe-area-top sticky top-0 z-10 bg-background/80 backdrop-blur-lg">
        <div className="medical-gradient-radial">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl">
                  <Package className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Pacotes</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
                    Agrupe códigos TUSS em pacotes reutilizáveis
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-11 w-11 rounded-full hover:bg-primary/10 transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-semibold shadow-lg animate-scale-in">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto">
          <Tabs
            value={primaryTab}
            onValueChange={(value) => setPrimaryTab(value as 'standard' | 'private' | 'opme')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8 h-11 p-1 bg-muted/50 rounded-xl">
              <TabsTrigger
                value="standard"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium text-sm sm:text-base"
              >
                Pacotes
              </TabsTrigger>
              <TabsTrigger
                value="private"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium text-sm sm:text-base"
              >
                Particular
              </TabsTrigger>
              <TabsTrigger
                value="opme"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium text-sm sm:text-base"
              >
                OPME
              </TabsTrigger>
            </TabsList>

            <TabsContent value="standard" className="animate-fade-in">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 h-11 p-1 bg-muted/50 rounded-xl">
                  <TabsTrigger
                    value="list"
                    className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium text-sm sm:text-base"
                  >
                    Meus Pacotes
                  </TabsTrigger>
                  <TabsTrigger
                    value="create"
                    className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium text-sm sm:text-base"
                  >
                    {editingPackage ? 'Editar' : 'Criar Novo'}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                  <PackageList
                    packages={packages}
                    onEdit={handleEditPackage}
                    onDelete={deletePackage}
                    onView={setViewingPackageId}
                    onShare={(pkgId, userId) => handleSharePackage(pkgId, userId, 'standard')}
                    onNewPackage={handleNewPackage}
                    availableUsers={availableUsers}
                    procedureById={procedureById}
                    sortProceduresByPorte={sortProceduresByPorte}
                  />
                </TabsContent>

                <TabsContent value="create" className="space-y-4">
                  <PackageForm
                    editingId={editingPackage?.id ?? null}
                    initialName={editingPackage?.name}
                    initialDescription={editingPackage?.description}
                    initialSelectedProcedures={editingPackage?.procedureIds}
                    procedures={procedures}
                    favorites={favorites}
                    onSubmit={handleSubmitPackage}
                    onCancel={handleCancelPackage}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="private" className="animate-fade-in">
              <Tabs value={privateActiveTab} onValueChange={setPrivateActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 h-11 p-1 bg-muted/50 rounded-xl">
                  <TabsTrigger
                    value="list"
                    className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium text-sm sm:text-base"
                  >
                    Particulares
                  </TabsTrigger>
                  <TabsTrigger
                    value="create"
                    className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium text-sm sm:text-base"
                  >
                    {editingPrivatePackage ? 'Editar' : 'Criar Particular'}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                  <PrivatePackageList
                    packages={privatePackages}
                    onEdit={handleEditPrivatePackage}
                    onDelete={deletePrivatePackage}
                    onView={setViewingPrivatePackageId}
                    onShare={(pkgId, userId) => handleSharePackage(pkgId, userId, 'private')}
                    onNewPackage={handleNewPrivatePackage}
                    availableUsers={availableUsers}
                    procedureById={procedureById}
                    sortProceduresByPorte={sortProceduresByPorte}
                    formatCurrency={formatCurrency}
                  />
                </TabsContent>

                <TabsContent value="create" className="space-y-4">
                  <PrivatePackageForm
                    editingId={editingPrivatePackage?.id ?? null}
                    initialName={editingPrivatePackage?.name}
                    initialDescription={editingPrivatePackage?.description}
                    initialSelectedProcedures={editingPrivatePackage?.procedureIds}
                    initialSelectedOpmes={editingPrivatePackage?.opmeIds}
                    initialOpmeEnabled={editingPrivatePackage ? editingPrivatePackage.opmeIds.length > 0 : false}
                    initialSurgeonValue={editingPrivatePackage?.surgeonValue}
                    initialAnesthetistValue={editingPrivatePackage?.anesthetistValue}
                    initialAssistantValue={editingPrivatePackage?.assistantValue}
                    procedures={procedures}
                    favorites={favorites}
                    opmes={opmes}
                    standardPackages={packages}
                    onSubmit={handleSubmitPrivatePackage}
                    onCancel={handleCancelPrivatePackage}
                    onImportFromPackage={handleImportFromStandardPackage}
                    formatCurrency={formatCurrency}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="opme" className="animate-fade-in">
              <OpmeForm
                opmes={opmes}
                onAdd={handleAddOpme}
                onUpdate={handleUpdateOpme}
                onDelete={deleteOpme}
                formatCurrency={formatCurrency}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BottomNav />

      <NotificationsModal
        open={showNotifications}
        notifications={notifications}
        onClose={() => setShowNotifications(false)}
        onAccept={(id, data) => {
          handleAcceptShare(id, data);
          setShowNotifications(false);
        }}
        onReject={(id, data) => handleRejectShare(id, data)}
      />

      <PackageDetailModal
        packageData={viewingPackage}
        procedures={viewingProcedures}
        onCopy={(id) => {
          handleCopyCodes(id);
          setViewingPackageId(null);
        }}
        onClose={() => setViewingPackageId(null)}
      />

      <PrivatePackageDetailModal
        packageData={viewingPrivatePackage}
        procedures={viewingPrivateProcedures}
        opmes={viewingPrivateOpmes}
        formatCurrency={formatCurrency}
        onCopy={(id) => {
          handleCopyPrivatePackage(id);
          setViewingPrivatePackageId(null);
        }}
        onClose={() => setViewingPrivatePackageId(null)}
      />
    </div>
  );
}
