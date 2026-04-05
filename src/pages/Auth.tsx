import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageShell } from '@/components/PageShell';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const { login, signup, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/');
    }
  }, [authLoading, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginEmail, loginPassword);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (signupPassword !== signupPasswordConfirm) {
      setError('As senhas não correspondem');
      return;
    }

    setLoading(true);
    try {
      await signup(signupName, signupEmail, signupPassword);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      className="bg-muted/30"
      containerClassName="max-w-md"
      mainClassName="min-h-[calc(100vh-2rem)] flex items-center justify-center py-10"
    >
      <Card className="w-full border-border/70 shadow-sm">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Cadastro</TabsTrigger>
          </TabsList>

          {/* LOGIN */}
          <TabsContent value="login" className="p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Bem-vindo</h2>
            <p className="text-muted-foreground text-sm mb-6">Entre com suas credenciais</p>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-foreground mb-1">
                  Email
                </label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-foreground mb-1">
                  Senha
                </label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Carregando...' : 'Entrar'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Não tem conta? Use a aba "Cadastro" para se registrar
            </p>
          </TabsContent>

          {/* SIGNUP */}
          <TabsContent value="signup" className="p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Cadastrar</h2>
            <p className="text-muted-foreground text-sm mb-6">Crie sua conta para acessar</p>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="signup-name" className="block text-sm font-medium text-foreground mb-1">
                  Nome Completo
                </label>
                <Input
                  id="signup-name"
                  name="name"
                  type="text"
                  placeholder="Seu Nome Completo"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="name"
                />
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-foreground mb-1">
                  Email
                </label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-foreground mb-1">
                  Senha
                </label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  placeholder="••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Mín. 6 caracteres, com letras e números
                </p>
              </div>

              <div>
                <label htmlFor="signup-password-confirm" className="block text-sm font-medium text-foreground mb-1">
                  Confirmar Senha
                </label>
                <Input
                  id="signup-password-confirm"
                  name="password-confirm"
                  type="password"
                  placeholder="••••••"
                  value={signupPasswordConfirm}
                  onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Carregando...' : 'Cadastrar'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Já tem conta? Use a aba "Login" para entrar
            </p>
          </TabsContent>
        </Tabs>
      </Card>
    </PageShell>
  );
}
