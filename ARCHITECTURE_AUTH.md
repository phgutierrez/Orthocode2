# 🏗️ Arquitetura do Sistema de Autenticação

## Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│                      App.tsx                             │
│  (AuthProvider + QueryClientProvider + TooltipProvider) │
└───────────────┬─────────────────────────────────────────┘
                │
        ┌───────▼────────┐
        │  AuthContext   │
        │  (Global)      │
        └───────┬────────┘
                │
        ┌───────▼───────────────────────┐
        │   ProtectedRoute Component    │
        │  (Valida user antes de exibir)│
        └───────┬───────────────────────┘
                │
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
  Pages      Hooks        Nav
  ─────      ─────        ───
  /auth  useFavorites  BottomNav
  /      usePackages   (+ logout)
  /favorites
  /packages
  /about
```

---

## 1. AuthContext.tsx

### Responsabilidades
- Gerenciar estado global do usuário autenticado
- Fornecer métodos de login, signup e logout
- Persistir dados no localStorage
- Validação de senha

### Interface
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}
```

### localStorage Keys Usadas
```
orthocode_users           // StoredUser[] (inclui passwords)
orthocode_current_user    // User (sem password)
```

### Fluxo de Signup
```
Usuário preenche formulário
        ↓
Validação de Senha (length, letters, numbers)
        ↓
Validação de Email (não duplicado)
        ↓
Criar novo usuário com ID único
        ↓
Adicionar à lista de usuários
        ↓
Salvar em localStorage
        ↓
Atualizar contexto (user state)
        ↓
Redirecionar para página principal
```

### Fluxo de Login
```
Usuário preenche credenciais
        ↓
Buscar usuário por email na lista
        ↓
Validar senha
        ↓
Se correto: salvar user no contexto
        ↓
Se erro: mostrar mensagem de erro
```

---

## 2. Componente Auth.tsx (Página de Login/Cadastro)

### Estrutura
```
<Card>
  <Tabs defaultValue="login">
    <TabsList>
      <TabsTrigger value="login">Login</TabsTrigger>
      <TabsTrigger value="signup">Cadastro</TabsTrigger>
    </TabsList>
    
    <TabsContent value="login">
      <LoginForm />
    </TabsContent>
    
    <TabsContent value="signup">
      <SignupForm />
    </TabsContent>
  </Tabs>
</Card>
```

### Estados Gerenciados
- `loading` - Desabilita inputs durante requisição
- `error` - Mostra mensagem de erro em Alert
- `loginEmail`, `loginPassword` - Form de login
- `signupName`, `signupEmail`, `signupPassword`, `signupPasswordConfirm` - Form de cadastro

### Validações no Cliente
- Email requerido
- Senha requerida
- Confirmação de senha = senha
- Validações da senha já feitas no AuthContext

---

## 3. ProtectedRoute (em App.tsx)

### Responsabilidade
Garantir que apenas usuários autenticados acessem certas rotas

### Implementação
```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
```

### Rotas Protegidas
- `/` (Buscar)
- `/procedure/:id` (Detalhe)
- `/favorites` (Favoritos)
- `/packages` (Pacotes)
- `/about` (Sobre)

### Rota Pública
- `/auth` (Login/Cadastro)

---

## 4. Isolamento de Dados por Usuário

### useFavorites.ts
```typescript
const FAVORITES_KEY = user 
  ? `orthocode_favorites_${user.id}` 
  : 'orthocode_favorites_guest';
```

**Benefício:** Cada usuário logado tem seu próprio conjunto de favoritos isolado.

### usePackages.ts
```typescript
const PACKAGES_KEY = user 
  ? `orthocode_packages_${user.id}` 
  : 'orthocode_packages_guest';
```

**Benefício:** Cada usuário tem seus pacotes independentes.

### localStorage Keys por Usuário
```
// User1 (ID: user_1704067200000)
orthocode_favorites_user_1704067200000
orthocode_packages_user_1704067200000

// User2 (ID: user_1704067200001)
orthocode_favorites_user_1704067200001
orthocode_packages_user_1704067200001
```

---

## 5. BottomNav.tsx - Integração Logout

### Modificação
```typescript
import { useAuth } from '@/contexts/AuthContext';

export function BottomNav() {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();                // Limpar contexto
    navigate('/auth');       // Redirecionar
  };

  return (
    <nav>
      {/* Navigation items */}
      <button onClick={handleLogout}>
        <LogOut /> Sair
      </button>
    </nav>
  );
}
```

---

## 6. Fluxo Completo de Sessão

### Primeiro Acesso (Novo Usuário)
```
1. Acessa http://localhost:8080/
2. App.tsx carrega → AuthProvider inicializa
3. useAuth() verifica localStorage (vazio)
4. user = null, loading = false
5. ProtectedRoute redireciona para /auth
6. Usuário vê página de Login/Cadastro
7. Clica "Cadastro"
8. Preenche formulário + valida senha
9. Clica "Cadastrar"
10. AuthContext.signup() cria novo usuário
11. Salva em orthocode_users
12. Salva user em orthocode_current_user
13. Atualiza contexto (user state)
14. ProtectedRoute agora renderiza <Index />
```

### Segundo Acesso (Usuário Retorna)
```
1. Acessa http://localhost:8080/
2. App.tsx carrega → AuthProvider inicializa
3. useAuth() lê localStorage.getItem('orthocode_current_user')
4. user = { id, name, email }
5. Não precisa fazer login novamente
6. ProtectedRoute renderiza página diretamente
```

### Após Logout
```
1. Clica botão logout no BottomNav
2. AuthContext.logout() executa:
   - setUser(null)
   - localStorage.removeItem('orthocode_current_user')
3. ProtectedRoute detecta user = null
4. Redireciona para /auth
5. localStorage.getItem('orthocode_current_user') retorna null
```

---

## 7. Segurança - Limitações Atuais

### ⚠️ Desenvolvimento Only
- Senhas em plaintext no localStorage
- Sem criptografia
- Sem validação server-side
- localStorage pode ser lido por XSS

### ✅ Para Produção, Implementar:

1. **Backend de Autenticação**
   ```
   POST /api/auth/signup
   POST /api/auth/login
   POST /api/auth/logout
   GET /api/auth/me
   ```

2. **Hash de Senha**
   ```typescript
   import bcrypt from 'bcryptjs';
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

3. **JWT Token**
   ```typescript
   const token = jwt.sign(
     { userId: user.id },
     process.env.JWT_SECRET,
     { expiresIn: '7d' }
   );
   ```

4. **HTTPS Obrigatório**
   ```
   Configurar em .env
   VITE_API_URL=https://api.orthocode.com
   ```

5. **HttpOnly Cookies**
   ```javascript
   // Servidor retorna
   Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict
   ```

---

## 8. Diagrama de Estado (State Machine)

```
                    ┌──────────────┐
                    │   LOADING    │
                    │  (initial)   │
                    └──────┬───────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
            ▼                             ▼
      ┌──────────────┐              ┌──────────────┐
      │ UNAUTHENTICATED             │  AUTHENTICATED
      │  user = null                │  user = {...}
      └────┬─────────┬──────────────┴──────┬───────┘
           │         │                    │
       signup    login             logout  refresh
       (form)    (form)            (btn)   (reload)
           │         │                    │
           └─────────┴────────────────────┘
                     │
            localStorage.setItem(
              'orthocode_current_user',
              JSON.stringify(user)
            )
```

---

## 9. Checklist de Implementação

- [x] AuthContext criado com login/signup
- [x] Validação de senha (6+, letters, numbers)
- [x] Página Auth.tsx com tabs
- [x] ProtectedRoute para rotas privadas
- [x] localStorage persistência
- [x] Isolamento favorites por usuário
- [x] Isolamento packages por usuário
- [x] Logout button em BottomNav
- [x] Loading state durante auth check
- [x] Error handling em Auth page
- [x] Email validation (não duplicado)
- [x] Session persistence entre reloads

---

## 10. Próximos Passos Sugeridos

1. **Migrar para Backend Real**
   - Implementar API de autenticação
   - Usar JWT ou Sessions

2. **Melhorias UX**
   - Recuperação de senha
   - Verificação de email
   - Avatar/Foto do usuário

3. **Segurança Avançada**
   - 2FA (Two-Factor Authentication)
   - OAuth (Google, GitHub)
   - Rate limiting

4. **Sincronização Cloud**
   - Backup automático de favoritos
   - Sincronizar entre dispositivos
   - Histórico de atividades

---

**Arquitetura Versão:** 1.0  
**Data:** 29 de janeiro de 2026  
**Status:** ✅ Implementação Completa (Local)
