import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FilterChips } from '@/components/FilterChips';
import { useDebounce } from '@/hooks/useDebounce';
import { searchProcedures } from '@/data/procedures';
import { regionLabels, typeLabels, AnatomicRegion, ProcedureType } from '@/types/procedure';

const INITIAL_VISIBLE_COUNT = 60;
const VISIBLE_INCREMENT = 40;

interface Procedure {
    id: string;
    name: string;
    codes: { tuss: string };
    region: AnatomicRegion;
    type: ProcedureType;
    porte?: string;
}

interface ProcedureSelectorProps {
    procedures: Procedure[];
    selectedProcedureIds: string[];
    favorites: string[];
    onToggleProcedure: (id: string) => void;
}

export function ProcedureSelector({
    procedures,
    selectedProcedureIds,
    favorites,
    onToggleProcedure,
}: ProcedureSelectorProps) {
    const [query, setQuery] = useState('');
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState<AnatomicRegion>();
    const [selectedType, setSelectedType] = useState<ProcedureType>();
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
    const listRef = useRef<HTMLDivElement | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const debouncedQuery = useDebounce(query, 200);

    const filteredProcedures = useMemo(() => {
        if (!Array.isArray(procedures)) return [];

        let filtered = searchProcedures(procedures, debouncedQuery?.trim() ?? '', {
            region: selectedRegion,
            type: selectedType,
        });

        if (!debouncedQuery?.trim() && !selectedRegion && !selectedType) {
            filtered = procedures;
        }

        if (showOnlyFavorites) {
            filtered = filtered.filter(p => favorites.includes(p.id));
        }

        return filtered;
    }, [procedures, debouncedQuery, selectedRegion, selectedType, showOnlyFavorites, favorites]);

    const selectedProcedureSet = useMemo(() => new Set(selectedProcedureIds), [selectedProcedureIds]);

    const orderSelectedFirst = (list: Procedure[]) => {
        const selected = list.filter(item => selectedProcedureSet.has(item.id));
        const rest = list.filter(item => !selectedProcedureSet.has(item.id));
        return [...selected, ...rest];
    };

    const orderedFilteredProcedures = useMemo(() => {
        return orderSelectedFirst(filteredProcedures);
    }, [filteredProcedures, selectedProcedureSet]);

    const selectedOrderedProcedures = useMemo(() => {
        return orderedFilteredProcedures.filter(procedure => selectedProcedureSet.has(procedure.id));
    }, [orderedFilteredProcedures, selectedProcedureSet]);

    const unselectedOrderedProcedures = useMemo(() => {
        return orderedFilteredProcedures.filter(procedure => !selectedProcedureSet.has(procedure.id));
    }, [orderedFilteredProcedures, selectedProcedureSet]);

    const visibleProcedures = useMemo(() => {
        return [
            ...selectedOrderedProcedures,
            ...unselectedOrderedProcedures.slice(0, visibleCount),
        ];
    }, [selectedOrderedProcedures, unselectedOrderedProcedures, visibleCount]);

    // Reset visible count when filters change
    useEffect(() => {
        setVisibleCount(INITIAL_VISIBLE_COUNT);
    }, [debouncedQuery, selectedRegion, selectedType, showOnlyFavorites, filteredProcedures.length]);

    // Infinite scroll observer
    useEffect(() => {
        const root = listRef.current;
        const target = sentinelRef.current;
        if (!root || !target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries[0]?.isIntersecting) return;
                setVisibleCount((current) => {
                    if (current >= unselectedOrderedProcedures.length) return current;
                    return Math.min(current + VISIBLE_INCREMENT, unselectedOrderedProcedures.length);
                });
            },
            { root, rootMargin: '0px 0px 200px 0px' }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, [unselectedOrderedProcedures.length]);

    const handleClearFilters = () => {
        setQuery('');
        setSelectedRegion(undefined);
        setSelectedType(undefined);
        setShowOnlyFavorites(false);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="procedure-search" className="text-sm font-medium text-foreground">Buscar procedimentos</label>
                <div className="relative">
                    <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
                    <Input
                        id="procedure-search"
                        className="pl-9"
                        placeholder="Buscar código TUSS, nome, palavras-chave..."
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <FilterChips
                    selectedRegion={selectedRegion}
                    selectedType={selectedType}
                    onRegionChange={setSelectedRegion}
                    onTypeChange={setSelectedType}
                />
            </div>

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
                        onClick={handleClearFilters}
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
                        {selectedProcedureIds.length > 0 && (
                            <p className="text-sm font-medium text-primary">
                                {selectedProcedureIds.length} selecionado{selectedProcedureIds.length !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {filteredProcedures.length > 0 && (
                <div ref={listRef} className="grid gap-3 max-h-96 overflow-y-auto pr-1">
                    {visibleProcedures.map((procedure) => {
                        const selected = selectedProcedureIds.includes(procedure.id);
                        return (
                            <div
                                key={procedure.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => onToggleProcedure(procedure.id)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onToggleProcedure(procedure.id);
                                    }
                                }}
                                className="text-left cursor-pointer"
                            >
                                <Card className={selected ? 'border-primary' : ''}>
                                    <CardContent className="p-4 flex items-start gap-3">
                                        <Checkbox
                                            checked={selected}
                                            className="mt-1 pointer-events-none"
                                            aria-hidden="true"
                                        />
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
                            </div>
                        );
                    })}
                    <div ref={sentinelRef} className="h-6" />
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
        </div>
    );
}
