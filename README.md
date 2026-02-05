# OrthoCode 2.0

Sistema de busca e gerenciamento de códigos TUSS para procedimentos ortopédicos.

## 🏗️ Estrutura do Projeto

```
orthocode2/
├── docs/                    # Documentação e SQL
│   ├── sql/                # Scripts SQL (RLS, setup)
│   ├── setup/              # Dados de setup (tuss-data.xls)
│   └── PRD-OrthoCode-2.0.md
├── public/                  # Assets públicos e ícones
├── src/
│   ├── components/         # Componentes React
│   ├── contexts/           # Context providers (Auth)
│   ├── data/               # Dados estáticos
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilitários (Supabase)
│   ├── pages/              # Páginas da aplicação
│   └── types/              # Definições TypeScript
└── scripts/                # Scripts de build e conversão
```

## 🚀 Tecnologias

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (Auth + PostgreSQL)
- **Deploy**: Vercel

## 📦 Setup Local

```sh
# Clone o repositório
git clone https://github.com/phgutierrez/Orthocode2.git
cd Orthocode2

# Instale dependências
npm install

# Configure variáveis de ambiente
# Crie .env.local com:
# VITE_SUPABASE_URL=sua_url
# VITE_SUPABASE_ANON_KEY=sua_key

# Inicie o servidor de desenvolvimento
npm run dev
```

## 🗄️ Setup do Banco de Dados

Execute os scripts SQL em ordem no Supabase SQL Editor:

1. `docs/sql/SHARE_SETUP.sql` - Tabelas de compartilhamento
2. `docs/sql/USER_RLS_FIX.sql` - Políticas RLS de usuários
3. `docs/sql/PACKAGE_PROCEDURES_RLS.sql` - RLS de procedimentos

## 📖 Documentação

- **PRD**: `docs/PRD-OrthoCode-2.0.md`
- **Dados TUSS**: `docs/setup/tuss-data.xls`

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença proprietária.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
