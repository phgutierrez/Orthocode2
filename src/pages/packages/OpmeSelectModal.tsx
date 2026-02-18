import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { OpmeItem } from '@/types/package';

interface OpmeSelectModalProps {
  open: boolean;
  opmes: OpmeItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onClose: () => void;
  formatCurrency: (value: number) => string;
}

export function OpmeSelectModal({
  open,
  opmes,
  selectedIds,
  onToggle,
  onClose,
  formatCurrency,
}: OpmeSelectModalProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return opmes;
    return opmes.filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q)
      );
    });
  }, [opmes, query]);

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Selecionar OPME</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            id="opme-select-search"
            placeholder="Buscar OPME..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum OPME encontrado.
            </p>
          ) : (
            <div className="grid gap-2">
              {filtered.map((item) => {
                const selected = selectedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onToggle(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onToggle(item.id);
                      }
                    }}
                    className="text-left cursor-pointer"
                  >
                    <Card className={selected ? 'border-primary' : ''}>
                      <CardContent className="p-3 flex items-start gap-3">
                        <Checkbox
                          checked={selected}
                          className="mt-1 pointer-events-none"
                          aria-hidden="true"
                        />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(item.value)}
                          </p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2">
            <Button className="w-full" onClick={onClose}>
              Concluir seleção
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
