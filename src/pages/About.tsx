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
      description: 'Encontre procedimentos por nome, código TUSS, CBHPM ou palavra-chave na base com 6.400+ códigos.',
    },
    {
      icon: Heart,
      title: 'Favoritos e Pacotes',
      description: 'Salve favoritos e crie pacotes personalizados. Compartilhe pacotes com colegas via convite.',
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
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="medical-gradient pt-8 pb-12 px-4 safe-area-top">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Pacote TUSS</h1>
          <p className="text-white/90 text-lg">
            Gerenciador completo de códigos TUSS com filtros, favoritos e pacotes personalizados
          </p>
          <Badge className="mt-4 bg-white/20 text-white border-0">
            Versão 2.0
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
              <CardTitle className="text-lg">Sobre o Pacote TUSS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Pacote TUSS é um gerenciador completo de códigos de procedimentos médicos baseado na tabela TUSS (Terminologia Unificada da Saúde Suplementar) com suporte completo a classificação, busca e organização.
              </p>
              <p>
                <strong className="text-foreground">Versão 2.0 - Recursos Implementados:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>✅ Sistema de autenticação com login e cadastro na nuvem (Supabase)</li>
                <li>✅ Isolamento seguro de dados por usuário com RLS</li>
                <li>✅ Favoritos sincronizados em múltiplos dispositivos</li>
                <li>✅ Pacotes personalizados com descrição e compartilhamento</li>
                <li>✅ Notificações de recebimento e aceitação de pacotes</li>
                <li>✅ Base de dados real com 6.400+ procedimentos TUSS</li>
                <li>✅ Busca avançada por nome, código TUSS, CBHPM ou palavra-chave</li>
                <li>✅ Filtros por tipo: Cirúrgico, Ambulatorial, Diagnóstico</li>
                <li>✅ Filtros por região anatômica: 10 regiões específicas (Coluna, Ombro, Cotovelo, Mão-Punho, Quadril, Joelho, Tornozelo-Pé, etc)</li>
                <li>✅ Classificação por porte cirúrgico com múltiplas categorias</li>
                <li>✅ PWA instalável com funcionalidade offline</li>
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
                <li>Recuperação de senha avançada</li>
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
      </main>

      <BottomNav />
    </div>
  );
}
