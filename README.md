# DevReady

Plataforma de preparação para processos seletivos de tecnologia, desenvolvida para o **Hackathon Comunidade Juninhos & Nortjobs**.

O DevReady ajuda pessoas em início de carreira a entender o que uma vaga exige, identificar competências que precisam de reforço e praticar entrevistas com feedback objetivo. Nesta versão de demonstração, todos os dados são fictícios e o processamento do agente acontece localmente no navegador.

## O problema

Profissionais juniores costumam encontrar descrições de vaga extensas, requisitos pouco claros e dificuldade para transformar um resultado de avaliação em um próximo passo prático. O DevReady organiza essa jornada em três etapas:

1. interpretar os requisitos da vaga;
2. praticar competências técnicas e comportamentais;
3. transformar o desempenho em um plano de evolução.

## Principais funcionalidades

- autenticação, cadastro, verificação de e-mail e recuperação de senha;
- dashboard com prontidão geral, evolução e notas por tecnologia;
- perfil técnico com área de interesse e nível de experiência;
- criação de sessão a partir de uma descrição de vaga ou imagem;
- resultado demonstrativo com compatibilidade e modalidades de treino;
- agente de entrevista técnica, comportamental ou mista;
- identidade visual com mascote contextual em carregamentos, orientação e estados de sucesso;
- banco com **35 perguntas por área técnica**;
- seleção manual da área ou detecção pela descrição da vaga;
- perguntas adaptadas às lacunas encontradas nas respostas;
- feedback explicável por conteúdo, clareza, evidências e estrutura;
- identificação das competências mais fortes e prioritárias;
- ciclo de preparação de 7 dias com progresso salvo no dispositivo.

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

Com `NEXT_PUBLIC_DEMO_MODE=true`, todos os fluxos utilizam informações fictícias e podem ser apresentados sem conexão com dados pessoais.

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
| `RESEND_API_KEY` | Chave do serviço de envio de e-mails |
| `EMAIL_FROM` | Remetente das mensagens de autenticação |

Nunca publique o arquivo `.env` nem utilize os valores ilustrativos de `.env.example` em produção.

## Comandos de qualidade

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Rotas principais

| Rota | Função |
| --- | --- |
| `/login` | Acesso à plataforma |
| `/cadastro` | Criação de conta |
| `/esqueci-senha` | Recuperação de acesso |
| `/politica-de-privacidade` | Informações de privacidade e LGPD |
| `/dashboard` | Visão geral de prontidão e evolução |
| `/dashboard/perfil` | Dados pessoais e perfil técnico |
| `/dashboard/nova-sessao` | Configuração de uma análise por vaga |
| `/dashboard/resultado` | Resultado e modalidades de treino |
| `/dashboard/agente` | Entrevista adaptativa e ciclo de 7 dias |

## Dados fictícios, privacidade e limitações

- dashboard, perfil, notas, GitHub, vagas e resultados utilizam dados fictícios no modo demo;
- novas sessões ficam no `sessionStorage` do navegador;
- respostas e progresso do agente ficam no armazenamento local do navegador;
- imagens e currículos são validados localmente e não são enviados nesta demonstração;
- o agente usa avaliação determinística e não envia respostas para uma IA externa;
- o consentimento para currículo e GitHub é solicitado explicitamente no cadastro;
- a exclusão de conta é simulada no modo demo e utiliza exclusão em cascata no modo autenticado.

Antes de aceitar currículos reais em produção, o projeto precisa utilizar armazenamento privado e persistente. O sistema de arquivos temporário de plataformas serverless não deve ser usado para documentos pessoais.

## Equipe e responsabilidades

| Integrante | Responsabilidades principais |
| --- | --- |
| Isabela Duarte | Dashboard, perfil, privacidade e LGPD, auditoria de experiência, agente de entrevista e ciclo de 7 dias |
| João Pedro Panza Mainieri | Autenticação, cadastro e análise de perfil |
| Eduarda (Duda) | Design, Figma, onboarding e trilha de estudo |
| Geovanna | Sessões de treino por vaga e modalidades de treino |

## Uso de inteligência artificial no desenvolvimento

O **OpenAI Codex** apoiou a equipe na revisão de código, identificação de inconsistências, refinamento de experiência, implementação assistida, validação de fluxos e organização da documentação. Todas as alterações foram revisadas e testadas antes de serem incorporadas ao projeto.

O agente apresentado pelo DevReady nesta versão não consome um modelo externo: as perguntas, adaptações e avaliações são processadas localmente para garantir uma demonstração reproduzível e sem envio de dados pessoais.

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
