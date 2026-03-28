# Sistema de Custo Patrimonial - Prefeitura de Alagoinhas

Projeto Next.js preparado para publicação em Cloudflare, com base patrimonial de contratos alinhada às NBC TSP.

## O que vem no projeto
- dashboard de contratos patrimoniais
- classificação automática por regras
- workflow básico de revisão e aprovação
- página de login para Supabase Auth
- API routes para contratos e classificação
- scripts SQL para Supabase/PostgreSQL
- brasão institucional no portal

## Requisitos
- Node 18+
- conta no Supabase
- conta no Cloudflare

## Variáveis de ambiente
Copie `.env.example` para `.env.local` e preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Rodando localmente
```bash
npm install
npm run dev
```

## Banco de dados
No Supabase SQL Editor, execute na ordem:
1. `supabase/schema.sql`
2. `supabase/rls.sql`

Depois cadastre os usuários iniciais no Auth e na tabela `usuarios_sistema`.

## Usuários sugeridos
- admin@alagoinhas.ba.gov.br → administrador
- contador@alagoinhas.ba.gov.br → contador
- controladoria@alagoinhas.ba.gov.br → controladoria
- seduc@alagoinhas.ba.gov.br → operacional

## Publicação no Cloudflare
Este projeto usa App Router e API Routes. Para esse cenário, a recomendação atual da Cloudflare é publicar Next.js em **Workers** com o adapter **OpenNext**. Se você quiser publicar apenas uma exportação estática, aí sim use Pages com **Next.js (Static HTML Export)**, mas isso não cobre as rotas dinâmicas do sistema.

### Caminho recomendado
1. Suba este projeto para GitHub.
2. No terminal, dentro do projeto, rode o setup oficial da Cloudflare para Next.js:
```bash
npm create cloudflare@latest -- --framework=next
```
3. Aplique as variáveis de ambiente do Supabase no painel da Cloudflare.
4. Faça o deploy no Workers.

### Se você insistir em Pages
Você precisará transformar o projeto em exportação estática e perderá as API Routes. Nesse caso, use o preset **Next.js (Static HTML Export)** e diretório de saída `out`.

## Observação importante
Este projeto já está pronto como MVP publicável. Para produção institucional completa, conecte a interface às APIs de banco e autenticação em produção, em vez de depender apenas da persistência local do navegador.
