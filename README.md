# DevReady

Plataforma de preparação técnica por vaga criada para o Hackathon Comunidade Juninhos & Nortjobs. O DevReady compara o perfil do candidato com requisitos reais, organiza treinos direcionados e transforma resultados em um plano claro de evolução.

## Stack

- Next.js 16 com App Router e TypeScript
- React 19 e Tailwind CSS 4
- PostgreSQL com Prisma ORM 7
- Better Auth
- Lucide React

## Executar localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env` e preencha as variáveis.

   - `DATABASE_URL`: conexão PostgreSQL.
   - `BETTER_AUTH_URL` e `BETTER_AUTH_SECRET`: URL pública e segredo da autenticação.
   - `RESEND_API_KEY` e `EMAIL_FROM`: envio de verificação e recuperação de senha.
   - `NEXT_PUBLIC_DEMO_MODE=true`: libera a apresentação com perfil, notas, histórico e fluxos 100% fictícios, sem exigir login.
   - `NEXT_PUBLIC_TRAINING_ROUTES_ENABLED=false`: evita links quebrados enquanto as telas de nova sessão e resultado ainda não estiverem integradas.

3. Valide o schema e gere o Prisma Client:

   ```bash
   npx prisma validate
   npx prisma generate
   ```

4. Inicie o projeto:

   ```bash
   npm run dev
   ```

A aplicação estará disponível em `http://localhost:3000`.

## Rotas atuais

- `/login` — acesso à conta
- `/cadastro` — cadastro em duas etapas
- `/esqueci-senha` e `/redefinir-senha` — recuperação de acesso
- `/verifique-email` — orientação após o cadastro
- `/politica-de-privacidade` — informações de privacidade e LGPD
- `/dashboard` — prontidão, notas, GitHub e histórico de evolução
- `/dashboard/perfil` — dados pessoais e perfil técnico

As telas de nova sessão e resultado estão sendo desenvolvidas em branches próprias da equipe e devem ser integradas pelo fluxo oficial de revisão.

O upload do currículo exige a definição de um armazenamento privado e persistente antes do deploy. Não utilize o sistema de arquivos da Vercel para currículos. Até essa integração, o seletor valida o PDF, mas o arquivo não é enviado ao servidor.

## Dados de demonstração e privacidade

O deploy do hackathon deve manter `NEXT_PUBLIC_DEMO_MODE=true`. O dashboard, o perfil, as notas, o GitHub e o histórico usam somente dados fictícios definidos em `lib/dashboard-data.ts` e `lib/demo-mode.ts`. A interface identifica esse estado para não confundir a demonstração com dados reais.

O cadastro exige consentimento explícito para uso do currículo e do GitHub, validado também no servidor e persistido no usuário. Em modo autenticado, a exclusão de conta remove o usuário; sessões e contas de autenticação relacionadas usam exclusão em cascata. No modo demonstração, o mesmo fluxo é simulado para não alterar informações.

## Validação

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Entrega do hackathon

Antes da entrega final, o README deve incluir os nomes e as responsabilidades de cada integrante, o link do deploy, o link público do pitch e as ferramentas de IA utilizadas pela equipe com a descrição das etapas em que auxiliaram.
