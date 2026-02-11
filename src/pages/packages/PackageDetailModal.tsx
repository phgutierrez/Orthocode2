import { Clipboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ProcedurePackage } from '@/types/package';
import type { Procedure } from '@/types/procedure';
import { regionLabels, typeLabels } from '@/types/procedure';

interface PackageDetailModalProps {
  packageData: ProcedurePackage | null;
  procedures: Procedure[];
  onCopy: (packageId: string) => void;
  onClose: () => void;
}

export function PackageDetailModal({ packageData, procedures, onCopy, onClose }: PackageDetailModalProps) {
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
                          {procedure.codes.cbhpm && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">CBHPM:</span> {procedure.codes.cbhpm}
                            </p>
                          )}
                          {procedure.codes.sus && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">SUS:</span> {procedure.codes.sus}
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
              Copiar códigos
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
