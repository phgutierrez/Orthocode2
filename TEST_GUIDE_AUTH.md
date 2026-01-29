# 🔐 Guia de Teste - Sistema de Autenticação OrthoCode 2.0

## ✨ Tela de Login/Cadastro

Ao acessar o app, você será redirecionado para `/auth` que contém:
- **Aba Login** - Para usuários já cadastrados
- **Aba Cadastro** - Para novos usuários

---

## 📝 Casos de Teste

### ✅ Teste 1: Cadastro Simples

**Passos:**
1. Clique na aba "Cadastro"
2. Preencha os campos:
   ```
   Nome: João Silva
   Email: joao@teste.com
   Senha: Senha123
   Confirmar Senha: Senha123
   ```
3. Clique "Cadastrar"

**Resultado Esperado:**
- ✅ Cadastro realizado com sucesso
- ✅ Redirecionado para página "Buscar"
- ✅ Nome "João Silva" aparece na barra inferior

---

### ✅ Teste 2: Validação de Senha - Números

**Passos:**
1. Aba "Cadastro"
2. Tente cadastrar com:
   ```
   Nome: Maria Santos
   Email: maria@teste.com
   Senha: AbcdeFgh (sem números)
   Confirmar: AbcdeFgh
   ```
3. Clique "Cadastrar"

**Resultado Esperado:**
- ❌ Erro: "Senha deve conter pelo menos um número"
- ⚠️ Formulário volta ao estado anterior

---

### ✅ Teste 3: Validação de Senha - Letras

**Passos:**
1. Aba "Cadastro"
2. Tente cadastrar com:
   ```
   Nome: Carlos Silva
   Email: carlos@teste.com
   Senha: 123456 (sem letras)
   Confirmar: 123456
   ```

**Resultado Esperado:**
- ❌ Erro: "Senha deve conter pelo menos uma letra"

---

### ✅ Teste 4: Validação de Senha - Comprimento

**Passos:**
1. Aba "Cadastro"
2. Tente cadastrar com:
   ```
   Nome: Ana Costa
   Email: ana@teste.com
   Senha: Ab1 (menos de 6 caracteres)
   Confirmar: Ab1
   ```

**Resultado Esperado:**
- ❌ Erro: "Senha deve ter no mínimo 6 caracteres"

---

### ✅ Teste 5: Senhas Não Conferem

**Passos:**
1. Aba "Cadastro"
2. Preencha:
   ```
   Nome: Pedro Oliveira
   Email: pedro@teste.com
   Senha: Senha123
   Confirmar: Senha456 (diferente)
   ```
3. Clique "Cadastrar"

**Resultado Esperado:**
- ❌ Erro: "As senhas não correspondem"

---

### ✅ Teste 6: Email Duplicado

**Passos:**
1. Primeiro cadastro com "joao@teste.com" + "Senha123"
2. Tente cadastrar novamente com mesmo email

**Resultado Esperado:**
- ❌ Erro: "Este email já está registrado"

---

### ✅ Teste 7: Login com Credenciais Corretas

**Passos:**
1. Aba "Login"
2. Preencha:
   ```
   Email: joao@teste.com
   Senha: Senha123
   ```
3. Clique "Entrar"

**Resultado Esperado:**
- ✅ Login realizado com sucesso
- ✅ Redirecionado para página "Buscar"
- ✅ Nome "João Silva" aparece na barra

---

### ✅ Teste 8: Login com Email Incorreto

**Passos:**
1. Aba "Login"
2. Preencha:
   ```
   Email: naoexiste@teste.com
   Senha: Senha123
   ```

**Resultado Esperado:**
- ❌ Erro: "Email ou senha inválidos"

---

### ✅ Teste 9: Login com Senha Incorreta

**Passos:**
1. Aba "Login"
2. Preencha:
   ```
   Email: joao@teste.com
   Senha: SenhaErrada123
   ```

**Resultado Esperado:**
- ❌ Erro: "Email ou senha inválidos"

---

## 🎯 Testes de Isolamento de Dados

### ✅ Teste 10: Favoritos Isolados por Usuário

**Passos:**
1. **Usuário 1**: Cadastre com "user1@teste.com"
   - Busque por um procedimento (ex: "implante")
   - Clique no ❤️ para adicionar aos favoritos
   - Vá para aba "Favoritos" → veja o procedimento

2. **Logout**: Clique no ícone 🚪 (logout) na barra inferior

3. **Usuário 2**: Cadastre com "user2@teste.com"
   - Vá para aba "Favoritos" → **deve estar vazio**
   - Busque outro procedimento e adicione aos favoritos

4. **Logout e Login com Usuário 1**
   - Vá para "Favoritos" → **primeiro procedimento permanece**
   - Segundo procedimento de User2 NÃO aparece

**Resultado Esperado:**
- ✅ Cada usuário tem seus próprios favoritos isolados
- ✅ Dados de User1 não se misturam com User2

---

### ✅ Teste 11: Pacotes Isolados por Usuário

**Passos:**
1. **Usuário 1**: Logado como "joao@teste.com"
   - Vá para aba "Pacotes"
   - Crie um novo pacote: "Ortopedia Geral"
   - Adicione alguns procedimentos

2. **Logout**: Clique no ícone 🚪

3. **Usuário 2**: Cadastre com "novo@teste.com"
   - Vá para "Pacotes" → **deve estar vazio**
   - Crie um novo pacote: "Traumatologia"

4. **Logout e Login com Usuário 1**
   - Vá para "Pacotes" → **pacote "Ortopedia Geral" permanece**
   - Pacote "Traumatologia" de User2 NÃO aparece

**Resultado Esperado:**
- ✅ Cada usuário tem seus próprios pacotes isolados
- ✅ Histórico é preservado entre sessões

---

### ✅ Teste 12: Persistência Entre Abas

**Passos:**
1. Faça login com um usuário
2. Adicione alguns favoritos
3. Crie um pacote
4. **Recarregue a página** (F5 ou Cmd+R)

**Resultado Esperado:**
- ✅ Continua logado com o mesmo usuário
- ✅ Favoritos e pacotes são mantidos
- ✅ Dados recuperados do localStorage

---

### ✅ Teste 13: Proteção de Rotas

**Passos:**
1. Faça logout (ou abra incógnito)
2. Tente acessar diretamente:
   - `/` (home)
   - `/favorites`
   - `/packages`
   - `/about`

**Resultado Esperado:**
- ✅ Todas redirecionam para `/auth`
- ✅ Mensagem de "Carregando..." aparece brevemente
- ✅ Apenas usuário autenticado pode acessar

---

## 🔍 Verificação no DevTools

### localStorage Keys
Para verificar dados salvos, abra **DevTools → Application → Local Storage**:

```
orthocode_users                    // Lista de todos os usuários
orthocode_current_user             // Usuário logado agora
orthocode_favorites_user_1234567   // Favoritos do usuário
orthocode_packages_user_1234567    // Pacotes do usuário
```

### Exemplo de Estrutura:
```json
{
  "orthocode_users": [
    {
      "id": "user_1704067200000",
      "name": "João Silva",
      "email": "joao@teste.com",
      "password": "Senha123"
    }
  ],
  "orthocode_current_user": {
    "id": "user_1704067200000",
    "name": "João Silva",
    "email": "joao@teste.com"
  },
  "orthocode_favorites_user_1704067200000": [
    "proc_001",
    "proc_042"
  ]
}
```

---

## ⚠️ Notas Importantes

- **Teste Local**: Senhas são armazenadas em plaintext (localStorage). Isso é apenas para desenvolvimento.
- **Produção**: Usar backend seguro com hash bcrypt, JWT, HTTPS.
- **Múltiplos Usuários**: Abra abas diferentes ou use incógnito para testar simultaneamente.
- **Limpeza**: Para resetar, limpe localStorage → `localStorage.clear()`

---

## 🚀 Deployment

Após testes locais, faça deploy para Vercel:

```bash
git push origin main
# Vercel detecta automaticamente e faz deploy
```

Vercel URL: `https://orthocode2.vercel.app/`

---

**Last Updated:** 29 de janeiro de 2026
**Status:** ✅ Pronto para Produção (com backend seguro)
