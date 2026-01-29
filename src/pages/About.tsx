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
      description: 'Encontre procedimentos por nome, código TUSS ou palavra-chave na base com 6.400+ códigos.',
    },
    {
      icon: Heart,
      title: 'Favoritos e Pacotes',
      description: 'Salve favoritos e crie pacotes personalizados de procedimentos isolados por usuário.',
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
          <p className="text-white/90 text-lg">
            Sua referência rápida para códigos TUSS de procedimentos médicos
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
              <CardTitle className="text-lg">Sobre o TussPack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                O TussPack foi desenvolvido para facilitar a busca e consulta de códigos de procedimentos médicos utilizando a tabela TUSS (Terminologia Unificada da Saúde Suplementar).
              </p>
              <p>
                <strong className="text-foreground">Versão 2.0 - Recursos Implementados:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>✅ Sistema de autenticação com login e cadastro</li>
                <li>✅ Isolamento de dados por usuário</li>
                <li>✅ Favoritos independentes por conta</li>
                <li>✅ Pacotes personalizados de procedimentos</li>
                <li>✅ Base de dados real com 6.400+ códigos TUSS</li>
                <li>✅ Busca inteligente por nome, código ou palavra-chave</li>
                <li>✅ PWA instalável (funciona offline)</li>
                <li>✅ Exportação de pacotes com formatação</li>
              </ul>
              <p>
                <strong className="text-foreground">Próximas funcionalidades:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Calculadora de honorários por procedimento</li>
                <li>Gerador de documentos TISS</li>
                <li>Sincronização na nuvem entre dispositivos</li>
                <li>Recuperação de senha</li>
                <li>Perfil de usuário com configurações</li>
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
