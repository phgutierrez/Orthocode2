import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Copy, Clock, Syringe, FileText, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/BottomNav';
import { PageShell } from '@/components/PageShell';
import { SidebarNav } from '@/components/SidebarNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

Código TUSS: ${procedure.codes.tuss}

Porte: ${procedure.porte || '-'}
Porte Anestésico: ${procedure.anestheticPort || '-'}
${procedure.surgicalTime ? `Tempo Cirúrgico: ${procedure.surgicalTime} min` : ''}

CIDs: ${procedure.cids.join(', ')}

${procedure.description}
    `.trim();

    handleCopy(text, 'Informações completas');
  };

  const favorite = isFavorite(procedure.id);

  return (
    <>
      <PageShell
        header={
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-muted"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:bg-muted"
                  onClick={() => toggleFavorite(procedure.id)}
                >
                  <Heart className={cn("h-5 w-5", favorite && "fill-current text-primary")} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:bg-muted"
                  onClick={handleCopyAll}
                >
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-foreground leading-tight">
                {procedure.name}
              </h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary">
                  {typeLabels[procedure.type]}
                </Badge>
                <Badge variant="secondary">
                  {regionLabels[procedure.region]}
                </Badge>
              </div>
            </div>
          </div>
        }
        headerClassName="bg-muted/30"
        containerClassName="max-w-6xl"
        mainClassName="pb-24"
        sidebar={<SidebarNav />}
        context={
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Acoes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Button variant="outline" className="w-full" onClick={handleCopyAll}>
                Copiar detalhes
              </Button>
              <Button variant="outline" className="w-full" onClick={() => toggleFavorite(procedure.id)}>
                {favorite ? "Remover favorito" : "Salvar favorito"}
              </Button>
            </CardContent>
          </Card>
        }
      >
        <div className="space-y-4 max-w-2xl">
          {/* Codes Card */}
          <Card className="animate-slide-up">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Códigos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/60 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Código TUSS</p>
                  <p className="font-mono font-semibold text-foreground text-lg">{procedure.codes.tuss}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(procedure.codes.tuss, 'Código TUSS')}
                >
                  {copiedField === 'Código TUSS' ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
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
                <div className="p-3 bg-muted/60 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Porte</p>
                  <p className="text-xl font-semibold text-foreground">{procedure.porte || '-'}</p>
                </div>
                <div className="p-3 bg-muted/60 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Porte Anestésico</p>
                  <p className="text-xl font-semibold text-foreground">{procedure.anestheticPort || '-'}</p>
                </div>
              </div>
              
              {procedure.surgicalTime && (
                <div className="flex items-center gap-2 mt-4 p-3 bg-muted/60 rounded-lg">
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
      </PageShell>

      <BottomNav />
    </>
  );
}
