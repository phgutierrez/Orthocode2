# Product Requirements Document (PRD) — OrthoCode 2.0

Sistema de Códigos e Gestão de Procedimentos Ortopédicos

**Data:** Janeiro 2026  
**Versão:** 1.0  
**Responsável:** Cristiano (Pediatric Physician & Product Developer)  
**Status:** Documento vivo — sujeito a atualizações  
**Próxima revisão:** Após validação com ortopedistas

---

## 1. Visão Geral do Produto

### 1.1 Resumo Executivo

OrthoCode é uma aplicação mobile (iOS/Android) e PWA desenvolvida para otimizar o trabalho administrativo de ortopedistas, oferecendo acesso rápido e inteligente aos códigos CBHPM, TUSS e SUS de procedimentos ortopédicos, além de ferramentas para gestão de autorizações, cálculo de honorários e documentação cirúrgica.

### 1.2 Análise da Versão Atual

**Pontos fortes identificados**

- Proposta clara: facilitar acesso aos códigos CBHPM
- Não coleta dados do usuário (privacidade)
- Desenvolvido por empresa brasileira (Mocka Negócios Tecnológicos)

**Gaps e oportunidades (baseado em reviews)**

- Falta de códigos importantes no banco de dados
- Ausência de tabela SUS (solicitação recorrente)
- Problemas de recuperação de senha
- Sem função para usuário adicionar códigos personalizados
- Última atualização em agosto de 2021 (app desatualizado)
- Tamanho grande (84,8 MB) para funcionalidade oferecida

### 1.3 Problema a Resolver

**Dores principais dos ortopedistas**

- Perda de tempo buscando códigos CBHPM/TUSS durante atendimento
- Erros de codificação que geram glosas e retrabalho administrativo
- Dificuldade em precificar procedimentos corretamente
- Burocracia para autorizações de cirurgias
- Falta de base unificada (CBHPM + SUS + TUSS)
- Ausência de histórico de procedimentos realizados

### 1.4 Público-Alvo

**Primário**

- Ortopedistas (consultório, hospital, emergência)
- Cirurgiões ortopédicos
- Residentes de ortopedia (R1–R4)

**Secundário**

- Secretárias de consultórios ortopédicos
- Administradores de clínicas
- Equipes de faturamento hospitalar
- Auditores médicos

### 1.5 Objetivos do Produto (KPIs)

**Eficiência**

- Reduzir em 80% o tempo de busca de códigos (de ~5 min para ~1 min)
- Aumentar para 95% a taxa de codificação correta (redução de glosas)

**Engajamento**

- 70% dos usuários retornam ao app semanalmente
- Tempo médio de sessão: 3–5 minutos
- NPS (Net Promoter Score) > 50

**Crescimento**

- 10.000 downloads nos primeiros 6 meses
- 30% de conversão freemium → premium
- Churn < 5% ao mês

---

## 2. Requisitos Funcionais

### 2.1 Sistema de Busca Inteligente de Códigos

#### 2.1.1 Múltiplas Tabelas de Referência

**Tabelas suportadas**

- **CBHPM** (Classificação Brasileira Hierarquizada de Procedimentos Médicos)
  - Versão vigente (2024/2025)
  - Versões anteriores (histórico)
  - Porte anestésico associado
- **TUSS** (Terminologia Unificada da Saúde Suplementar)
  - Códigos AMB (Associação Médica Brasileira)
  - Mapeamento CBHPM ↔ TUSS
- **SUS/SIGTAP** (Sistema de Gerenciamento da Tabela de Procedimentos)
  - Procedimentos SUS
  - Valores de referência
- **Tabelas de Convênios**
  - Valores negociados (customizável por usuário)
  - Particularidades por operadora

#### 2.1.2 Mecanismo de Busca Avançado

**Busca por texto natural — exemplos de queries**

- “fratura fêmur”
- “artroscopia joelho menisco”
- “redução luxação ombro”
- “correção pé torto”

**Filtros disponíveis**

- Por região anatômica (coluna, MMSS, MMII, pelve, etc.)
- Por tipo de procedimento (cirúrgico, ambulatorial, diagnóstico)
- Por porte cirúrgico (1 a 4)
- Por via de acesso (aberta, videoassistida, percutânea)
- Por faixa etária (pediátrico, adulto)

**Recursos inteligentes**

- Sugestões automáticas enquanto digita
- Busca fonética (tolera erros de digitação)
- Sinônimos médicos (“LCA” = “ligamento cruzado anterior”)
- Busca por CID associado
- Histórico de buscas personalizadas

#### 2.1.3 Visualização de Resultados

**Informações detalhadas por código**

- Nome completo do procedimento
- Código CBHPM/TUSS/SUS
- Valor da tabela (atualizado automaticamente)
- Porte anestésico e UCO (Unidade de Custo Operacional)
- Descrição técnica do procedimento
- Materiais e órteses frequentemente associados (OPMEs)
- Códigos auxiliares (anestesia, SADT, taxas)
- CIDs mais comuns associados
- Tempo cirúrgico médio
- Observações e particularidades
- Status na ANS (rol obrigatório/não obrigatório)

### 2.2 Calculadora de Honorários

#### 2.2.1 Cálculo Inteligente

**Inputs**

- Procedimento(s) principal(is)
- Procedimento(s) adicional(is) (com aplicação de % de redução)
- Porte anestésico
- Tabela de referência (CBHPM, convênio específico)
- Multiplicador (filme, CH particular)
- Acréscimos (plantão, urgência, horário noturno)

**Output**

- Valor total dos honorários médicos
- Breakdown itemizado
- Valor da anestesia (orientativo)
- Estimativa de materiais/OPMEs
- Valor final para o paciente

**Cenários suportados**

- Cirurgia eletiva simples
- Múltiplos procedimentos (redução automática de %)
- Cirurgia de urgência/emergência (acréscimos)
- Cirurgia com equipe (divisão de honorários)
- Particular com filme customizado

#### 2.2.2 Simulador de Glosa

- Comparação: valor solicitado vs. valor pago historicamente
- Alertas de divergências comuns
- Sugestões de códigos alternativos aceitos

### 2.3 Gerador de Documentos

#### 2.3.1 Guia TISS

(Guia de Solicitação de Autorização de Internação — SADT)

**Campos pré-preenchidos**

- Dados do procedimento (código + descrição)
- CID associado
- Justificativa técnica padrão (customizável)
- Materiais necessários (OPMEs)

**Funcionalidades**

- Templates de justificativa por tipo de cirurgia
- Banco de textos padrão editáveis
- Anexo de exames/laudos (upload de imagens/PDFs)
- Envio direto por e-mail/WhatsApp

#### 2.3.2 Orçamento para Paciente Particular

**Componentes do orçamento**

- Cabeçalho personalizado (logo, dados do médico)
- Dados do paciente
- Procedimento proposto
- Breakdown detalhado de custos
  - Honorários médicos
  - Honorários anestesista
  - Taxas hospitalares (estimativa)
  - Materiais/órteses
- Condições de pagamento
- Validade do orçamento
- Termos e assinatura digital

#### 2.3.3 Relatório Cirúrgico

**Template estruturado**

- Identificação do paciente
- Diagnóstico pré-operatório (CID)
- Procedimento realizado (com código)
- Descrição cirúrgica
- Materiais utilizados (OPMEs com código)
- Intercorrências
- Conduta pós-operatória

**Export**

- PDF formatado
- Integração com prontuário eletrônico (webhook/API)

---

## 3. Requisitos Não-Funcionais

### 3.1 Performance

- Tempo de busca: < 1 segundo para 95% das queries
- Tempo de carregamento inicial: < 3 segundos
- Modo offline: busca e visualização de favoritos sem internet
- Sincronização: < 5 segundos para sync de dados na nuvem
- Tamanho do app: < 40 MB (otimização vs. versão atual de 84,8 MB)

### 3.2 Usabilidade

- Interface clean e intuitiva (design médico profissional)
- Máximo 3 toques para acessar qualquer funcionalidade principal
- Acessibilidade: suporte a VoiceOver/TalkBack
- Onboarding interativo (< 2 minutos)

### 3.3 Segurança e Privacidade

- Autenticação: e-mail/senha + biometria (Face ID/Touch ID)
- Recuperação de senha: fluxo via e-mail/SMS
- Criptografia: dados sensíveis (valores customizados) criptografados end-to-end
- LGPD compliance: não coleta dados de pacientes identificáveis
- Backup: automático na nuvem (opcional, desligável)

### 3.4 Compatibilidade

- iOS: 14.0 ou superior (95% dos devices)
- Android: 8.0 (Oreo) ou superior
- PWA: navegadores modernos (Chrome, Safari, Edge)
- Tablets: layout responsivo otimizado

---

## 4. Modelo de Monetização

### 4.1 Modelo Freemium

**Plano Gratuito**

- Busca ilimitada de códigos CBHPM/TUSS/SUS
- Até 10 códigos favoritos
- Calculadora básica de honorários (1 cálculo/dia)
- 1 documento gerado/mês
- Ads discretos (banner inferior)

**Plano Pro — R$ 29,90/mês ou R$ 299,00/ano (17% desconto)**

- Tudo do gratuito +
- Favoritos ilimitados
- Calculadora ilimitada com templates customizados
- Geração ilimitada de documentos (TISS, orçamentos, relatórios)
- Controle de agenda e autorizações
- Tabelas customizadas de convênios
- Estatísticas e relatórios de produção
- Backup na nuvem
- Suporte prioritário
- Sem anúncios

**Plano Clínica — R$ 99,90/mês (até 5 usuários)**

- Tudo do Pro +
- Multi-usuário (dashboard compartilhado)
- Relatórios consolidados
- API para integração com sistemas próprios
- Branding customizado (logo na documentação)
- Onboarding dedicado

---

## 5. Roadmap de Desenvolvimento

### 5.1 MVP (Mínimo Produto Viável) — 3 meses

**Funcionalidades essenciais**

- Busca de códigos CBHPM + TUSS + SUS
- Visualização detalhada de procedimentos
- Sistema de favoritos
- Calculadora básica de honorários
- Autenticação (email/senha + recuperação)
- Onboarding inicial
- Apps iOS e Android nativos

**Métricas de sucesso do MVP**

- 500 downloads nos primeiros 30 dias
- 200 usuários ativos mensais
- Tempo médio de sessão > 2 minutos
- Feedback qualitativo positivo (entrevistas com 20 usuários)

### 5.2 Fase 2 — Documentação (+ 2 meses)

- Gerador de Guia TISS
- Gerador de orçamento em PDF
- Templates de justificativas
- Upload de anexos (exames)
- Compartilhamento via e-mail/WhatsApp

### 5.3 Fase 3 — Gestão (+ 2 meses)

- Agenda de cirurgias
- Controle de autorizações
- Dashboard de estatísticas
- Histórico de procedimentos
- Notificações push

### 5.4 Fase 4 — Colaboração (+ 3 meses)

- Sistema de contribuição de códigos
- Banco de valores por convênio (crowdsourced)
- Fórum de discussão
- Marketplace de templates
- Programa de afiliados

### 5.5 Fase 5 — Integrações (+ 3 meses)

- API aberta para terceiros
- Integração com prontuários eletrônicos (Tasy, MV, Philips)
- Webhooks para sistemas de faturamento
- Exportação para Excel/Google Sheets
- Modo multi-clínica

---

## 6. KPIs e Métricas de Sucesso

### 6.1 Métricas de Produto

**Engajamento**

- DAU/MAU ratio > 30% (usuários ativos diários/mensais)
- Sessões por usuário/semana: 3–5
- Tempo médio de sessão: 4–6 minutos
- Taxa de retenção (D1/D7/D30): 60%/40%/25%

**Funcionalidades**

- Buscas por usuário/mês: 20–30
- Documentos gerados/usuário/mês: 5–10
- Taxa de uso de calculadora: 40% dos usuários

**Qualidade**

- Crash-free rate > 99,5%
- App rating (App Store/Play Store) > 4,5 ★
- Tempo de carregamento < 2s (p95)

### 6.2 Métricas de Negócio

**Aquisição**

- CAC (Customer Acquisition Cost): < R$ 40
- Conversion rate (download → cadastro): > 60%
- Conversion rate (free → Pro): > 25%

**Retenção**

- Churn mensal: < 5%
- NPS (Net Promoter Score): > 50
- LTV (Lifetime Value): > R$ 600

**Receita**

- MRR (Monthly Recurring Revenue): crescimento de 20% m/m
- ARPU (Average Revenue Per User): R$ 25–30
- Payback period: < 12 meses

---

## 7. Próximos Passos

### 7.1 Validação (Semanas 1–4)

- Entrevistas com 30 ortopedistas (validação do problema)
- Levantamento completo de códigos CBHPM ortopédicos
- Prototipação em Figma (telas principais)
- Teste de usabilidade do protótipo (10 usuários)

### 7.2 Desenvolvimento do MVP (Semanas 5–16)

- Setup do projeto (React Native + Firebase)
- Implementação da busca e visualização de códigos
- Sistema de autenticação e perfil
- Calculadora de honorários
- Testes beta interno (time + 20 médicos)

### 7.3 Lançamento Soft Beta (Semanas 17–20)

- Abertura para 100 early adopters
- Coleta de feedback estruturado
- Ajustes de UX e correção de bugs críticos
- Preparação de materiais de marketing

### 7.4 Lançamento Público (Semana 21+)

- Submissão às lojas (App Store + Play Store)
- Campanha de marketing digital
- Webinar de lançamento
- Press release
