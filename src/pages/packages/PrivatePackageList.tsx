import { useMemo, useState } from 'react';
import { Package, Plus, Search, Pencil, Trash2, Share2, GripVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useDebounce } from '@/hooks/useDebounce';
import { useHaptics } from '@/hooks/useHaptics';
import { useSortablePackages } from '@/hooks/useSortablePackages';
import { PackageListSkeleton } from './PackageListSkeleton';
import type { PrivatePackage } from '@/types/package';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Procedure {
    id: string;
    name: string;
    codes: { tuss: string };
    porte?: string;
}

interface User {
    id: string;
    name?: string;
    email: string;
}

interface PrivatePackageListProps {
    packages: PrivatePackage[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onView: (id: string) => void;
    onShare: (packageId: string, userId: string) => void;
    onNewPackage: () => void;
    availableUsers: User[];
    procedureById: Map<string, Procedure>;
    sortProceduresByPorte: (procedures: Procedure[]) => Procedure[];
    formatCurrency: (value: number) => string;
    isLoading?: boolean;
}

interface PrivatePackageCardProps {
    pkg: PrivatePackage;
    proceduresList: Procedure[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onView: (id: string) => void;
    onShare: (packageId: string, userId: string) => void;
    availableUsers: User[];
    formatCurrency: (value: number) => string;
    isDragging?: boolean;
}

function PrivatePackageCard({
    pkg,
    proceduresList,
    onEdit,
    onDelete,
    onView,
    onShare,
    availableUsers,
    formatCurrency,
    isDragging = false,
}: PrivatePackageCardProps) {
    const { triggerLight, triggerHeavy, triggerSuccess } = useHaptics();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: pkg.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className={isSortableDragging ? 'dragging-card' : ''}>
            <Card
                className={`card-hover cursor-pointer group hover:border-primary/50 hover:shadow-lg transition-all duration-300 overflow-hidden ${isDragging ? 'drag-overlay-card' : ''}`}
                onClick={() => {
                    triggerLight();
                    onView(pkg.id);
                }}
            >
                <CardContent className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                {pkg.name}
                            </h3>
                            {pkg.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5">
                                    {pkg.description}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {/* Drag handle */}
                            <div
                                className="drag-handle p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity"
                                {...attributes}
                                {...listeners}
                                title="Arrastar para reordenar"
                            >
                                <GripVertical className="h-4 w-4" />
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 hover:bg-primary/10 ripple-container"
                                            onClick={() => triggerLight()}
                                        >
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto w-56">
                                        {availableUsers.map(u => (
                                            <DropdownMenuItem
                                                key={u.id}
                                                onClick={() => {
                                                    triggerSuccess();
                                                    onShare(pkg.id, u.id);
                                                }}
                                            >
                                                {u.name || u.email}
                                            </DropdownMenuItem>
                                        ))}
                                        {availableUsers.length === 0 && (
                                            <DropdownMenuItem disabled>
                                                Nenhum outro usuário cadastrado
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 hover:bg-primary/10 ripple-container"
                                    onClick={() => {
                                        triggerLight();
                                        onEdit(pkg.id);
                                    }}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 hover:bg-destructive/10 ripple-container"
                                    onClick={() => {
                                        triggerHeavy();
                                        onDelete(pkg.id);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                            <Package className="h-3.5 w-3.5" />
                            {proceduresList.length} procedimento{proceduresList.length !== 1 ? 's' : ''}
                        </div>
                        {pkg.opmeIds.length > 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-500 rounded-full text-xs font-medium">
                                <Package className="h-3.5 w-3.5" />
                                {pkg.opmeIds.length} OPME{pkg.opmeIds.length !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>

                    {/* Values Display */}
                    <div className="space-y-2 pb-2 border-b border-border">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="space-y-1">
                                <span className="text-muted-foreground block">Cirurgião</span>
                                <span className="font-semibold text-sm text-foreground">{formatCurrency(pkg.surgeonValue)}</span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground block">Anestesista</span>
                                <span className="font-semibold text-sm text-foreground">{formatCurrency(pkg.anesthetistValue)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Procedure Badges */}
                    {proceduresList.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {proceduresList.slice(0, 3).map((procedure) => (
                                <Badge
                                    key={procedure!.id}
                                    variant="secondary"
                                    className="text-xs font-medium px-2.5 py-1"
                                >
                                    {procedure!.codes.tuss} · Porte {procedure!.porte || '-'}
                                </Badge>
                            ))}
                            {proceduresList.length > 3 && (
                                <Badge variant="outline" className="text-xs font-medium">
                                    +{proceduresList.length - 3} mais
                                </Badge>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export function PrivatePackageList({
    packages,
    onEdit,
    onDelete,
    onView,
    onShare,
    onNewPackage,
    availableUsers,
    procedureById,
    sortProceduresByPorte,
    formatCurrency,
    isLoading = false,
}: PrivatePackageListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeId, setActiveId] = useState<string | null>(null);
    const debouncedQuery = useDebounce(searchQuery, 200);
    const { triggerLight } = useHaptics();

    const { orderedItems, handleDragEnd } = useSortablePackages(packages, 'private-package-list-order');

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const filteredPackages = useMemo(() => {
        const safeQuery = debouncedQuery?.trim() ?? '';
        if (!safeQuery) return orderedItems;
        const q = safeQuery.toLowerCase();
        return orderedItems.filter((pkg) => {
            return (
                pkg.name?.toLowerCase().includes(q) ||
                pkg.description?.toLowerCase().includes(q)
            );
        });
    }, [debouncedQuery, orderedItems]);

    if (isLoading) {
        return <PackageListSkeleton count={4} />;
    }

    if (packages.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center space-y-4">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div className="space-y-2">
                        <p className="text-muted-foreground">Nenhum pacote particular criado ainda</p>
                        <Button
                            onClick={() => { triggerLight(); onNewPackage(); }}
                            className="gap-2 ripple-container"
                        >
                            <Plus className="h-4 w-4" />
                            Criar primeiro pacote particular
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const activePackage = activeId ? packages.find(p => p.id === activeId) : null;
    const activeProcedures = activePackage
        ? sortProceduresByPorte(
            activePackage.procedureIds
                .map(id => procedureById.get(id))
                .filter(Boolean) as Procedure[]
        )
        : [];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Search Bar */}
            <div className="relative">
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3.5" />
                <Input
                    id="private-package-search"
                    className="pl-9 h-11 text-base"
                    placeholder="Buscar pacotes particulares..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                />
            </div>

            {filteredPackages.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="p-8 text-center text-muted-foreground">
                        Nenhum pacote particular encontrado
                    </CardContent>
                </Card>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={({ active }) => setActiveId(active.id as string)}
                    onDragEnd={(event) => {
                        setActiveId(null);
                        handleDragEnd(event);
                    }}
                    onDragCancel={() => setActiveId(null)}
                >
                    <SortableContext items={filteredPackages.map(p => p.id)} strategy={rectSortingStrategy}>
                        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                            {filteredPackages.map((pkg) => {
                                const proceduresList = sortProceduresByPorte(
                                    pkg.procedureIds
                                        .map(procId => procedureById.get(procId))
                                        .filter(Boolean) as Procedure[]
                                );
                                return (
                                    <PrivatePackageCard
                                        key={pkg.id}
                                        pkg={pkg}
                                        proceduresList={proceduresList}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onView={onView}
                                        onShare={onShare}
                                        availableUsers={availableUsers}
                                        formatCurrency={formatCurrency}
                                    />
                                );
                            })}
                        </div>
                    </SortableContext>

                    <DragOverlay>
                        {activePackage && (
                            <PrivatePackageCard
                                pkg={activePackage}
                                proceduresList={activeProcedures}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onView={onView}
                                onShare={onShare}
                                availableUsers={availableUsers}
                                formatCurrency={formatCurrency}
                                isDragging
                            />
                        )}
                    </DragOverlay>
                </DndContext>
            )}

            {/* New Package Button */}
            <Button
                onClick={() => { triggerLight(); onNewPackage(); }}
                className="w-full h-12 gap-2 text-base font-medium shadow-sm hover:shadow-md transition-shadow ripple-container"
                variant="outline"
            >
                <Plus className="h-5 w-5" />
                Criar novo pacote particular
            </Button>
        </div>
    );
}
