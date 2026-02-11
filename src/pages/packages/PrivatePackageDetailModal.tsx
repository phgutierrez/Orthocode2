import { Clipboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PrivatePackage, OpmeItem } from '@/types/package';
import type { Procedure } from '@/types/procedure';
import { regionLabels, typeLabels } from '@/types/procedure';

interface PrivatePackageDetailModalProps {
  packageData: PrivatePackage | null;
  procedures: Procedure[];
  opmes: OpmeItem[];
  onCopy: (packageId: string) => void;
  onClose: () => void;
  formatCurrency: (value: number) => string;
}

export function PrivatePackageDetailModal({
  packageData,
  procedures,
  opmes,
  onCopy,
  onClose,
  formatCurrency,
}: PrivatePackageDetailModalProps) {
  if (!packageData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 safe-area-bottom">
      <Card className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-card border-b flex flex-row items-center justify-between space-y-0">
          <CardTitle>{packageData.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {packageData.description && (
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Descrição</h3>
              <p className="text-sm text-muted-foreground">{packageData.description}</p>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Valores do pacote</h3>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Cirurgião</p>
                <p className="text-sm font-semibold text-foreground">{formatCurrency(packageData.surgeonValue)}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Anestesista</p>
                <p className="text-sm font-semibold text-foreground">{formatCurrency(packageData.anesthetistValue)}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Auxiliar</p>
                <p className="text-sm font-semibold text-foreground">{formatCurrency(packageData.assistantValue)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">OPMEs ({opmes.length})</h3>
            {opmes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum OPME selecionado.</p>
            ) : (
              <div className="space-y-2">
                {opmes.map((item) => (
                  <Card key={item.id} className="border">
                    <CardContent className="p-4">
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(item.value)}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Procedimentos ({procedures.length})</h3>
            <div className="space-y-3">
              {procedures.map((procedure) => (
                <Card key={procedure.id} className="border">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{procedure.name}</p>
                        <div className="space-y-1 mt-2">
                          {procedure.codes.tuss && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">TUSS:</span> {procedure.codes.tuss}
                              <span className="mx-2">•</span>
                              <span className="font-medium">Porte:</span> {procedure.porte || '-'}
                            </p>
                          )}
                          {procedure.anestheticPort && procedure.anestheticPort !== '0' && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Porte Anestésico:</span> {procedure.anestheticPort}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {regionLabels[procedure.region]}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {typeLabels[procedure.type]}
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
              onClick={() => onCopy(packageData.id)}
            >
              <Clipboard className="h-4 w-4" />
              Copiar pacote
            </Button>
            <Button variant="ghost" className="flex-1" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
