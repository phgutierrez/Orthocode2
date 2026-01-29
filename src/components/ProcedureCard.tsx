import { Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Procedure, regionLabels, typeLabels } from '@/types/procedure';
import { cn } from '@/lib/utils';

interface ProcedureCardProps {
  procedure: Procedure;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClick: () => void;
}

export function ProcedureCard({ procedure, isFavorite, onToggleFavorite, onClick }: ProcedureCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(procedure.id);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 animate-fade-in"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
              {procedure.name}
            </h3>
            
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Badge variant="secondary" className="text-xs">
                {typeLabels[procedure.type]}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {regionLabels[procedure.region]}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-muted rounded-lg p-2 text-center">
                <p className="text-muted-foreground mb-0.5">CBHPM</p>
                <p className="font-mono font-medium text-foreground">{procedure.codes.cbhpm}</p>
              </div>
              <div className="bg-muted rounded-lg p-2 text-center">
                <p className="text-muted-foreground mb-0.5">TUSS</p>
                <p className="font-mono font-medium text-foreground">{procedure.codes.tuss}</p>
              </div>
              <div className="bg-muted rounded-lg p-2 text-center">
                <p className="text-muted-foreground mb-0.5">SUS</p>
                <p className="font-mono font-medium text-foreground">{procedure.codes.sus}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                CBHPM: <span className="font-semibold text-primary">{formatCurrency(procedure.values.cbhpm)}</span>
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-10 w-10"
            onClick={handleFavoriteClick}
          >
            <Heart 
              className={cn(
                "h-5 w-5 transition-colors",
                isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"
              )} 
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
