# runChapter

App de competição interna para o time acompanhar quantos capítulos de um curso cada pessoa já assistiu.

## Setup

1. Instale as dependências:
   ```
   npm install
   ```

2. Crie um projeto em https://supabase.com/dashboard e rode o script `src/db/schema.sql` no SQL Editor do projeto.

3. Copie `.env.local.example` para `.env.local` e preencha com a URL e a anon key do seu projeto Supabase (em Project Settings → API).

4. Rode o projeto:
   ```
   npm run dev
   ```

## Estrutura

- `src/db/schema.sql` — schema do banco (teams, profiles, chapter_entries) com Row Level Security
- `src/lib/supabase/` — clients do Supabase (browser, server, middleware de sessão)
- `src/app/login` — tela de login/cadastro (com seleção de time)
- `src/app/page.tsx` — leaderboard + formulário de registrar capítulo assistido
- `src/app/actions.ts` — server actions (registrar capítulo, logout)
- `src/components/Leaderboard.tsx` — leaderboard estilo "pista de corrida"
# runChapter
