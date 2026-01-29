import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Copy, Clock, Syringe, FileText, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BottomNav } from '@/components/BottomNav';
import { getProcedureById } from '@/data/procedures';
import { useFavorites } from '@/hooks/useFavorites';
import { useProcedures } from '@/hooks/useProcedures';
import { regionLabels, typeLabels } from '@/types/procedure';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ProcedureDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { procedures, loading } = useProcedures();
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const procedure = id && !loading ? getProcedureById(procedures, id) : undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!procedure) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Procedimento não encontrado</h1>
          <Button onClick={() => navigate('/')}>Voltar à busca</Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: 'Copiado!',
        description: `${fieldName} copiado para a área de transferência.`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o texto.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyAll = async () => {
    const text = `
${procedure.name}

CÓDIGOS:
CBHPM: ${procedure.codes.cbhpm}
TUSS: ${procedure.codes.tuss}
SUS: ${procedure.codes.sus}

VALORES:
CBHPM: ${formatCurrency(procedure.values.cbhpm)}
TUSS: ${formatCurrency(procedure.values.tuss)}
SUS: ${formatCurrency(procedure.values.sus)}

Porte Anestésico: ${procedure.anestheticPort}
UCO: ${procedure.uco}
${procedure.surgicalTime ? `Tempo Cirúrgico: ${procedure.surgicalTime} min` : ''}

CIDs: ${procedure.cids.join(', ')}

${procedure.description}
    `.trim();

    handleCopy(text, 'Informações completas');
  };

  const favorite = isFavorite(procedure.id);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="medical-gradient pt-4 pb-8 px-4 safe-area-top">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => toggleFavorite(procedure.id)}
              >
                <Heart className={cn("h-6 w-6", favorite && "fill-current")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/20"
                onClick={handleCopyAll}
              >
                <Copy className="h-6 w-6" />
              </Button>
            </div>
          </div>

          <h1 className="text-xl font-bold text-primary-foreground leading-tight">
            {procedure.name}
          </h1>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className="bg-primary-foreground/20 text-primary-foreground border-0">
              {typeLabels[procedure.type]}
            </Badge>
            <Badge className="bg-primary-foreground/20 text-primary-foreground border-0">
              {regionLabels[procedure.region]}
            </Badge>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 -mt-4">
        <div className="max-w-2xl mx-auto space-y-4">
          
          {/* Codes Card */}
          <Card className="animate-slide-up">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Códigos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'CBHPM', code: procedure.codes.cbhpm, value: procedure.values.cbhpm },
                { label: 'TUSS', code: procedure.codes.tuss, value: procedure.values.tuss },
                { label: 'SUS', code: procedure.codes.sus, value: procedure.values.sus },
              ].map(({ label, code, value }) => (
                <div key={label} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="font-mono font-semibold text-foreground">{code}</p>
                    <p className="text-sm text-primary font-medium">{formatCurrency(value)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(code, `Código ${label}`)}
                  >
                    {copiedField === `Código ${label}` ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Technical Info Card */}
          <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Syringe className="h-5 w-5 text-primary" />
                Informações Técnicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Porte Anestésico</p>
                  <p className="text-xl font-bold text-foreground">{procedure.anestheticPort}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">UCO</p>
                  <p className="text-xl font-bold text-foreground">{procedure.uco}</p>
                </div>
              </div>
              
              {procedure.surgicalTime && (
                <div className="flex items-center gap-2 mt-4 p-3 bg-muted rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tempo Cirúrgico Médio</p>
                    <p className="font-semibold text-foreground">{procedure.surgicalTime} minutos</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CIDs Card */}
          <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">CIDs Associados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {procedure.cids.map((cid) => (
                  <Badge 
                    key={cid} 
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleCopy(cid, `CID ${cid}`)}
                  >
                    {cid}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Description Card */}
          <Card className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Descrição Técnica</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {procedure.description}
              </p>
            </CardContent>
          </Card>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}
