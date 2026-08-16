# DevReady

Plataforma de preparação para processos seletivos de tecnologia, desenvolvida para o **Hackathon Comunidade Juninhos & Nortjobs**.

O DevReady ajuda pessoas em início de carreira a entender o que uma vaga exige, reunir evidências das próprias competências e praticar entrevistas com feedback objetivo. Nesta versão de demonstração, todos os dados são fictícios e o processamento do agente acontece localmente no navegador.

## O problema

Profissionais juniores costumam encontrar descrições de vaga extensas, requisitos pouco claros e dificuldade para transformar um resultado de avaliação em um próximo passo prático. O DevReady organiza a preparação como uma jornada única por vaga:

1. interpretar os requisitos;
2. produzir um diagnóstico explicável;
3. praticar competências técnicas e comportamentais;
4. simular a entrevista;
5. transformar o desempenho em um plano de evolução.

## Principais funcionalidades

- autenticação e cadastro completos no modo conectado, com acesso imediato no modo demonstrativo;
- dashboard com prontidão geral, evolução e notas por tecnologia;
- perfil técnico com área de interesse e nível de experiência;
- criação de sessão a partir de uma descrição de vaga ou imagem;
- resultado demonstrativo com compatibilidade e modalidades de treino;
- matriz de evidências com status, confiança, origem e próxima ação por competência;
- treino específico por vaga com quiz técnico, resposta STAR e desafio prático;
- agente de entrevista técnica, comportamental ou mista;
- identidade visual com mascote contextual em carregamentos, orientação e estados de sucesso;
- trilha de estudo com materiais reais recomendados para cada lacuna;
- banco com **35 perguntas por área técnica**;
- seleção manual da área ou detecção pela descrição da vaga;
- perguntas adaptadas às lacunas encontradas nas respostas;
- feedback explicável por conteúdo, clareza, evidências e estrutura;
- identificação das competências mais fortes e prioritárias;
- ciclo de preparação de 7 dias com progresso salvo no dispositivo.
- histórico por vaga e recomendação de uma única próxima melhor ação.

## Jornada orientada por evidências

Vaga, diagnóstico, prática, entrevista e plano compartilham o mesmo contexto. O usuário não precisa colar novamente a descrição ao abrir o agente e pode retomar uma preparação pelo dashboard.

O diagnóstico diferencia três situações: **demonstrado**, **em desenvolvimento** e **não evidenciado**. “Não evidenciado” não significa falta de conhecimento; significa apenas que o sistema ainda não recebeu uma resposta, tentativa ou informação de perfil capaz de sustentar aquela conclusão.

No modo demonstrativo, qualquer evidência de currículo ou GitHub é identificada como fictícia. Sem perfil processado, o sistema não inventa pontuações do candidato.

## Diferencial: preparação que continua após a entrevista

O agente não encerra a experiência exibindo apenas uma nota. Depois da última resposta, ele apresenta:

- competência mais evidente;
- prioridade de desenvolvimento;
- justificativa de cada pergunta;
- evidências encontradas e pontos ainda não demonstrados;
- plano de preparação dividido em quatro etapas ao longo de 7 dias;
- acompanhamento de progresso de 0% a 100%;
- nova sessão focada na competência com menor desempenho.

O progresso do ciclo permanece disponível após a atualização da página. Como esta é uma demonstração, ele fica armazenado somente no navegador e pode ser removido ao limpar os dados do site.

## Áreas disponíveis no agente

- Frontend
- Backend
- Full Stack
- Mobile
- Dados e BI
- Ciência de Dados e IA
- QA e Testes
- DevOps e Cloud
- Segurança da Informação
- Produto e UX/UI

## Demonstração

O modo demonstrativo vem ativo por padrão. Com `NEXT_PUBLIC_DEMO_MODE=true`, todos os fluxos utilizam informações fictícias e podem ser apresentados sem banco, integrações externas ou dados pessoais.

```text
E-mail: demo@devready.app
Senha: DevReady@2026!
```

Essas credenciais pertencem exclusivamente ao modo demonstrativo e não concedem acesso a informações reais.

## Tecnologias

- Next.js 16 com App Router
- React 19
- TypeScript
- Tailwind CSS 4
- PostgreSQL
- Prisma ORM 7
- Better Auth
- Lucide React
- Groq opcional, com contingência local para a demonstração

## Como executar localmente

### Pré-requisitos

- Node.js 20 ou superior
- npm
- PostgreSQL, caso o modo autenticado seja utilizado

### Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/juninhos-comunidade/devready.git
   cd devready
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Copie o arquivo de exemplo das variáveis de ambiente:

   ```bash
   cp .env.example .env
   ```

   No Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Gere o Prisma Client:

   ```bash
   npx prisma generate
   ```

5. Inicie o ambiente de desenvolvimento:

   ```bash
   npm run dev
   ```

6. Acesse [http://localhost:3000](http://localhost:3000).

## Variáveis de ambiente

| Variável | Finalidade |
| --- | --- |
| `NEXT_PUBLIC_DEMO_MODE` | Ativa os fluxos fictícios usados na apresentação |
| `DATABASE_URL` | Conexão PostgreSQL utilizada pelo Prisma |
| `BETTER_AUTH_URL` | URL pública da aplicação |
| `BETTER_AUTH_SECRET` | Segredo da autenticação; deve ser longo e privado |
| `GROQ_API_KEY` | Geração e avaliação por IA; o treino usa contingência local quando ausente |
| `GROQ_MODEL` | Modelo de texto utilizado pela integração Groq |
| `GROQ_VISION_MODEL` | Modelo usado para interpretar imagens de vagas |
| `GITHUB_TOKEN` | Consulta do perfil público do GitHub no modo autenticado |
| `NEXT_PUBLIC_SESSION_LIMIT` | Limite demonstrativo de sessões simultâneas, entre 3 e 5 |

Nunca publique o arquivo `.env` nem utilize os valores ilustrativos de `.env.example` em produção.

## Comandos de qualidade

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

O workflow em `.github/workflows/quality.yml` executa lint, validação de tipos, testes e build de produção em pull requests e atualizações da `main`.

## Rotas principais

| Rota | Função |
| --- | --- |
| `/login` | Acesso à plataforma |
| `/cadastro` | Criação de conta |
| `/politica-de-privacidade` | Informações de privacidade e LGPD |
| `/dashboard` | Visão geral de prontidão e evolução |
| `/dashboard/perfil` | Dados pessoais e perfil técnico |
| `/dashboard/nova-sessao` | Configuração de uma análise por vaga |
| `/dashboard/resultado` | Diagnóstico e matriz de evidências da preparação ativa |
| `/dashboard/agente` | Entrevista adaptativa e ciclo de 7 dias |
| `/dashboard/trilha` | Plano de 7 dias e materiais recomendados |
| `/dashboard/treino-vaga` | Quiz, resposta STAR e desafio prático orientados pela vaga |

## Dados fictícios, privacidade e limitações

- dashboard, perfil, notas, GitHub, vagas e resultados utilizam dados fictícios no modo demo;
- novas sessões ficam no `sessionStorage` do navegador;
- o histórico das preparações da demonstração fica no `localStorage` e pode ser retomado pelo dashboard;
- respostas e progresso do agente ficam no armazenamento local do navegador;
- o cadastro demonstrativo não envia currículo nem dados pessoais ao servidor;
- a descrição da vaga usa análise local quando a Groq não está configurada;
- o agente usa avaliação determinística e explicável no modo local e não envia respostas para uma IA externa;
- o consentimento para currículo e GitHub é solicitado explicitamente no cadastro;
- a exclusão de conta é simulada no modo demo e utiliza exclusão em cascata no modo autenticado.

Antes de aceitar currículos reais em produção, o projeto precisa utilizar armazenamento privado e persistente. O sistema de arquivos temporário de plataformas serverless não deve ser usado para documentos pessoais.

## Deploy na Vercel

O projeto possui `vercel-build` e `postinstall` para gerar o Prisma Client antes do build. Para a apresentação do hackathon, recomenda-se publicar com `NEXT_PUBLIC_DEMO_MODE=true`, garantindo um fluxo completo com dados fictícios mesmo quando serviços externos estiverem indisponíveis.

1. importe o repositório na Vercel;
2. selecione Node.js 20 ou superior;
3. para o hackathon, cadastre somente `NEXT_PUBLIC_DEMO_MODE=true` e `NEXT_PUBLIC_SESSION_LIMIT=5`;
4. publique e valide `/api/health`, `/login`, `/dashboard`, `/dashboard/nova-sessao` e `/dashboard/treino-vaga`;
5. para habilitar contas reais depois, configure as demais variáveis de `.env.example` e execute `npm run db:migrate` antes de definir `NEXT_PUBLIC_DEMO_MODE=false`.

Groq e GitHub são opcionais no modo demonstração. No modo autenticado, as respectivas credenciais liberam análise externa e consulta do perfil público.

## Equipe e responsabilidades

| Integrante | Responsabilidades principais |
| --- | --- |
| Isabela Duarte | Dashboard, perfil, privacidade e LGPD, auditoria de experiência, agente de entrevista e ciclo de 7 dias |
| João Pedro Panza Mainieri | Autenticação, cadastro e análise de perfil |
| Eduarda (Duda) | Design, Figma, onboarding e trilha de estudo |
| Geovanna | Sessões de treino por vaga e modalidades de treino |

## Referências técnicas

Os temas do banco de entrevistas foram estruturados com apoio de documentação pública e oficial:

- [MDN Curriculum](https://developer.mozilla.org/en-US/curriculum/core/)
- [React](https://react.dev/learn)
- [Android Developers](https://developer.android.com/topic/architecture)
- [Apple Developer](https://developer.apple.com/tutorials/app-dev-training)
- [Playwright](https://playwright.dev/docs/best-practices)
- [AWS Well-Architected](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)
- [OWASP Top 10](https://owasp.org/Top10/)
- [W3C Web Accessibility Initiative](https://www.w3.org/WAI/fundamentals/accessibility-principles/)

## Links da entrega

- Repositório: [github.com/juninhos-comunidade/devready](https://github.com/juninhos-comunidade/devready)
- Aplicação publicada: em publicação
- Vídeo de apresentação: em produção

---

**DevReady — preparação orientada por evidências para a próxima oportunidade.**
