import { Logo } from '@/components/Logo';
import { BottomNav } from '@/components/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bone, Heart, Search, Smartphone, Shield } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: Search,
      title: 'Busca Inteligente',
      description: 'Encontre procedimentos por nome, código CBHPM, TUSS, SUS ou CID.',
    },
    {
      icon: Heart,
      title: 'Favoritos Offline',
      description: 'Salve seus procedimentos mais usados e acesse mesmo sem internet.',
    },
    {
      icon: Smartphone,
      title: 'Instalável',
      description: 'Adicione à tela inicial do seu celular como um aplicativo nativo.',
    },
    {
      icon: Shield,
      title: '100% Gratuito',
      description: 'Todas as funcionalidades disponíveis gratuitamente.',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="medical-gradient pt-8 pb-12 px-4 safe-area-top">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <p className="text-primary-foreground/90 text-lg">
            Sua referência rápida para códigos de procedimentos ortopédicos
          </p>
          <Badge className="mt-4 bg-primary-foreground/20 text-primary-foreground border-0">
            Versão 2.0 MVP
          </Badge>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 -mt-4">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Features */}
          <div className="grid gap-4">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="animate-fade-in">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sobre o OrthoCode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                O OrthoCode foi desenvolvido para facilitar a busca e consulta de códigos de procedimentos ortopédicos utilizados nas principais tabelas de referência: CBHPM, TUSS e SUS.
              </p>
              <p>
                Esta é uma versão MVP (Produto Mínimo Viável) focada em validar a utilidade da ferramenta. Os dados atuais são exemplos estruturados que serão substituídos por dados reais.
              </p>
              <p>
                <strong className="text-foreground">Próximas funcionalidades:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Importação de dados reais via Excel/CSV</li>
                <li>Calculadora de honorários</li>
                <li>Gerador de documentos TISS</li>
                <li>Sincronização na nuvem</li>
              </ul>
            </CardContent>
          </Card>

          {/* Legal */}
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground text-center">
                Este aplicativo é uma ferramenta de consulta e não substitui a verificação oficial junto às operadoras e órgãos reguladores. Os valores são referências e podem variar.
              </p>
            </CardContent>
          </Card>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}
