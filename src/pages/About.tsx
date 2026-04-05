import { Logo } from '@/components/Logo';
import { BottomNav } from '@/components/BottomNav';
import { PageShell } from '@/components/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Heart, Smartphone, Shield, Package, GripVertical, Layers, Zap } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: Search,
      title: 'Busca Inteligente',
      description: 'Encontre procedimentos por nome, código TUSS, CBHPM ou palavra-chave na base com 6.400+ códigos.',
    },
    {
      icon: Heart,
      title: 'Favoritos e Pacotes',
      description: 'Salve favoritos e crie pacotes personalizados. Compartilhe pacotes com colegas via convite.',
    },
    {
      icon: Package,
      title: 'Pacotes Particulares e OPMEs',
      description: 'Crie pacotes com valores de cirurgião e anestesista. Gerencie materiais e OPMEs por procedimento.',
    },
    {
      icon: GripVertical,
      title: 'Reordenação por Drag & Drop',
      description: 'Arraste e solte para reordenar seus pacotes. A ordem é salva automaticamente.',
    },
    {
      icon: Zap,
      title: 'Micro-interações e Haptics',
      description: 'Animações táteis nos botões e feedback háptico em dispositivos móveis para uma experiência premium.',
    },
    {
      icon: Smartphone,
      title: 'Instalável',
      description: 'Adicione à tela inicial como app nativo. Funciona offline com dados completos.',
    },
    {
      icon: Shield,
      title: '100% Gratuito',
      description: 'Todas as funcionalidades disponíveis gratuitamente. Sem limitações de uso.',
    },
    {
      icon: Layers,
      title: 'Design Moderno',
      description: 'Interface com gradientes, modo escuro aprimorado, skeleton loaders e animações suaves.',
    },
  ];

  return (
    <>
      <PageShell
        header={
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <Logo size="lg" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Pacotes TUSS</h1>
              <p className="text-muted-foreground text-base">
                Gerenciador completo de códigos TUSS com filtros, favoritos e pacotes personalizados
              </p>
            </div>
            <Badge className="bg-primary/10 text-primary border border-primary/20">
              Versão 2.0
            </Badge>
          </div>
        }
        headerClassName="bg-muted/30"
        containerClassName="max-w-2xl"
        mainClassName="pb-24"
      >
        <div className="space-y-6">
          {/* Features */}
          <div className="grid gap-4">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="animate-fade-in border-border/70">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
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
              <CardTitle className="text-lg">Sobre o Pacotes TUSS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Pacotes TUSS é um gerenciador completo de códigos de procedimentos médicos baseado na tabela TUSS (Terminologia Unificada da Saúde Suplementar) com suporte completo a classificação, busca e organização.
              </p>
              <p>
                <strong className="text-foreground">Versão 2.0 — Recursos Implementados:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>✅ Sistema de autenticação com login e cadastro na nuvem (Supabase)</li>
                <li>✅ Isolamento seguro de dados por usuário com RLS</li>
                <li>✅ Favoritos sincronizados em múltiplos dispositivos</li>
                <li>✅ Pacotes personalizados com descrição e compartilhamento</li>
                <li>✅ Pacotes particulares com valores de cirurgião e anestesista</li>
                <li>✅ Gerenciamento de OPMEs por procedimento</li>
                <li>✅ Notificações de recebimento e aceitação de pacotes</li>
                <li>✅ Base de dados real com 6.400+ procedimentos TUSS</li>
                <li>✅ Busca avançada por nome, código TUSS, CBHPM ou palavra-chave</li>
                <li>✅ Filtros por tipo: Cirúrgico, Ambulatorial, Diagnóstico</li>
                <li>✅ Filtros por região anatômica: 10 regiões específicas</li>
                <li>✅ Classificação por porte cirúrgico com múltiplas categorias</li>
                <li>✅ Drag &amp; drop para reordenar pacotes (ordem salva localmente)</li>
                <li>✅ Micro-interações em botões com animação de pressão</li>
                <li>✅ Skeleton loaders durante carregamento de conteúdo</li>
                <li>✅ Feedback háptico em dispositivos móveis</li>
                <li>✅ Modo escuro com gradientes aprimorados</li>
                <li>✅ PWA instalável com funcionalidade offline</li>
                <li>✅ Design responsivo mobile-first com touch targets otimizados</li>
              </ul>
              <p>
                <strong className="text-foreground">Dados inclusos:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>6.400+ procedimentos TUSS completamente catalogados</li>
                <li>Integração com tabela CBHPM 5ª edição</li>
                <li>Classificação inteligente de tipos procedimentais</li>
                <li>Mapeamento de 50+ termos anatômicos por região</li>
              </ul>
              <p>
                <strong className="text-foreground">Próximas funcionalidades:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Valores de procedimentos (CBHPM, TUSS, SUS)</li>
                <li>Calculadora de honorários por procedimento</li>
                <li>Gerador de documentos TISS</li>
                <li>Perfil de usuário com configurações personalizadas</li>
                <li>Histórico de procedimentos consultados</li>
                <li>Relatórios e análises de uso</li>
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
      </PageShell>

      <BottomNav />
    </>
  );
}
