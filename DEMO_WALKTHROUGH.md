# 🎬 Demonstração Prática - Sistema de Autenticação

## Cenário: Dois Oftalmologistas Usando o App

### 👨‍⚕️ Usuário 1: Dr. João (johao@ortho.com)
### 👩‍⚕️ Usuário 2: Dra. Maria (maria@ortho.com)

---

## 🕐 Sequência Temporal

### Dia 1 - Segunda-feira, 08h00

#### 1️⃣ Dr. João Abre o App (Primeira Vez)

```
Browser: http://localhost:8080/
         ↓
         Sem cookie/localStorage
         ↓
         AuthProvider carrega → user = null
         ↓
         ProtectedRoute redireciona → /auth
         ↓
         Mostra página de Login/Cadastro
```

**Tela do Dr. João:**
```
┌─────────────────────────────────────┐
│  Bem-vindo ao OrthoCode 2.0         │
│                                     │
│  [Login] [Cadastro] ← Cadastro ativa│
│                                     │
│  Nome Completo:  João Silva         │
│  Email:          joao@ortho.com     │
│  Senha:          MyPass123          │
│  Confirmar:      MyPass123          │
│                                     │
│  [  Cadastrar  ]                    │
└─────────────────────────────────────┘
```

#### 2️⃣ Dr. João Clica "Cadastrar"

```typescript
// AuthContext.tsx - signup()
signup("João Silva", "joao@ortho.com", "MyPass123")
  ↓
  // Validações
  ✓ MyPass123.length = 9 (>= 6)
  ✓ /[a-zA-Z]/.test("MyPass123") = true
  ✓ /[0-9]/.test("MyPass123") = true
  ✓ users.find(u => u.email === "joao@ortho.com") = undefined
  ↓
  // Criar usuário
  newUser = {
    id: "user_1704067200000",
    name: "João Silva",
    email: "joao@ortho.com",
    password: "MyPass123"
  }
  ↓
  // Salvar em localStorage
  localStorage.setItem('orthocode_users', JSON.stringify([newUser]))
  localStorage.setItem('orthocode_current_user', JSON.stringify({
    id: "user_1704067200000",
    name: "João Silva",
    email: "joao@ortho.com"
  }))
  ↓
  // Atualizar contexto
  setUser(userWithoutPassword)
  ↓
  // ProtectedRoute detecta user ≠ null
  // Renderiza <Index />
```

**localStorage do Dr. João:**
```json
{
  "orthocode_users": [{
    "id": "user_1704067200000",
    "name": "João Silva",
    "email": "joao@ortho.com",
    "password": "MyPass123"
  }],
  "orthocode_current_user": {
    "id": "user_1704067200000",
    "name": "João Silva",
    "email": "joao@ortho.com"
  }
}
```

#### 3️⃣ Dr. João Busca por Procedimentos

```
Página: /
Clique em Tab "Buscar"
Digita: "implante de córnea"
         ↓
SearchBar.tsx carrega procedimentos
         ↓
searchProcedures(procedures, "implante de córnea")
         ↓
Mostra 3 resultados
```

**Tela do Dr. João:**
```
┌─────────────────────────────────────┐
│ 🔍 implante de córnea               │
├─────────────────────────────────────┤
│ Sugestões:                          │
│ 1. Implante de Córnea Penetrante    │
│ 2. Implante Lacrimal                │
│ 3. Implante de Lente Intraocular    │
└─────────────────────────────────────┘
  [Buscar][Favoritos][Pacotes][Sobre]
            João Silva  [Sair]
```

#### 4️⃣ Dr. João Adiciona aos Favoritos

```
Clica em "Implante de Córnea Penetrante"
         ↓
useFavorites() com key = "orthocode_favorites_user_1704067200000"
         ↓
toggleFavorite("proc_001")
         ↓
localStorage.setItem(
  'orthocode_favorites_user_1704067200000',
  JSON.stringify(["proc_001"])
)
         ↓
Ícone ❤️ muda para vermelho
```

**localStorage - Favoritos:**
```json
{
  "orthocode_favorites_user_1704067200000": ["proc_001"]
}
```

#### 5️⃣ Dr. João Cria um Pacote

```
Clica em Tab "Pacotes"
         ↓
Clica "[+ Novo Pacote]"
         ↓
Preenche:
  Nome: "Cirurgias do Segmento Anterior"
  Seleção: Implante de Córnea Penetrante
         ↓
Clica "[Criar]"
         ↓
addPackage() com key = "orthocode_packages_user_1704067200000"
```

**localStorage - Pacotes:**
```json
{
  "orthocode_packages_user_1704067200000": [{
    "id": "pkg_1704067200000_123",
    "name": "Cirurgias do Segmento Anterior",
    "procedureIds": ["proc_001"],
    "createdAt": "2026-01-29T08:30:00Z",
    "updatedAt": "2026-01-29T08:30:00Z"
  }]
}
```

#### 6️⃣ Dr. João Sai do App

```
Clica ícone [🚪] na barra
         ↓
handleLogout()
  logout() → {
    setUser(null)
    localStorage.removeItem('orthocode_current_user')
  }
         ↓
navigate('/auth')
         ↓
Volta para tela de Login
```

**localStorage após logout:**
```json
{
  // Permanece - dados do usuário
  "orthocode_users": [...],
  "orthocode_favorites_user_1704067200000": [...],
  "orthocode_packages_user_1704067200000": [...],
  // Removido - sessão atual
  // "orthocode_current_user" foi deletado
}
```

---

### 🕑 Mesmo Dia - 10h00

#### 7️⃣ Dra. Maria Abre o App (Primeira Vez)

```
Browser: Mesma URL http://localhost:8080/
         ↓
         localStorage.getItem('orthocode_current_user') = null
         ↓
         Mostra /auth novamente
         ↓
         Dra. Maria clica [Cadastro]
```

**localStorage Inicial:**
```json
{
  // Do Dr. João (ainda lá!)
  "orthocode_users": [{
    "id": "user_1704067200000",
    "name": "João Silva",
    "email": "joao@ortho.com",
    "password": "MyPass123"
  }],
  "orthocode_favorites_user_1704067200000": ["proc_001"],
  "orthocode_packages_user_1704067200000": [...]
}
```

#### 8️⃣ Dra. Maria Cadastra (Sem Sucesso - Email Duplicado)

```
Tenta cadastrar com:
  Nome: Maria Silva
  Email: joao@ortho.com  ← ERRO! Já existe
  Senha: MyPassword456
         ↓
signup() valida...
         ↓
users.find(u => u.email === "joao@ortho.com") → ✓ Encontrou!
         ↓
throw Error("Este email já está registrado")
         ↓
Mostra alerta vermelho:
  "Este email já está registrado"
```

#### 9️⃣ Dra. Maria Cadastra Novamente (Sucesso)

```
Preenche:
  Nome: Maria Silva
  Email: maria@ortho.com  ← Novo email
  Senha: MariaPass456
         ↓
Todas as validações passam
         ↓
newUser = {
  id: "user_1704067200001",
  name: "Maria Silva",
  email: "maria@ortho.com",
  password: "MariaPass456"
}
         ↓
localStorage.setItem(
  'orthocode_users',
  JSON.stringify([
    { id: "user_1704067200000", ... },  ← João
    { id: "user_1704067200001", ... }   ← Maria
  ])
)
         ↓
localStorage.setItem(
  'orthocode_current_user',
  { id: "user_1704067200001", ... }  ← Maria agora
)
         ↓
Redireciona para /
```

**localStorage Após Maria Cadastrar:**
```json
{
  "orthocode_users": [
    { João... },
    { Maria... }
  ],
  "orthocode_current_user": {
    "id": "user_1704067200001",  ← Maria
    "name": "Maria Silva",
    "email": "maria@ortho.com"
  },
  // Favoritos de João permanecem
  "orthocode_favorites_user_1704067200000": ["proc_001"],
  // Maria ainda não tem favoritos
  "orthocode_packages_user_1704067200000": [...]
}
```

#### 🔟 Dra. Maria Busca e Adiciona Favoritos

```
Busca: "ceratocone"
         ↓
Encontra: "Implante Intracorneano para Ceratocone"
         ↓
Clica ❤️ para adicionar
         ↓
useFavorites() com key = "orthocode_favorites_user_1704067200001"
         ↓
localStorage.setItem(
  'orthocode_favorites_user_1704067200001',
  JSON.stringify(["proc_042"])
)
```

**localStorage Agora:**
```json
{
  "orthocode_favorites_user_1704067200000": ["proc_001"],      // João
  "orthocode_favorites_user_1704067200001": ["proc_042"],      // Maria
  "orthocode_packages_user_1704067200000": [...]               // João
  // Maria não criou pacotes ainda
}
```

#### 1️⃣1️⃣ Dra. Maria Cria Pacote Diferente

```
Clica em "Pacotes"
         ↓
Cria novo pacote:
  Nome: "Procedimentos Externos"
  Procedimentos: proc_042 (o que adicionou aos favoritos)
         ↓
localStorage.setItem(
  'orthocode_packages_user_1704067200001',
  JSON.stringify([{
    id: "pkg_1704067200001_456",
    name: "Procedimentos Externos",
    procedureIds: ["proc_042"]
  }])
)
```

---

### 🕒 Dia 2 - Terça-feira, 09h00

#### 1️⃣2️⃣ Dr. João Abre o App Novamente

```
Browser: http://localhost:8080/
         ↓
AuthProvider carrega...
         ↓
useEffect em AuthContext:
  localStorage.getItem('orthocode_current_user')
         ↓
Encontra:
  "orthocode_current_user" pode estar null (fez logout)
  OU
  Se não tivesse saído: ainda teria
         ↓
Como fez logout ontem, user = null
         ↓
ProtectedRoute redireciona → /auth
```

#### 1️⃣3️⃣ Dr. João Clica "Login"

```
Tab "Login"
         ↓
Preenche:
  Email: joao@ortho.com
  Senha: MyPass123
         ↓
login(email, password)
  users = localStorage.getItem('orthocode_users')
  found = users.find(u =>
    u.email === "joao@ortho.com" &&
    u.password === "MyPass123"
  )
         ↓
  found → ✓ Encontrou Dr. João
         ↓
  setUser(userWithoutPassword)
         ↓
  localStorage.setItem('orthocode_current_user', {...})
         ↓
  Redireciona para /
```

#### 1️⃣4️⃣ Dr. João Vê Seus Dados

```
Clica "Favoritos"
         ↓
useFavorites() carrega:
  key = "orthocode_favorites_user_1704067200000"
         ↓
  localStorage.getItem('orthocode_favorites_user_1704067200000')
  → ["proc_001"]
         ↓
  Mostra: "Implante de Córnea Penetrante" ← Seu favorito
```

#### 1️⃣5️⃣ Dr. João Clica "Pacotes"

```
usePackages() carrega:
  key = "orthocode_packages_user_1704067200000"
         ↓
  localStorage.getItem('orthocode_packages_user_1704067200000')
  → [{
    "id": "pkg_1704067200000_123",
    "name": "Cirurgias do Segmento Anterior",
    "procedureIds": ["proc_001"]
  }]
         ↓
  Mostra: "Cirurgias do Segmento Anterior" ← Seu pacote
```

**RESULTADO: ✅ Dados de Dr. João foram preservados!**

---

#### 1️⃣6️⃣ Dra. Maria Abre Outra Aba

```
Abre nova aba: http://localhost:8080/
         ↓
localStorage.getItem('orthocode_current_user')
  → null (porque Dr. João fez logout na aba anterior)
         ↓
         ESPERA! localStorage é global!
         ↓
Se Dr. João estava em outra aba... depende do timing
         ↓
Neste caso: ambos veem /auth (ninguém logado)
         ↓
Dra. Maria clica Login
         ↓
Preenche:
  Email: maria@ortho.com
  Senha: MariaPass456
         ↓
Login bem-sucedido
         ↓
localStorage.setItem('orthocode_current_user', maria_user)
         ↓
Redireciona para /
```

#### 1️⃣7️⃣ Dra. Maria Vê Seus Dados

```
Clica "Favoritos"
         ↓
useFavorites() com:
  key = "orthocode_favorites_user_1704067200001"
         ↓
  Mostra: ["proc_042"] → "Implante Intracorneano para Ceratocone"
         ↓
  Favorito de João NÃO aparece ✓
```

```
Clica "Pacotes"
         ↓
usePackages() com:
  key = "orthocode_packages_user_1704067200001"
         ↓
  Mostra: [
    {
      "name": "Procedimentos Externos",
      "procedureIds": ["proc_042"]
    }
  ]
         ↓
  Pacote de João NÃO aparece ✓
```

**RESULTADO: ✅ Dados de Dra. Maria estão isolados!**

---

## 📊 Estado Final do localStorage

```json
{
  "orthocode_users": [
    {
      "id": "user_1704067200000",
      "name": "João Silva",
      "email": "joao@ortho.com",
      "password": "MyPass123"
    },
    {
      "id": "user_1704067200001",
      "name": "Maria Silva",
      "email": "maria@ortho.com",
      "password": "MariaPass456"
    }
  ],
  
  "orthocode_current_user": {
    "id": "user_1704067200001",  ← Maria (última a fazer login)
    "name": "Maria Silva",
    "email": "maria@ortho.com"
  },
  
  "orthocode_favorites_user_1704067200000": ["proc_001"],
  "orthocode_favorites_user_1704067200001": ["proc_042"],
  
  "orthocode_packages_user_1704067200000": [
    {
      "id": "pkg_1704067200000_123",
      "name": "Cirurgias do Segmento Anterior",
      "procedureIds": ["proc_001"],
      "createdAt": "2026-01-29T08:30:00Z",
      "updatedAt": "2026-01-29T08:30:00Z"
    }
  ],
  
  "orthocode_packages_user_1704067200001": [
    {
      "id": "pkg_1704067200001_456",
      "name": "Procedimentos Externos",
      "procedureIds": ["proc_042"],
      "createdAt": "2026-01-29T10:15:00Z",
      "updatedAt": "2026-01-29T10:15:00Z"
    }
  ]
}
```

---

## 🎯 Conclusões

✅ **Isolamento Funcionando:**
- Cada usuário tem seus favoritos isolados
- Cada usuário tem seus pacotes isolados
- Dados persistem entre sessões
- Logout limpa sessão atual mas mantém dados

✅ **Segurança Básica:**
- Email único (sem duplicatas)
- Validação de senha
- Proteção de rotas

⚠️ **Próximos Passos:**
- Backend real com JWT
- Criptografia de senha (bcrypt)
- HTTPS obrigatório

---

**Demonstração concluída com sucesso! 🎉**
