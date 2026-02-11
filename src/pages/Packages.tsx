import { useEffect, useMemo, useRef, useState } from 'react';
import { Package, Plus, Clipboard, Pencil, Trash2, Search, Share2, Bell, Heart } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FilterChips } from '@/components/FilterChips';
import { usePackages } from '@/hooks/usePackages';
import { usePrivatePackages } from '@/hooks/usePrivatePackages';
import { useOpmes } from '@/hooks/useOpmes';
import { useProcedures } from '@/hooks/useProcedures';
import { useFavorites } from '@/hooks/useFavorites';
import { useUsers } from '@/hooks/useUsers';
import { useNotifications } from '@/hooks/useNotifications';
import { usePackageSharing } from '@/hooks/usePackageSharing';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { regionLabels, typeLabels, AnatomicRegion, ProcedureType } from '@/types/procedure';
import type { OpmeItem, PrivatePackage } from '@/types/package';
import { searchProcedures } from '@/data/procedures';
import { useDebounce } from '@/hooks/useDebounce';
import { NotificationsModal } from './packages/NotificationsModal';
import { PackageDetailModal } from './packages/PackageDetailModal';
import { PrivatePackageDetailModal } from './packages/PrivatePackageDetailModal';
import { OpmeSelectModal } from './packages/OpmeSelectModal';

const INITIAL_VISIBLE_COUNT = 60;
const VISIBLE_INCREMENT = 40;

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [query, setQuery] = useState('');
  const [packageQuery, setPackageQuery] = useState('');
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [viewingPackageId, setViewingPackageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [primaryTab, setPrimaryTab] = useState<'standard' | 'private' | 'opme'>('standard');
  const [privateActiveTab, setPrivateActiveTab] = useState('list');
  const [privateEditingId, setPrivateEditingId] = useState<string | null>(null);
  const [privateName, setPrivateName] = useState('');
  const [privateDescription, setPrivateDescription] = useState('');
  const [privateQuery, setPrivateQuery] = useState('');
  const [privatePackageQuery, setPrivatePackageQuery] = useState('');
  const [privateSelectedProcedures, setPrivateSelectedProcedures] = useState<string[]>([]);
  const [privateSelectedOpmes, setPrivateSelectedOpmes] = useState<string[]>([]);
  const [privateOpmeEnabled, setPrivateOpmeEnabled] = useState(false);
  const [showOpmeSelect, setShowOpmeSelect] = useState(false);
  const [privateSurgeonValue, setPrivateSurgeonValue] = useState(0);
  const [privateAnesthetistValue, setPrivateAnesthetistValue] = useState(0);
  const [privateAssistantValue, setPrivateAssistantValue] = useState(0);
  const [viewingPrivatePackageId, setViewingPrivatePackageId] = useState<string | null>(null);
  const [privateShowOnlyFavorites, setPrivateShowOnlyFavorites] = useState(false);
  const [privateSelectedRegion, setPrivateSelectedRegion] = useState<AnatomicRegion>();
  const [privateSelectedType, setPrivateSelectedType] = useState<ProcedureType>();
  const [opmeEditingId, setOpmeEditingId] = useState<string | null>(null);
  const [opmeName, setOpmeName] = useState('');
  const [opmeDescription, setOpmeDescription] = useState('');
  const [opmeValue, setOpmeValue] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<AnatomicRegion>();
  const [selectedType, setSelectedType] = useState<ProcedureType>();
  const debouncedQuery = useDebounce(query, 200);
  const debouncedPrivateQuery = useDebounce(privateQuery, 200);
  const debouncedPackageQuery = useDebounce(packageQuery, 200);
  const debouncedPrivatePackageQuery = useDebounce(privatePackageQuery, 200);
  const [standardVisibleCount, setStandardVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [privateVisibleCount, setPrivateVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const standardListRef = useRef<HTMLDivElement | null>(null);
  const standardSentinelRef = useRef<HTMLDivElement | null>(null);
  const privateListRef = useRef<HTMLDivElement | null>(null);
  const privateSentinelRef = useRef<HTMLDivElement | null>(null);

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

  const filteredProcedures = useMemo(() => {
    if (!Array.isArray(procedures)) return [];
    
    // Aplicar filtros de região e tipo primeiro
    let filtered = searchProcedures(procedures, debouncedQuery?.trim() ?? '', {
      region: selectedRegion,
      type: selectedType,
    });
    
    // Se não houver query, região ou tipo, mostrar todos
    if (!debouncedQuery?.trim() && !selectedRegion && !selectedType) {
      filtered = procedures;
    }
    
    // Filtrar apenas favoritos se ativado
    if (showOnlyFavorites) {
      filtered = filtered.filter(p => favorites.includes(p.id));
    }
    
    return filtered;
  }, [procedures, debouncedQuery, selectedRegion, selectedType, showOnlyFavorites, favorites]);

  const filteredPrivateProcedures = useMemo(() => {
    if (!Array.isArray(procedures)) return [];

    let filtered = searchProcedures(procedures, debouncedPrivateQuery?.trim() ?? '', {
      region: privateSelectedRegion,
      type: privateSelectedType,
    });

    if (!debouncedPrivateQuery?.trim() && !privateSelectedRegion && !privateSelectedType) {
      filtered = procedures;
    }

    if (privateShowOnlyFavorites) {
      filtered = filtered.filter((p) => favorites.includes(p.id));
    }

    return filtered;
  }, [procedures, debouncedPrivateQuery, privateSelectedRegion, privateSelectedType, privateShowOnlyFavorites, favorites]);

  const orderSelectedFirst = (list: typeof procedures, selectedIds: string[]) => {
    const selectedSet = new Set(selectedIds);
    const selected = list.filter((item) => selectedSet.has(item.id));
    const rest = list.filter((item) => !selectedSet.has(item.id));
    return [...selected, ...rest];
  };

  const orderedFilteredProcedures = useMemo(() => {
    return orderSelectedFirst(filteredProcedures, selectedProcedures);
  }, [filteredProcedures, selectedProcedures]);

  const orderedFilteredPrivateProcedures = useMemo(() => {
    return orderSelectedFirst(filteredPrivateProcedures, privateSelectedProcedures);
  }, [filteredPrivateProcedures, privateSelectedProcedures]);

  const selectedProcedureSet = useMemo(() => new Set(selectedProcedures), [selectedProcedures]);
  const selectedPrivateProcedureSet = useMemo(() => new Set(privateSelectedProcedures), [privateSelectedProcedures]);

  const selectedOrderedProcedures = useMemo(() => {
    return orderedFilteredProcedures.filter((procedure) => selectedProcedureSet.has(procedure.id));
  }, [orderedFilteredProcedures, selectedProcedureSet]);

  const unselectedOrderedProcedures = useMemo(() => {
    return orderedFilteredProcedures.filter((procedure) => !selectedProcedureSet.has(procedure.id));
  }, [orderedFilteredProcedures, selectedProcedureSet]);

  const selectedOrderedPrivateProcedures = useMemo(() => {
    return orderedFilteredPrivateProcedures.filter((procedure) => selectedPrivateProcedureSet.has(procedure.id));
  }, [orderedFilteredPrivateProcedures, selectedPrivateProcedureSet]);

  const unselectedOrderedPrivateProcedures = useMemo(() => {
    return orderedFilteredPrivateProcedures.filter((procedure) => !selectedPrivateProcedureSet.has(procedure.id));
  }, [orderedFilteredPrivateProcedures, selectedPrivateProcedureSet]);

  const visibleStandardProcedures = useMemo(() => {
    return [
      ...selectedOrderedProcedures,
      ...unselectedOrderedProcedures.slice(0, standardVisibleCount),
    ];
  }, [selectedOrderedProcedures, unselectedOrderedProcedures, standardVisibleCount]);

  const visiblePrivateProcedures = useMemo(() => {
    return [
      ...selectedOrderedPrivateProcedures,
      ...unselectedOrderedPrivateProcedures.slice(0, privateVisibleCount),
    ];
  }, [selectedOrderedPrivateProcedures, unselectedOrderedPrivateProcedures, privateVisibleCount]);

  const filteredPackages = useMemo(() => {
    const safeQuery = debouncedPackageQuery?.trim() ?? '';
    if (!safeQuery) return packages;
    const q = safeQuery.toLowerCase();
    return packages.filter((pkg) => {
      return (
        pkg.name?.toLowerCase().includes(q) ||
        pkg.description?.toLowerCase().includes(q)
      );
    });
  }, [debouncedPackageQuery, packages]);

  const filteredPrivatePackages = useMemo(() => {
    const safeQuery = debouncedPrivatePackageQuery?.trim() ?? '';
    if (!safeQuery) return privatePackages;
    const q = safeQuery.toLowerCase();
    return privatePackages.filter((pkg) => {
      return (
        pkg.name?.toLowerCase().includes(q) ||
        pkg.description?.toLowerCase().includes(q)
      );
    });
  }, [debouncedPrivatePackageQuery, privatePackages]);

  useEffect(() => {
    setStandardVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [debouncedQuery, selectedRegion, selectedType, showOnlyFavorites, filteredProcedures.length]);

  useEffect(() => {
    setPrivateVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [debouncedPrivateQuery, privateSelectedRegion, privateSelectedType, privateShowOnlyFavorites, filteredPrivateProcedures.length]);

  useEffect(() => {
    const root = standardListRef.current;
    const target = standardSentinelRef.current;
    if (!root || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setStandardVisibleCount((current) => {
          if (current >= unselectedOrderedProcedures.length) return current;
          return Math.min(current + VISIBLE_INCREMENT, unselectedOrderedProcedures.length);
        });
      },
      { root, rootMargin: '0px 0px 200px 0px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [unselectedOrderedProcedures.length]);

  useEffect(() => {
    const root = privateListRef.current;
    const target = privateSentinelRef.current;
    if (!root || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setPrivateVisibleCount((current) => {
          if (current >= unselectedOrderedPrivateProcedures.length) return current;
          return Math.min(current + VISIBLE_INCREMENT, unselectedOrderedPrivateProcedures.length);
        });
      },
      { root, rootMargin: '0px 0px 200px 0px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [unselectedOrderedPrivateProcedures.length]);

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

  const resetStandardForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setQuery('');
    setSelectedProcedures([]);
    setShowOnlyFavorites(false);
    setSelectedRegion(undefined);
    setSelectedType(undefined);
  };

  const resetPrivateForm = () => {
    setPrivateEditingId(null);
    setPrivateName('');
    setPrivateDescription('');
    setPrivateQuery('');
    setPrivateSelectedProcedures([]);
    setPrivateSelectedOpmes([]);
    setPrivateOpmeEnabled(false);
    setShowOpmeSelect(false);
    setPrivateSurgeonValue(0);
    setPrivateAnesthetistValue(0);
    setPrivateAssistantValue(0);
    setPrivateShowOnlyFavorites(false);
    setPrivateSelectedRegion(undefined);
    setPrivateSelectedType(undefined);
  };

  const resetOpmeForm = () => {
    setOpmeEditingId(null);
    setOpmeName('');
    setOpmeDescription('');
    setOpmeValue(0);
  };

  const handleToggleProcedure = (id: string) => {
    setSelectedProcedures((current) =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    );
  };

  const handleTogglePrivateProcedure = (id: string) => {
    setPrivateSelectedProcedures((current) =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    );
  };

  const handleTogglePrivateOpme = (id: string) => {
    setPrivateSelectedOpmes((current) =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    );
  };

  const handleImportFromStandardPackage = (id: string) => {
    const pkg = packages.find(item => item.id === id);
    if (!pkg) return;

    const current = new Set(privateSelectedProcedures);
    const before = current.size;
    pkg.procedureIds.forEach(procId => current.add(procId));

    const added = current.size - before;
    setPrivateSelectedProcedures(Array.from(current));

    toast({
      title: 'Códigos importados',
      description: added > 0
        ? `${added} procedimento${added !== 1 ? 's' : ''} adicionado${added !== 1 ? 's' : ''}.`
        : 'Todos os códigos desse pacote já estavam selecionados.',
    });
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

      resetStandardForm();
    } catch (error: any) {
      const message = error?.message || 'Não foi possível salvar o pacote.';
      toast({
        title: 'Erro ao salvar pacote',
        description: message,
      });
    }
  };

  const handleNewPackage = () => {
    resetStandardForm();
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

  const handleNewPrivatePackage = () => {
    resetPrivateForm();
    setPrivateActiveTab('create');
  };

  const handleEditPrivate = (id: string) => {
    const pkg = privatePackages.find(item => item.id === id);
    if (!pkg) return;
    setPrivateEditingId(pkg.id);
    setPrivateName(pkg.name);
    setPrivateDescription(pkg.description ?? '');
    setPrivateSelectedProcedures(pkg.procedureIds);
    setPrivateSelectedOpmes(pkg.opmeIds);
    setPrivateOpmeEnabled(pkg.opmeIds.length > 0);
    setShowOpmeSelect(false);
    setPrivateSurgeonValue(pkg.surgeonValue ?? 0);
    setPrivateAnesthetistValue(pkg.anesthetistValue ?? 0);
    setPrivateAssistantValue(pkg.assistantValue ?? 0);
    setPrivateQuery('');
    setPrivateActiveTab('create');
  };

  const handlePrivateSubmit = async () => {
    if (!privateName.trim()) {
      toast({
        title: 'Informe um nome',
        description: 'O pacote particular precisa de um nome para ser salvo.',
      });
      return;
    }

    if (privateSelectedProcedures.length === 0) {
      toast({
        title: 'Selecione pelo menos um código',
        description: 'Adicione procedimentos TUSS ao pacote particular antes de salvar.',
      });
      return;
    }

    const payload: Omit<PrivatePackage, 'id' | 'createdAt' | 'updatedAt'> = {
      name: privateName.trim(),
      description: privateDescription.trim(),
      procedureIds: privateSelectedProcedures,
      opmeIds: privateOpmeEnabled ? privateSelectedOpmes : [],
      surgeonValue: privateSurgeonValue || 0,
      anesthetistValue: privateAnesthetistValue || 0,
      assistantValue: privateAssistantValue || 0,
    };

    try {
      if (privateEditingId) {
        await updatePrivatePackage(privateEditingId, payload);
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

      resetPrivateForm();
    } catch (error: any) {
      const message = error?.message || 'Não foi possível salvar o pacote particular.';
      toast({
        title: 'Erro ao salvar pacote',
        description: message,
      });
    }
  };

  const handleOpmeSubmit = async () => {
    if (!opmeName.trim()) {
      toast({
        title: 'Informe um nome',
        description: 'O OPME precisa de um nome para ser salvo.',
      });
      return;
    }

    const payload = {
      name: opmeName.trim(),
      description: opmeDescription.trim(),
      value: opmeValue || 0,
    };

    try {
      if (opmeEditingId) {
        await updateOpme(opmeEditingId, payload);
        toast({
          title: 'OPME atualizado',
          description: 'As alterações foram salvas com sucesso.',
        });
      } else {
        await addOpme(payload);
        toast({
          title: 'OPME criado',
          description: 'Seu OPME foi criado e já está disponível.',
        });
      }

      resetOpmeForm();
    } catch (error: any) {
      const message = error?.message || 'Não foi possível salvar o OPME.';
      toast({
        title: 'Erro ao salvar OPME',
        description: message,
      });
    }
  };

  const handleOpmeEdit = (id: string) => {
    const opme = opmes.find(item => item.id === id);
    if (!opme) return;
    setOpmeEditingId(opme.id);
    setOpmeName(opme.name);
    setOpmeDescription(opme.description ?? '');
    setOpmeValue(opme.value ?? 0);
  };

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

  const handleSharePackage = async (packageId: string, toUserId: string, packageType: 'standard' | 'private') => {
    try {
      await sharePackage(packageId, toUserId, packageType);
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
    try {
      await acceptShare(notificationId, shareData);
      let packageType: 'standard' | 'private' = 'standard';
      try {
        const parsed = typeof shareData === 'string' ? JSON.parse(shareData) : shareData;
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
    } catch (error: any) {
      console.error('Erro ao aceitar compartilhamento:', error);
      toast({
        title: 'Erro ao aceitar',
        description: error.message || 'Não foi possível adicionar o pacote.',
      });
    }
  };

  const handleRejectShare = async (notificationId: string, shareData: any) => {
    try {
      await rejectShare(notificationId, shareData);
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
          <Tabs
            value={primaryTab}
            onValueChange={(value) => setPrimaryTab(value as 'standard' | 'private' | 'opme')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="standard">Pacotes</TabsTrigger>
              <TabsTrigger value="private">Particular</TabsTrigger>
              <TabsTrigger value="opme">OPME</TabsTrigger>
            </TabsList>

            <TabsContent value="standard">
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
                    const proceduresList = sortProceduresByPorte(
                      pkg.procedureIds
                        .map(procId => procedureById.get(procId))
                        .filter(Boolean) as typeof procedures
                    );

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
                                      onClick={() => handleSharePackage(pkg.id, u.id, 'standard')}
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
                                {procedure!.codes.tuss} · Porte {procedure!.porte || '-'}
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
                <div ref={standardListRef} className="grid gap-3 max-h-96 overflow-y-auto pr-1">
                  {visibleStandardProcedures.map((procedure) => {
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
                  <div ref={standardSentinelRef} className="h-6" />
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
                  <Button variant="outline" onClick={resetStandardForm}>
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="private">
          <Tabs value={privateActiveTab} onValueChange={setPrivateActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="list">Particulares</TabsTrigger>
              <TabsTrigger value="create">
                {privateEditingId ? 'Editar' : 'Criar Particular'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              {privatePackages.length > 0 && (
                <div className="relative">
                  <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
                  <Input
                    className="pl-9"
                    placeholder="Buscar pacotes particulares..."
                    value={privatePackageQuery}
                    onChange={(event) => setPrivatePackageQuery(event.target.value)}
                  />
                </div>
              )}

              {privatePackages.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center space-y-4">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div className="space-y-2">
                      <p className="text-muted-foreground">Nenhum pacote particular criado ainda</p>
                      <Button onClick={handleNewPrivatePackage} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Criar primeiro pacote particular
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : filteredPrivatePackages.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Nenhum pacote particular encontrado
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredPrivatePackages.map((pkg) => {
                    const proceduresList = sortProceduresByPorte(
                      pkg.procedureIds
                        .map(procId => procedureById.get(procId))
                        .filter(Boolean) as typeof procedures
                    );

                    return (
                      <Card
                        key={pkg.id}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => setViewingPrivatePackageId(pkg.id)}
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
                              <div className="text-xs text-muted-foreground mt-2 space-y-1">
                                <p>
                                  {proceduresList.length} procedimento{proceduresList.length !== 1 ? 's' : ''}
                                  {' '}• {pkg.opmeIds.length} OPME{pkg.opmeIds.length !== 1 ? 's' : ''}
                                </p>
                                <p>
                                  Cirurgião: {formatCurrency(pkg.surgeonValue)} · Anestesista: {formatCurrency(pkg.anesthetistValue)}
                                </p>
                              </div>
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
                                      onClick={() => handleSharePackage(pkg.id, u.id, 'private')}
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
                                onClick={() => handleEditPrivate(pkg.id)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => deletePrivatePackage(pkg.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {proceduresList.slice(0, 3).map((procedure) => (
                              <Badge key={procedure!.id} variant="secondary" className="text-xs">
                                {procedure!.codes.tuss} · Porte {procedure!.porte || '-'}
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

              {privatePackages.length > 0 && (
                <Button
                  onClick={handleNewPrivatePackage}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  Criar novo pacote particular
                </Button>
              )}
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {privateEditingId ? 'Editar pacote particular' : 'Novo pacote particular'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Nome do pacote</label>
                    <Input
                      placeholder="Ex.: Artroscopia Particular"
                      value={privateName}
                      onChange={(event) => setPrivateName(event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Descrição (opcional)</label>
                    <Textarea
                      placeholder="Detalhes adicionais para este pacote"
                      value={privateDescription}
                      onChange={(event) => setPrivateDescription(event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Valores do pacote</label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Cirurgião principal</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={privateSurgeonValue}
                          onChange={(event) => setPrivateSurgeonValue(Number(event.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Anestesista</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={privateAnesthetistValue}
                          onChange={(event) => setPrivateAnesthetistValue(Number(event.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Auxiliar</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={privateAssistantValue}
                          onChange={(event) => setPrivateAssistantValue(Number(event.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">OPME</label>
                    <RadioGroup
                      className="flex gap-4"
                      value={privateOpmeEnabled ? 'yes' : 'no'}
                      onValueChange={(value) => {
                        const enabled = value === 'yes';
                        setPrivateOpmeEnabled(enabled);
                        if (!enabled) {
                          setPrivateSelectedOpmes([]);
                        }
                      }}
                    >
                      <label className="flex items-center gap-2 text-sm">
                        <RadioGroupItem value="yes" />
                        Sim
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <RadioGroupItem value="no" />
                        Não
                      </label>
                    </RadioGroup>

                    {privateOpmeEnabled && (
                      <div className="flex items-center justify-between gap-3 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          className="gap-2"
                          onClick={() => setShowOpmeSelect(true)}
                        >
                          <Clipboard className="h-4 w-4" />
                          Selecionar OPME
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {privateSelectedOpmes.length} selecionado{privateSelectedOpmes.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Importar códigos</label>
                    {packages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhum pacote encontrado para importar.
                      </p>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="gap-2">
                            <Clipboard className="h-4 w-4" />
                            Importar de pacote
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
                          {packages.map((pkg) => (
                            <DropdownMenuItem
                              key={pkg.id}
                              onClick={() => handleImportFromStandardPackage(pkg.id)}
                            >
                              {pkg.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Buscar procedimentos</label>
                    <div className="relative">
                      <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
                      <Input
                        className="pl-9"
                        placeholder="Buscar código TUSS, nome, palavras-chave..."
                        value={privateQuery}
                        onChange={(event) => setPrivateQuery(event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FilterChips
                      selectedRegion={privateSelectedRegion}
                      selectedType={privateSelectedType}
                      onRegionChange={setPrivateSelectedRegion}
                      onTypeChange={setPrivateSelectedType}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={privateShowOnlyFavorites ? 'default' : 'outline'}
                      size="sm"
                      className="gap-2"
                      onClick={() => setPrivateShowOnlyFavorites(!privateShowOnlyFavorites)}
                    >
                      <Heart className={privateShowOnlyFavorites ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
                      {privateShowOnlyFavorites ? 'Exibindo favoritos' : 'Exibir apenas favoritos'}
                    </Button>
                    {(privateQuery || privateSelectedRegion || privateSelectedType || privateShowOnlyFavorites) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPrivateQuery('');
                          setPrivateSelectedRegion(undefined);
                          setPrivateSelectedType(undefined);
                          setPrivateShowOnlyFavorites(false);
                        }}
                      >
                        Limpar filtros
                      </Button>
                    )}
                  </div>

                  {filteredPrivateProcedures.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          {filteredPrivateProcedures.length} procedimento{filteredPrivateProcedures.length !== 1 ? 's' : ''} disponível{filteredPrivateProcedures.length !== 1 ? 'is' : ''}
                        </p>
                        {privateSelectedProcedures.length > 0 && (
                          <p className="text-sm font-medium text-primary">
                            {privateSelectedProcedures.length} selecionado{privateSelectedProcedures.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {filteredPrivateProcedures.length > 0 && (
                    <div ref={privateListRef} className="grid gap-3 max-h-96 overflow-y-auto pr-1">
                      {visiblePrivateProcedures.map((procedure) => {
                        const selected = privateSelectedProcedures.includes(procedure.id);
                        return (
                          <button
                            key={procedure.id}
                            type="button"
                            onClick={() => handleTogglePrivateProcedure(procedure.id)}
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
                      <div ref={privateSentinelRef} className="h-6" />
                    </div>
                  )}

                  {filteredPrivateProcedures.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {privateShowOnlyFavorites
                        ? 'Nenhum favorito encontrado. Adicione procedimentos aos favoritos primeiro.'
                        : 'Nenhum procedimento encontrado. Ajuste os filtros ou busca.'}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button className="flex-1 gap-2" onClick={handlePrivateSubmit}>
                      <Plus className="h-4 w-4" />
                      {privateEditingId ? 'Salvar alterações' : 'Criar pacote particular'}
                    </Button>
                    {privateEditingId && (
                      <Button variant="outline" onClick={resetPrivateForm}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="opme">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{opmeEditingId ? 'Editar OPME' : 'Novo OPME'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nome do OPME</label>
                  <Input
                    placeholder="Ex.: Placa bloqueada"
                    value={opmeName}
                    onChange={(event) => setOpmeName(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Descrição (opcional)</label>
                  <Textarea
                    placeholder="Detalhes do OPME"
                    value={opmeDescription}
                    onChange={(event) => setOpmeDescription(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Valor</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={opmeValue}
                    onChange={(event) => setOpmeValue(Number(event.target.value) || 0)}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button className="flex-1 gap-2" onClick={handleOpmeSubmit}>
                    <Plus className="h-4 w-4" />
                    {opmeEditingId ? 'Salvar OPME' : 'Criar OPME'}
                  </Button>
                  {opmeEditingId && (
                    <Button variant="outline" onClick={resetOpmeForm}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">OPMEs cadastrados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {opmes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Nenhum OPME cadastrado.
                  </p>
                ) : (
                  opmes.map((item) => (
                    <Card key={item.id} className="border">
                      <CardContent className="p-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(item.value)}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpmeEdit(item.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => deleteOpme(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
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

      <OpmeSelectModal
        open={showOpmeSelect}
        opmes={opmes}
        selectedIds={privateSelectedOpmes}
        onToggle={handleTogglePrivateOpme}
        onClose={() => setShowOpmeSelect(false)}
        formatCurrency={formatCurrency}
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
