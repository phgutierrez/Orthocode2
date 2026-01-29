import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AnatomicRegion, ProcedureType, regionLabels, typeLabels } from '@/types/procedure';

interface FilterChipsProps {
  selectedRegion?: AnatomicRegion;
  selectedType?: ProcedureType;
  onRegionChange: (region?: AnatomicRegion) => void;
  onTypeChange: (type?: ProcedureType) => void;
}

const regions: AnatomicRegion[] = [
  'coluna',
  'ombro',
  'cotovelo',
  'mao-punho',
  'quadril',
  'joelho',
  'tornozelo-pe',
  'membros-inferiores',
  'membros-superiores',
];
const types: ProcedureType[] = ['cirurgico', 'ambulatorial', 'diagnostico'];

export function FilterChips({ selectedRegion, selectedType, onRegionChange, onTypeChange }: FilterChipsProps) {
  return (
    <div className="space-y-3">
      {/* Type filters */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground mr-1 self-center">Tipo:</span>
        {types.map((type) => (
          <Badge
            key={type}
            variant={selectedType === type ? 'default' : 'outline'}
            className={cn(
              "cursor-pointer transition-all hover:bg-primary/10",
              selectedType === type && "bg-primary text-primary-foreground"
            )}
            onClick={() => onTypeChange(selectedType === type ? undefined : type)}
          >
            {typeLabels[type]}
          </Badge>
        ))}
      </div>

      {/* Region filters */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground mr-1 self-center">Região:</span>
        {regions.map((region) => (
          <Badge
            key={region}
            variant={selectedRegion === region ? 'default' : 'outline'}
            className={cn(
              "cursor-pointer transition-all hover:bg-primary/10",
              selectedRegion === region && "bg-primary text-primary-foreground"
            )}
            onClick={() => onRegionChange(selectedRegion === region ? undefined : region)}
          >
            {regionLabels[region]}
          </Badge>
        ))}
      </div>
    </div>
  );
}
